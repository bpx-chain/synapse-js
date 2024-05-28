import { IProtoMessage } from "@bpx-chain/synapse-interfaces";
import { contentTopicToPubsubTopic } from "@bpx-chain/synapse-utils";
import { expect } from "chai";
import fc from "fast-check";

import { getPublicKey } from "./crypto/index.js";
import { createDecoder, createEncoder } from "./symmetric.js";

const contentTopic = "/js-waku/1/tests/bytes";
const pubsubTopic = contentTopicToPubsubTopic(contentTopic);

describe("Symmetric Encryption", function () {
  it("Round trip binary encryption [symmetric, no signature]", async function () {
    await fc.assert(
      fc.asyncProperty(
        fc.uint8Array({ minLength: 1 }),
        fc.uint8Array({ min: 1, minLength: 32, maxLength: 32 }),
        async (payload, symKey) => {
          const encoder = createEncoder({
            contentTopic,
            symKey
          });
          const bytes = await encoder.toWire({ payload });

          const decoder = createDecoder(contentTopic, symKey);
          const protoResult = await decoder.fromWireToProtoObj(bytes!);
          if (!protoResult) throw "Failed to proto decode";
          const result = await decoder.fromProtoObj(pubsubTopic, protoResult);
          if (!result) throw "Failed to decode";

          expect(result.contentTopic).to.equal(contentTopic);
          expect(result.pubsubTopic).to.equal(pubsubTopic);
          expect(result.version).to.equal(1);
          expect(result?.payload).to.deep.equal(payload);
          expect(result.signature).to.be.undefined;
          expect(result.verifySignature(new Uint8Array())).to.be.false;
          expect(result.signaturePublicKey).to.be.undefined;
        }
      )
    );
  });

  it("Round trip binary encryption [symmetric, signature]", async function () {
    await fc.assert(
      fc.asyncProperty(
        fc.uint8Array({ minLength: 1 }),
        fc.uint8Array({ min: 1, minLength: 32, maxLength: 32 }),
        fc.uint8Array({ min: 1, minLength: 32, maxLength: 32 }),
        async (payload, sigPrivKey, symKey) => {
          const sigPubKey = getPublicKey(sigPrivKey);

          const encoder = createEncoder({
            contentTopic,
            symKey,
            sigPrivKey
          });
          const bytes = await encoder.toWire({ payload });

          const decoder = createDecoder(contentTopic, symKey);
          const protoResult = await decoder.fromWireToProtoObj(bytes!);
          if (!protoResult) throw "Failed to proto decode";
          const result = await decoder.fromProtoObj(pubsubTopic, protoResult);
          if (!result) throw "Failed to decode";

          expect(result.contentTopic).to.equal(contentTopic);
          expect(result.pubsubTopic).to.equal(pubsubTopic);
          expect(result.version).to.equal(1);
          expect(result?.payload).to.deep.equal(payload);
          expect(result.signature).to.not.be.undefined;
          expect(result.verifySignature(sigPubKey)).to.be.true;
          expect(result.signaturePublicKey).to.deep.eq(sigPubKey);
        }
      )
    );
  });

  it("Check meta is set [symmetric]", async function () {
    await fc.assert(
      fc.asyncProperty(
        fc.uint8Array({ minLength: 1 }),
        fc.uint8Array({ min: 1, minLength: 32, maxLength: 32 }),
        async (payload, symKey) => {
          const metaSetter = (
            msg: IProtoMessage & { meta: undefined }
          ): Uint8Array => {
            const buffer = new ArrayBuffer(4);
            const view = new DataView(buffer);
            view.setUint32(0, msg.payload.length, false);
            return new Uint8Array(buffer);
          };

          const encoder = createEncoder({
            contentTopic,
            symKey,
            metaSetter
          });
          const bytes = await encoder.toWire({ payload });

          const decoder = createDecoder(contentTopic, symKey);
          const protoResult = await decoder.fromWireToProtoObj(bytes!);
          if (!protoResult) throw "Failed to proto decode";
          const result = await decoder.fromProtoObj(pubsubTopic, protoResult);
          if (!result) throw "Failed to decode";

          const expectedMeta = metaSetter({
            payload: protoResult.payload,
            timestamp: undefined,
            contentTopic: "",
            ephemeral: undefined,
            meta: undefined,
            rateLimitProof: undefined,
            version: undefined
          });

          expect(result.meta).to.deep.equal(expectedMeta);
        }
      )
    );
  });
});

describe("Ensures content topic is defined", () => {
  it("Encoder throws on undefined content topic", () => {
    const wrapper = function (): void {
      createEncoder({
        contentTopic: undefined as unknown as string,
        symKey: new Uint8Array()
      });
    };

    expect(wrapper).to.throw("Content topic must be specified");
  });
  it("Encoder throws on empty string content topic", () => {
    const wrapper = function (): void {
      createEncoder({ contentTopic: "", symKey: new Uint8Array() });
    };

    expect(wrapper).to.throw("Content topic must be specified");
  });
  it("Decoder throws on undefined content topic", () => {
    const wrapper = function (): void {
      createDecoder(undefined as unknown as string, new Uint8Array());
    };

    expect(wrapper).to.throw("Content topic must be specified");
  });
  it("Decoder throws on empty string content topic", () => {
    const wrapper = function (): void {
      createDecoder("", new Uint8Array());
    };

    expect(wrapper).to.throw("Content topic must be specified");
  });
});
