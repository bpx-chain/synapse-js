import { sha256 } from "@noble/hashes/sha256";
import type { IDecodedMessage, IProtoMessage } from "@synapse/interfaces";
import { isDefined } from "@synapse/utils";
import {
  bytesToUtf8,
  concat,
  numberToBytes,
  utf8ToBytes
} from "@synapse/utils/bytes";

/**
 * Deterministic Message Hashing as defined in
 * [14/WAKU2-MESSAGE](https://rfc.vac.dev/spec/14/#deterministic-message-hashing)
 */
export function messageHash(
  pubsubTopic: string,
  message: IProtoMessage | IDecodedMessage
): Uint8Array {
  const pubsubTopicBytes = utf8ToBytes(pubsubTopic);
  const contentTopicBytes = utf8ToBytes(message.contentTopic);
  const timestampBytes = tryConvertTimestampToBytes(message.timestamp);

  const bytes = concat(
    [
      pubsubTopicBytes,
      message.payload,
      contentTopicBytes,
      message.meta,
      timestampBytes
    ].filter(isDefined)
  );

  return sha256(bytes);
}

function tryConvertTimestampToBytes(
  timestamp: Date | number | bigint | undefined
): undefined | Uint8Array {
  if (!timestamp) {
    return;
  }

  return numberToBytes(timestamp.valueOf());
}

export function messageHashStr(
  pubsubTopic: string,
  message: IProtoMessage | IDecodedMessage
): string {
  const hash = messageHash(pubsubTopic, message);
  const hashStr = bytesToUtf8(hash);
  return hashStr;
}
