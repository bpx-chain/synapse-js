import {
  DecodedMessage as DecodedMessageV0,
  proto
} from "@bpx-chain/synapse-core/lib/message/version_0";
import type { IDecodedMessage } from "@bpx-chain/synapse-interfaces";
import { equals } from "uint8arrays/equals";

export class DecodedMessage
  extends DecodedMessageV0
  implements IDecodedMessage
{
  private readonly _decodedPayload: Uint8Array;

  constructor(
    pubsubTopic: string,
    proto: proto.WakuMessage,
    decodedPayload: Uint8Array,
    public signature?: Uint8Array,
    public signaturePublicKey?: Uint8Array
  ) {
    super(pubsubTopic, proto);
    this._decodedPayload = decodedPayload;
  }

  get payload(): Uint8Array {
    return this._decodedPayload;
  }

  /**
   * Verify the message's signature against the public key.
   *
   * @returns true if the signature matches the public key, false if not or if no signature is present.
   */
  verifySignature(publicKey: Uint8Array): boolean {
    if (this.signaturePublicKey) {
      return equals(this.signaturePublicKey, publicKey);
    }
    return false;
  }
}
