import { CustomEvent, TypedEventEmitter } from "@libp2p/interface";
import { peerDiscoverySymbol as symbol } from "@libp2p/interface";
import type {
  IdentifyResult,
  PeerDiscovery,
  PeerDiscoveryEvents,
  PeerId,
  PeerInfo
} from "@libp2p/interface";
import {
  type Libp2pComponents,
  type PeerExchangeQueryResult,
  PubsubTopic,
  Tags
} from "@bpx-chain/synapse-interfaces";
import { encodeRelayShard, Logger } from "@bpx-chain/synapse-utils";

import { PeerExchangeCodec, WakuPeerExchange } from "./waku_peer_exchange.js";

const log = new Logger("peer-exchange-discovery");

const DEFAULT_PEER_EXCHANGE_REQUEST_NODES = 10;
const DEFAULT_PEER_EXCHANGE_QUERY_INTERVAL_MS = 10 * 1000;
const DEFAULT_MAX_RETRIES = 3;

export interface Options {
  /**
   * Tag a bootstrap peer with this name before "discovering" it (default: 'bootstrap')
   */
  tagName?: string;

  /**
   * The bootstrap peer tag will have this value (default: 50)
   */
  tagValue?: number;

  /**
   * Cause the bootstrap peer tag to be removed after this number of ms (default: 2 minutes)
   */
  tagTTL?: number;
  /**
   * The interval between queries to a peer (default: 10 seconds)
   * The interval will increase by a factor of an incrementing number (starting at 1)
   * until it reaches the maximum attempts before backoff
   */
  queryInterval?: number;
  /**
   * The number of attempts before the queries to a peer are aborted (default: 3)
   */
  maxRetries?: number;
}

export const DEFAULT_PEER_EXCHANGE_TAG_NAME = Tags.PEER_EXCHANGE;
const DEFAULT_PEER_EXCHANGE_TAG_VALUE = 50;
const DEFAULT_PEER_EXCHANGE_TAG_TTL = 100_000_000;

export class PeerExchangeDiscovery
  extends TypedEventEmitter<PeerDiscoveryEvents>
  implements PeerDiscovery
{
  private readonly components: Libp2pComponents;
  private readonly peerExchange: WakuPeerExchange;
  private readonly options: Options;
  private isStarted: boolean;
  private queryingPeers: Set<string> = new Set();
  private queryAttempts: Map<string, number> = new Map();

  private readonly handleDiscoveredPeer = (
    event: CustomEvent<IdentifyResult>
  ): void => {
    const { protocols, peerId } = event.detail;

    if (
      !protocols.includes(PeerExchangeCodec) ||
      this.queryingPeers.has(peerId.toString())
    )
      return;

    this.queryingPeers.add(peerId.toString());
    this.startRecurringQueries(peerId).catch((error) =>
      log.error(`Error querying peer ${error}`)
    );
  };

  constructor(
    components: Libp2pComponents,
    pubsubTopics: PubsubTopic[],
    options: Options = {}
  ) {
    super();
    this.components = components;
    this.peerExchange = new WakuPeerExchange(components, pubsubTopics);
    this.options = options;
    this.isStarted = false;
  }

  /**
   * Start emitting events
   */
  start(): void {
    if (this.isStarted) {
      return;
    }

    log.info("Starting peer exchange node discovery, discovering peers");

    // might be better to use "peer:identify" or "peer:update"
    this.components.events.addEventListener(
      "peer:identify",
      this.handleDiscoveredPeer
    );
  }

  /**
   * Remove event listener
   */
  stop(): void {
    if (!this.isStarted) return;
    log.info("Stopping peer exchange node discovery");
    this.isStarted = false;
    this.queryingPeers.clear();
    this.components.events.removeEventListener(
      "peer:identify",
      this.handleDiscoveredPeer
    );
  }

  get [symbol](): true {
    return true;
  }

  get [Symbol.toStringTag](): string {
    return "@bpx-chain/synapse-peer-exchange";
  }

  private readonly startRecurringQueries = async (
    peerId: PeerId
  ): Promise<void> => {
    const peerIdStr = peerId.toString();
    const {
      queryInterval = DEFAULT_PEER_EXCHANGE_QUERY_INTERVAL_MS,
      maxRetries = DEFAULT_MAX_RETRIES
    } = this.options;

    log.info(
      `Querying peer: ${peerIdStr} (attempt ${
        this.queryAttempts.get(peerIdStr) ?? 1
      })`
    );

    await this.query(peerId);

    const currentAttempt = this.queryAttempts.get(peerIdStr) ?? 1;

    if (currentAttempt > maxRetries) {
      this.abortQueriesForPeer(peerIdStr);
      return;
    }

    setTimeout(() => {
      this.queryAttempts.set(peerIdStr, currentAttempt + 1);
      this.startRecurringQueries(peerId).catch((error) => {
        log.error(`Error in startRecurringQueries: ${error}`);
      });
    }, queryInterval * currentAttempt);
  };

  private async query(peerId: PeerId): Promise<PeerExchangeQueryResult> {
    const { error, peerInfos } = await this.peerExchange.query({
      numPeers: DEFAULT_PEER_EXCHANGE_REQUEST_NODES,
      peerId
    });

    if (error) {
      log.error("Peer exchange query failed", error);
      return { error, peerInfos: null };
    }

    for (const _peerInfo of peerInfos) {
      const { ENR } = _peerInfo;
      if (!ENR) {
        log.warn("No ENR in peerInfo object, skipping");
        continue;
      }

      const { peerId, peerInfo, shardInfo } = ENR;
      if (!peerId || !peerInfo) {
        continue;
      }

      const hasPeer = await this.components.peerStore.has(peerId);
      if (hasPeer) {
        continue;
      }

      // update the tags for the peer
      await this.components.peerStore.save(peerId, {
        tags: {
          [DEFAULT_PEER_EXCHANGE_TAG_NAME]: {
            value: this.options.tagValue ?? DEFAULT_PEER_EXCHANGE_TAG_VALUE,
            ttl: this.options.tagTTL ?? DEFAULT_PEER_EXCHANGE_TAG_TTL
          }
        },
        ...(shardInfo && {
          metadata: {
            shardInfo: encodeRelayShard(shardInfo)
          }
        })
      });

      log.info(`Discovered peer: ${peerId.toString()}`);

      this.dispatchEvent(
        new CustomEvent<PeerInfo>("peer", {
          detail: {
            id: peerId,
            multiaddrs: peerInfo.multiaddrs
          }
        })
      );
    }

    return { error: null, peerInfos };
  }

  private abortQueriesForPeer(peerIdStr: string): void {
    log.info(`Aborting queries for peer: ${peerIdStr}`);
    this.queryingPeers.delete(peerIdStr);
    this.queryAttempts.delete(peerIdStr);
  }
}

export function wakuPeerExchangeDiscovery(
  pubsubTopics: PubsubTopic[]
): (components: Libp2pComponents) => PeerExchangeDiscovery {
  return (components: Libp2pComponents) =>
    new PeerExchangeDiscovery(components, pubsubTopics);
}
