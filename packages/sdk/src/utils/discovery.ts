import type { PeerDiscovery } from "@libp2p/interface";
import {
  enrTree,
  wakuDnsDiscovery,
  wakuLocalPeerCacheDiscovery,
  wakuPeerExchangeDiscovery
} from "@bpx-chain/synapse-discovery";
import { type Libp2pComponents, PubsubTopic } from "@bpx-chain/synapse-interfaces";

const DEFAULT_NODE_REQUIREMENTS = {
  lightPush: 1,
  filter: 1,
  store: 1
};

export function defaultPeerDiscoveries(
  pubsubTopics: PubsubTopic[]
): ((components: Libp2pComponents) => PeerDiscovery)[] {
  const discoveries = [
    wakuDnsDiscovery([enrTree["SANDBOX"]], DEFAULT_NODE_REQUIREMENTS),
    wakuLocalPeerCacheDiscovery(),
    wakuPeerExchangeDiscovery(pubsubTopics)
  ];
  return discoveries;
}
