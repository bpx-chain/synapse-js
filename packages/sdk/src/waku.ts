import type { Stream } from "@libp2p/interface";
import { isPeerId, PeerId } from "@libp2p/interface";
import { multiaddr, Multiaddr, MultiaddrInput } from "@multiformats/multiaddr";
import { ConnectionManager, DecodedMessage } from "@bpx-chain/synapse-core";
import type {
  Callback,
  IFilterSDK,
  ILightPushSDK,
  IRelay,
  IStoreSDK,
  ISubscriptionSDK,
  Libp2p,
  LightNode,
  ProtocolCreateOptions,
  PubsubTopic,
  Waku
} from "@bpx-chain/synapse-interfaces";
import { Protocols } from "@bpx-chain/synapse-interfaces";
import { Logger } from "@bpx-chain/synapse-utils";

import { subscribeToContentTopic } from "./utils/content_topic.js";

export const DefaultPingKeepAliveValueSecs = 5 * 60;
export const DefaultRelayKeepAliveValueSecs = 5 * 60;
export const DefaultUserAgent = "js-waku";
export const DefaultPingMaxInboundStreams = 10;

const log = new Logger("waku");

export interface WakuOptions {
  /**
   * Set keep alive frequency in seconds: Waku will send a `/ipfs/ping/1.0.0`
   * request to each peer after the set number of seconds. Set to 0 to disable.
   *
   * @default {@link @bpx-chain/synapse-core.DefaultPingKeepAliveValueSecs}
   */
  pingKeepAlive?: number;
  /**
   * Set keep alive frequency in seconds: Waku will send a ping message over
   * relay to each peer after the set number of seconds. Set to 0 to disable.
   *
   * @default {@link @bpx-chain/synapse-core.DefaultRelayKeepAliveValueSecs}
   */
  relayKeepAlive?: number;
  /**
   * Set the user agent string to be used in identification of the node.
   * @default {@link @bpx-chain/synapse-core.DefaultUserAgent}
   */
  userAgent?: string;
  pubsubTopics: PubsubTopic[];
}

export type CreateWakuNodeOptions = ProtocolCreateOptions &
  Partial<WakuOptions>;

export class WakuNode implements Waku {
  public libp2p: Libp2p;
  public relay?: IRelay;
  public store?: IStoreSDK;
  public filter?: IFilterSDK;
  public lightPush?: ILightPushSDK;
  public connectionManager: ConnectionManager;
  public readonly pubsubTopics: PubsubTopic[];

  constructor(
    options: WakuOptions,
    libp2p: Libp2p,
    store?: (libp2p: Libp2p) => IStoreSDK,
    lightPush?: (libp2p: Libp2p) => ILightPushSDK,
    filter?: (libp2p: Libp2p) => IFilterSDK,
    relay?: (libp2p: Libp2p) => IRelay
  ) {
    if (options.pubsubTopics.length == 0) {
      throw new Error("At least one pubsub topic must be provided");
    }
    this.pubsubTopics = options.pubsubTopics;

    this.libp2p = libp2p;

    if (store) {
      this.store = store(libp2p);
    }
    if (filter) {
      this.filter = filter(libp2p);
    }
    if (lightPush) {
      this.lightPush = lightPush(libp2p);
    }

    if (relay) {
      this.relay = relay(libp2p);
    }

    const pingKeepAlive =
      options.pingKeepAlive || DefaultPingKeepAliveValueSecs;
    const relayKeepAlive = this.relay
      ? options.relayKeepAlive || DefaultRelayKeepAliveValueSecs
      : 0;

    const peerId = this.libp2p.peerId.toString();

    this.connectionManager = ConnectionManager.create(
      peerId,
      libp2p,
      { pingKeepAlive, relayKeepAlive },
      this.pubsubTopics,
      this.relay
    );

    log.info(
      "Waku node created",
      peerId,
      `relay: ${!!this.relay}, store: ${!!this.store}, light push: ${!!this
        .lightPush}, filter: ${!!this.filter}`
    );
  }

  /**
   * Dials to the provided peer.
   *
   * @param peer The peer to dial
   * @param protocols Waku protocols we expect from the peer; Defaults to mounted protocols
   */
  async dial(
    peer: PeerId | MultiaddrInput,
    protocols?: Protocols[]
  ): Promise<Stream> {
    const _protocols = protocols ?? [];
    const peerId = mapToPeerIdOrMultiaddr(peer);

    if (typeof protocols === "undefined") {
      this.relay && _protocols.push(Protocols.Relay);
      this.store && _protocols.push(Protocols.Store);
      this.filter && _protocols.push(Protocols.Filter);
      this.lightPush && _protocols.push(Protocols.LightPush);
    }

    const codecs: string[] = [];
    if (_protocols.includes(Protocols.Relay)) {
      if (this.relay) {
        this.relay.gossipSub.multicodecs.forEach((codec: string) =>
          codecs.push(codec)
        );
      } else {
        log.error(
          "Relay codec not included in dial codec: protocol not mounted locally"
        );
      }
    }
    if (_protocols.includes(Protocols.Store)) {
      if (this.store) {
        codecs.push(this.store.protocol.multicodec);
      } else {
        log.error(
          "Store codec not included in dial codec: protocol not mounted locally"
        );
      }
    }
    if (_protocols.includes(Protocols.LightPush)) {
      if (this.lightPush) {
        codecs.push(this.lightPush.protocol.multicodec);
      } else {
        log.error(
          "Light Push codec not included in dial codec: protocol not mounted locally"
        );
      }
    }
    if (_protocols.includes(Protocols.Filter)) {
      if (this.filter) {
        codecs.push(this.filter.protocol.multicodec);
      } else {
        log.error(
          "Filter codec not included in dial codec: protocol not mounted locally"
        );
      }
    }

    log.info(`Dialing to ${peerId.toString()} with protocols ${_protocols}`);

    return this.libp2p.dialProtocol(peerId, codecs);
  }

  async start(): Promise<void> {
    await this.libp2p.start();
  }

  async stop(): Promise<void> {
    this.connectionManager.stop();
    await this.libp2p.stop();
  }

  async subscribeToContentTopic(
    contentTopic: string,
    peer: Multiaddr,
    callback: Callback<DecodedMessage>
  ): Promise<ISubscriptionSDK> {
    return (
      await subscribeToContentTopic(contentTopic, callback, {
        waku: this as LightNode,
        peer
      })
    ).subscription;
  }

  isStarted(): boolean {
    return this.libp2p.status == "started";
  }

  isConnected(): boolean {
    return this.connectionManager.isConnected();
  }

  /**
   * Return the local multiaddr with peer id on which libp2p is listening.
   *
   * @throws if libp2p is not listening on localhost.
   */
  getLocalMultiaddrWithID(): string {
    const localMultiaddr = this.libp2p
      .getMultiaddrs()
      .find((addr) => addr.toString().match(/127\.0\.0\.1/));
    if (!localMultiaddr || localMultiaddr.toString() === "") {
      throw "Not listening on localhost";
    }
    return localMultiaddr + "/p2p/" + this.libp2p.peerId.toString();
  }
}
function mapToPeerIdOrMultiaddr(
  peerId: PeerId | MultiaddrInput
): PeerId | Multiaddr {
  return isPeerId(peerId) ? peerId : multiaddr(peerId);
}
