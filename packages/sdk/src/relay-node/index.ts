import { type FullNode, type RelayNode } from "@synapse/interfaces";
import { RelayCreateOptions, wakuRelay } from "@synapse/relay";

import { wakuFilter } from "../protocols/filter.js";
import { wakuLightPush } from "../protocols/light_push.js";
import { wakuStore } from "../protocols/store.js";
import { createLibp2pAndUpdateOptions } from "../utils/libp2p.js";
import { CreateWakuNodeOptions, WakuNode, WakuOptions } from "../waku.js";

/**
 * Create a Waku node that uses Waku Relay to send and receive messages,
 * enabling some privacy preserving properties.
 * * @remarks
 * This function creates a Relay Node using the Waku Relay protocol.
 * While it is technically possible to use this function in a browser environment,
 * it is not recommended due to potential performance issues and limited browser capabilities.
 * If you are developing a browser-based application, consider alternative approaches like creating a Light Node
 * or use this function with caution.
 */
export async function createRelayNode(
  options: CreateWakuNodeOptions & Partial<RelayCreateOptions> = {
    pubsubTopics: []
  }
): Promise<RelayNode> {
  const libp2p = await createLibp2pAndUpdateOptions(options);

  const relay = wakuRelay(options?.pubsubTopics || []);

  return new WakuNode(
    options as WakuOptions,
    libp2p,
    undefined,
    undefined,
    undefined,
    relay
  ) as RelayNode;
}

/**
 * Create a Waku node that uses all Waku protocols.
 *
 * This helper is not recommended except if:
 * - you are interfacing with nwaku v0.11 or below
 * - you are doing some form of testing
 *
 * If you are building a full node, it is recommended to use
 * [nwaku](github.com/status-im/nwaku) and its JSON RPC API or wip REST API.
 *
 * @see https://github.com/status-im/nwaku/issues/1085
 * @internal
 */
export async function createFullNode(
  options: CreateWakuNodeOptions & Partial<RelayCreateOptions> = {
    pubsubTopics: []
  }
): Promise<FullNode> {
  const libp2p = await createLibp2pAndUpdateOptions(options);

  const store = wakuStore(options);
  const lightPush = wakuLightPush(options);
  const filter = wakuFilter(options);
  const relay = wakuRelay(options?.pubsubTopics || []);

  return new WakuNode(
    options as WakuOptions,
    libp2p,
    store,
    lightPush,
    filter,
    relay
  ) as FullNode;
}
