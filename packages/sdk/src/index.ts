export { waitForRemotePeer, createEncoder, createDecoder } from "@bpx-chain/synapse-core";
export {
  DecodedMessage,
  Decoder,
  Encoder
} from "@bpx-chain/synapse-core/lib/message/version_0";

export { utf8ToBytes, bytesToUtf8 } from "@bpx-chain/synapse-utils/bytes";

export { defaultLibp2p } from "./utils/libp2p.js";
export * from "./utils/content_topic.js";
export * from "./waku.js";

export { createLightNode } from "./light-node/index.js";
export { wakuLightPush } from "./protocols/light_push.js";
export { wakuFilter } from "./protocols/filter.js";
export { wakuStore } from "./protocols/store.js";

export * as waku from "@bpx-chain/synapse-core";
export * as utils from "@bpx-chain/synapse-utils";
export * from "@bpx-chain/synapse-interfaces";
export * as relay from "@bpx-chain/synapse-relay";
