import { IProtoMessage } from "@synapse/interfaces";
import { WakuMessage as WakuMessageProto } from "@synapse/proto";

const EmptyMessage: IProtoMessage = {
  payload: new Uint8Array(),
  contentTopic: "",
  version: undefined,
  timestamp: undefined,
  meta: undefined,
  rateLimitProof: undefined,
  ephemeral: undefined
};

export function toProtoMessage(wire: WakuMessageProto): IProtoMessage {
  return { ...EmptyMessage, ...wire };
}
