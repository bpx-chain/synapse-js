import { DefaultPubsubTopic } from "@bpx-chain/synapse-interfaces";
import type {
  IDecodedMessage,
  IDecoder,
  IProtoMessage
} from "@bpx-chain/synapse-interfaces";
import { TopicOnlyMessage as ProtoTopicOnlyMessage } from "@bpx-chain/synapse-proto";

export class TopicOnlyMessage implements IDecodedMessage {
  public payload: Uint8Array = new Uint8Array();
  public rateLimitProof: undefined;
  public timestamp: undefined;
  public meta: undefined;
  public ephemeral: undefined;

  constructor(
    public pubsubTopic: string,
    private proto: ProtoTopicOnlyMessage
  ) {}

  get contentTopic(): string {
    return this.proto.contentTopic;
  }
}

export class TopicOnlyDecoder implements IDecoder<TopicOnlyMessage> {
  pubsubTopic = DefaultPubsubTopic;
  public contentTopic = "";

  fromWireToProtoObj(bytes: Uint8Array): Promise<IProtoMessage | undefined> {
    const protoMessage = ProtoTopicOnlyMessage.decode(bytes);
    return Promise.resolve({
      contentTopic: protoMessage.contentTopic,
      payload: new Uint8Array(),
      rateLimitProof: undefined,
      timestamp: undefined,
      meta: undefined,
      version: undefined,
      ephemeral: undefined
    });
  }

  async fromProtoObj(
    pubsubTopic: string,
    proto: IProtoMessage
  ): Promise<TopicOnlyMessage | undefined> {
    return new TopicOnlyMessage(pubsubTopic, proto);
  }
}
