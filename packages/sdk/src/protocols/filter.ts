import type { Peer } from "@libp2p/interface";
import { FilterCore } from "@bpx-chain/synapse-core";
import {
  type Callback,
  type ContentTopic,
  CoreProtocolResult,
  CreateSubscriptionResult,
  type IAsyncIterator,
  type IDecodedMessage,
  type IDecoder,
  type IFilterSDK,
  type IProtoMessage,
  type ISubscriptionSDK,
  type Libp2p,
  type ProtocolCreateOptions,
  ProtocolError,
  type PubsubTopic,
  SDKProtocolResult,
  type ShardingParams,
  SubscribeOptions,
  type Unsubscribe
} from "@bpx-chain/synapse-interfaces";
import { messageHashStr } from "@bpx-chain/synapse-message-hash";
import { WakuMessage } from "@bpx-chain/synapse-proto";
import {
  ensurePubsubTopicIsConfigured,
  groupByContentTopic,
  Logger,
  shardInfoToPubsubTopics,
  toAsyncIterator
} from "@bpx-chain/synapse-utils";

import { BaseProtocolSDK } from "./base_protocol.js";

type SubscriptionCallback<T extends IDecodedMessage> = {
  decoders: IDecoder<T>[];
  callback: Callback<T>;
};

const log = new Logger("sdk:filter");

const MINUTE = 60 * 1000;
const DEFAULT_SUBSCRIBE_OPTIONS = {
  keepAlive: MINUTE
};
export class SubscriptionManager implements ISubscriptionSDK {
  private readonly pubsubTopic: PubsubTopic;
  readonly peers: Peer[];
  readonly receivedMessagesHashStr: string[] = [];
  private keepAliveTimer: number | null = null;

  private subscriptionCallbacks: Map<
    ContentTopic,
    SubscriptionCallback<IDecodedMessage>
  >;

  constructor(
    pubsubTopic: PubsubTopic,
    remotePeers: Peer[],
    private protocol: FilterCore
  ) {
    this.peers = remotePeers;
    this.pubsubTopic = pubsubTopic;
    this.subscriptionCallbacks = new Map();
  }

  async subscribe<T extends IDecodedMessage>(
    decoders: IDecoder<T> | IDecoder<T>[],
    callback: Callback<T>,
    options: SubscribeOptions = DEFAULT_SUBSCRIBE_OPTIONS
  ): Promise<SDKProtocolResult> {
    const decodersArray = Array.isArray(decoders) ? decoders : [decoders];

    // check that all decoders are configured for the same pubsub topic as this subscription
    for (const decoder of decodersArray) {
      if (decoder.pubsubTopic !== this.pubsubTopic) {
        return {
          failures: [
            {
              error: ProtocolError.TOPIC_DECODER_MISMATCH
            }
          ],
          successes: []
        };
      }
    }

    const decodersGroupedByCT = groupByContentTopic(decodersArray);
    const contentTopics = Array.from(decodersGroupedByCT.keys());

    const promises = this.peers.map(async (peer) =>
      this.protocol.subscribe(this.pubsubTopic, peer, contentTopics)
    );

    const results = await Promise.allSettled(promises);

    const finalResult = this.handleResult(results, "subscribe");

    // Save the callback functions by content topics so they
    // can easily be removed (reciprocally replaced) if `unsubscribe` (reciprocally `subscribe`)
    // is called for those content topics
    decodersGroupedByCT.forEach((decoders, contentTopic) => {
      // Cast the type because a given `subscriptionCallbacks` map may hold
      // Decoder that decode to different implementations of `IDecodedMessage`
      const subscriptionCallback = {
        decoders,
        callback
      } as unknown as SubscriptionCallback<IDecodedMessage>;

      // The callback and decoder may override previous values, this is on
      // purpose as the user may call `subscribe` to refresh the subscription
      this.subscriptionCallbacks.set(contentTopic, subscriptionCallback);
    });

    if (options?.keepAlive) {
      this.startKeepAlivePings(options.keepAlive);
    }

    return finalResult;
  }

  async unsubscribe(contentTopics: ContentTopic[]): Promise<SDKProtocolResult> {
    const promises = this.peers.map(async (peer) => {
      const response = await this.protocol.unsubscribe(
        this.pubsubTopic,
        peer,
        contentTopics
      );

      contentTopics.forEach((contentTopic: string) => {
        this.subscriptionCallbacks.delete(contentTopic);
      });

      return response;
    });

    const results = await Promise.allSettled(promises);
    const finalResult = this.handleResult(results, "unsubscribe");

    if (this.subscriptionCallbacks.size === 0 && this.keepAliveTimer) {
      this.stopKeepAlivePings();
    }

    return finalResult;
  }

  async ping(): Promise<SDKProtocolResult> {
    const promises = this.peers.map(async (peer) => this.protocol.ping(peer));

    const results = await Promise.allSettled(promises);

    return this.handleResult(results, "ping");
  }

  async unsubscribeAll(): Promise<SDKProtocolResult> {
    const promises = this.peers.map(async (peer) =>
      this.protocol.unsubscribeAll(this.pubsubTopic, peer)
    );

    const results = await Promise.allSettled(promises);

    this.subscriptionCallbacks.clear();

    const finalResult = this.handleResult(results, "unsubscribeAll");

    if (this.keepAliveTimer) {
      this.stopKeepAlivePings();
    }

    return finalResult;
  }

  async processIncomingMessage(message: WakuMessage): Promise<void> {
    const hashedMessageStr = messageHashStr(
      this.pubsubTopic,
      message as IProtoMessage
    );
    if (this.receivedMessagesHashStr.includes(hashedMessageStr)) {
      log.info("Message already received, skipping");
      return;
    }
    this.receivedMessagesHashStr.push(hashedMessageStr);

    const { contentTopic } = message;
    const subscriptionCallback = this.subscriptionCallbacks.get(contentTopic);
    if (!subscriptionCallback) {
      log.error("No subscription callback available for ", contentTopic);
      return;
    }
    log.info(
      "Processing message with content topic ",
      contentTopic,
      " on pubsub topic ",
      this.pubsubTopic
    );
    await pushMessage(subscriptionCallback, this.pubsubTopic, message);
  }

  private handleResult(
    results: PromiseSettledResult<CoreProtocolResult>[],
    type: "ping" | "subscribe" | "unsubscribe" | "unsubscribeAll"
  ): SDKProtocolResult {
    const result: SDKProtocolResult = { failures: [], successes: [] };

    for (const promiseResult of results) {
      if (promiseResult.status === "rejected") {
        log.error(
          `Failed to resolve ${type} promise successfully: `,
          promiseResult.reason
        );
        result.failures.push({ error: ProtocolError.GENERIC_FAIL });
      } else {
        const coreResult = promiseResult.value;
        if (coreResult.failure) {
          result.failures.push(coreResult.failure);
        } else {
          result.successes.push(coreResult.success);
        }
      }
    }

    // TODO: handle renewing faulty peers with new peers (https://github.com/bpx-chain/synapse-js/issues/1463)

    return result;
  }

  private startKeepAlivePings(interval: number): void {
    if (this.keepAliveTimer) {
      log.info("Recurring pings already set up.");
      return;
    }

    this.keepAliveTimer = setInterval(() => {
      const run = async (): Promise<void> => {
        try {
          log.info("Recurring ping to peers.");
          await this.ping();
        } catch (error) {
          log.error("Stopping recurring pings due to failure", error);
          this.stopKeepAlivePings();
        }
      };

      void run();
    }, interval) as unknown as number;
  }

  private stopKeepAlivePings(): void {
    if (!this.keepAliveTimer) {
      log.info("Already stopped recurring pings.");
      return;
    }

    log.info("Stopping recurring pings.");
    clearInterval(this.keepAliveTimer);
    this.keepAliveTimer = null;
  }
}

class FilterSDK extends BaseProtocolSDK implements IFilterSDK {
  public readonly protocol: FilterCore;

  private activeSubscriptions = new Map<string, SubscriptionManager>();
  private async handleIncomingMessage(
    pubsubTopic: PubsubTopic,
    wakuMessage: WakuMessage
  ): Promise<void> {
    const subscription = this.getActiveSubscription(pubsubTopic);
    if (!subscription) {
      log.error(`No subscription locally registered for topic ${pubsubTopic}`);
      return;
    }

    await subscription.processIncomingMessage(wakuMessage);
  }

  constructor(libp2p: Libp2p, options?: ProtocolCreateOptions) {
    super({ numPeersToUse: options?.numPeersToUse });
    this.protocol = new FilterCore(
      this.handleIncomingMessage.bind(this),
      libp2p,
      options
    );
    this.activeSubscriptions = new Map();
  }

  //TODO: move to SubscriptionManager
  private getActiveSubscription(
    pubsubTopic: PubsubTopic
  ): SubscriptionManager | undefined {
    return this.activeSubscriptions.get(pubsubTopic);
  }

  private setActiveSubscription(
    pubsubTopic: PubsubTopic,
    subscription: SubscriptionManager
  ): SubscriptionManager {
    this.activeSubscriptions.set(pubsubTopic, subscription);
    return subscription;
  }

  /**
   * Creates a new subscription to the given pubsub topic.
   * The subscription is made to multiple peers for decentralization.
   * @param pubsubTopicShardInfo The pubsub topic to subscribe to.
   * @returns The subscription object.
   */
  async createSubscription(
    pubsubTopicShardInfo: ShardingParams | PubsubTopic
  ): Promise<CreateSubscriptionResult> {
    const pubsubTopic =
      typeof pubsubTopicShardInfo == "string"
        ? pubsubTopicShardInfo
        : shardInfoToPubsubTopics(pubsubTopicShardInfo)?.[0];

    ensurePubsubTopicIsConfigured(pubsubTopic, this.protocol.pubsubTopics);

    let peers: Peer[] = [];
    try {
      peers = await this.protocol.getPeers();
    } catch (error) {
      log.error("Error getting peers to initiate subscription: ", error);
      return {
        error: ProtocolError.GENERIC_FAIL,
        subscription: null
      };
    }
    if (peers.length === 0) {
      return {
        error: ProtocolError.NO_PEER_AVAILABLE,
        subscription: null
      };
    }

    log.info(
      `Creating filter subscription with ${peers.length} peers: `,
      peers.map((peer) => peer.id.toString())
    );

    const subscription =
      this.getActiveSubscription(pubsubTopic) ??
      this.setActiveSubscription(
        pubsubTopic,
        new SubscriptionManager(pubsubTopic, peers, this.protocol)
      );

    return {
      error: null,
      subscription
    };
  }

  //TODO: remove this dependency on IReceiver
  /**
   * This method is used to satisfy the `IReceiver` interface.
   *
   * @hidden
   *
   * @param decoders The decoders to use for the subscription.
   * @param callback The callback function to use for the subscription.
   * @param opts Optional protocol options for the subscription.
   *
   * @returns A Promise that resolves to a function that unsubscribes from the subscription.
   *
   * @remarks
   * This method should not be used directly.
   * Instead, use `createSubscription` to create a new subscription.
   */
  async subscribe<T extends IDecodedMessage>(
    decoders: IDecoder<T> | IDecoder<T>[],
    callback: Callback<T>,
    options: SubscribeOptions = DEFAULT_SUBSCRIBE_OPTIONS
  ): Promise<Unsubscribe> {
    const uniquePubsubTopics = this.getUniquePubsubTopics<T>(decoders);

    if (uniquePubsubTopics.length === 0) {
      throw Error(
        "Failed to subscribe: no pubsubTopic found on decoders provided."
      );
    }

    if (uniquePubsubTopics.length > 1) {
      throw Error(
        "Failed to subscribe: all decoders should have the same pubsub topic. Use createSubscription to be more agile."
      );
    }

    const { subscription, error } = await this.createSubscription(
      uniquePubsubTopics[0]
    );

    if (error) {
      throw Error(`Failed to create subscription: ${error}`);
    }

    await subscription.subscribe(decoders, callback, options);

    const contentTopics = Array.from(
      groupByContentTopic(
        Array.isArray(decoders) ? decoders : [decoders]
      ).keys()
    );

    return async () => {
      await subscription.unsubscribe(contentTopics);
    };
  }

  public toSubscriptionIterator<T extends IDecodedMessage>(
    decoders: IDecoder<T> | IDecoder<T>[]
  ): Promise<IAsyncIterator<T>> {
    return toAsyncIterator(this, decoders);
  }

  private getUniquePubsubTopics<T extends IDecodedMessage>(
    decoders: IDecoder<T> | IDecoder<T>[]
  ): string[] {
    if (!Array.isArray(decoders)) {
      return [decoders.pubsubTopic];
    }

    if (decoders.length === 0) {
      return [];
    }

    const pubsubTopics = new Set(decoders.map((d) => d.pubsubTopic));

    return [...pubsubTopics];
  }
}

export function wakuFilter(
  init: ProtocolCreateOptions
): (libp2p: Libp2p) => IFilterSDK {
  return (libp2p: Libp2p) => new FilterSDK(libp2p, init);
}

async function pushMessage<T extends IDecodedMessage>(
  subscriptionCallback: SubscriptionCallback<T>,
  pubsubTopic: PubsubTopic,
  message: WakuMessage
): Promise<void> {
  const { decoders, callback } = subscriptionCallback;

  const { contentTopic } = message;
  if (!contentTopic) {
    log.warn("Message has no content topic, skipping");
    return;
  }

  try {
    const decodePromises = decoders.map((dec) =>
      dec
        .fromProtoObj(pubsubTopic, message as IProtoMessage)
        .then((decoded) => decoded || Promise.reject("Decoding failed"))
    );

    const decodedMessage = await Promise.any(decodePromises);

    await callback(decodedMessage);
  } catch (e) {
    log.error("Error decoding message", e);
  }
}
