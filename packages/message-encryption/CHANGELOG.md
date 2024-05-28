# Changelog

All notable changes to this project will be documented in this file.

The file is maintained by [Release Please](https://github.com/googleapis/release-please) based on [Conventional Commits](https://www.conventionalcommits.org) specification,
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @synapse/core bumped from 0.0.11 to 0.0.12
    * @synapse/interfaces bumped from 0.0.8 to 0.0.9

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @synapse/core bumped from 0.0.12 to 0.0.13
    * @synapse/interfaces bumped from 0.0.9 to 0.0.10
    * @synapse/proto bumped from 0.0.3 to 0.0.4
    * @synapse/utils bumped from 0.0.2 to 0.0.3

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @synapse/core bumped from 0.0.14 to 0.0.15

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @synapse/core bumped from 0.0.15 to 0.0.16
    * @synapse/interfaces bumped from 0.0.10 to 0.0.11
    * @synapse/utils bumped from 0.0.3 to 0.0.4

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @synapse/core bumped from 0.0.18 to 0.0.19
    * @synapse/interfaces bumped from 0.0.13 to 0.0.14
    * @synapse/proto bumped from * to 0.0.5
    * @synapse/utils bumped from 0.0.6 to 0.0.7

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @synapse/core bumped from 0.0.19 to 0.0.20
    * @synapse/interfaces bumped from 0.0.14 to 0.0.15
    * @synapse/utils bumped from 0.0.7 to 0.0.8

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @synapse/core bumped from 0.0.21 to 0.0.22
    * @synapse/interfaces bumped from 0.0.16 to 0.0.17
    * @synapse/utils bumped from 0.0.9 to 0.0.10

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @synapse/core bumped from 0.0.22 to 0.0.23
    * @synapse/interfaces bumped from 0.0.17 to 0.0.18
    * @synapse/utils bumped from 0.0.10 to 0.0.11

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @synapse/core bumped from 0.0.26 to 0.0.27
    * @synapse/interfaces bumped from 0.0.21 to 0.0.22
    * @synapse/utils bumped from 0.0.14 to 0.0.15

## [0.0.27](https://github.com/bpx-chain/synapse-js/compare/message-encryption-v0.0.26...message-encryption-v0.0.27) (2024-04-30)


### ⚠ BREAKING CHANGES

* use ShardingParams on subscriptions, make Decoder/Encoder auto sharding friendly by default ([#1958](https://github.com/bpx-chain/synapse-js/issues/1958))

### Features

* Use ShardingParams on subscriptions, make Decoder/Encoder auto sharding friendly by default ([#1958](https://github.com/bpx-chain/synapse-js/issues/1958)) ([f3627c4](https://github.com/bpx-chain/synapse-js/commit/f3627c46a4c231013c5ffa4aa6f1ecbe3c06c5e3))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @synapse/core bumped from 0.0.28 to 0.0.29
    * @synapse/interfaces bumped from 0.0.23 to 0.0.24
    * @synapse/proto bumped from 0.0.6 to 0.0.7
    * @synapse/utils bumped from 0.0.16 to 0.0.17

## [0.0.26](https://github.com/bpx-chain/synapse-js/compare/message-encryption-v0.0.25...message-encryption-v0.0.26) (2024-04-09)


### Features

* Add cross peer dependency for [@waku](https://github.com/waku) packages ([#1889](https://github.com/bpx-chain/synapse-js/issues/1889)) ([8f86740](https://github.com/bpx-chain/synapse-js/commit/8f867404e3e950b6e491c8831068962c6968ed4e))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @synapse/core bumped from 0.0.27 to 0.0.28
    * @synapse/interfaces bumped from 0.0.22 to 0.0.23
    * @synapse/utils bumped from 0.0.15 to 0.0.16

## [0.0.24](https://github.com/bpx-chain/synapse-js/compare/message-encryption-v0.0.23...message-encryption-v0.0.24) (2024-01-10)


### ⚠ BREAKING CHANGES

* add support for sharded pubsub topics & remove support for named pubsub topics ([#1697](https://github.com/bpx-chain/synapse-js/issues/1697))
* export crypto primitives ([#1728](https://github.com/bpx-chain/synapse-js/issues/1728))
* change all instances of `PubSubTopic` to `PubsubTopic` ([#1703](https://github.com/bpx-chain/synapse-js/issues/1703))

### Features

* Add support for autosharded pubsub topics ([2bc3735](https://github.com/bpx-chain/synapse-js/commit/2bc3735e4dcf85f06b3dee542024d7f20a40fac2))
* Add support for sharded pubsub topics & remove support for named pubsub topics ([#1697](https://github.com/bpx-chain/synapse-js/issues/1697)) ([4cf2ffe](https://github.com/bpx-chain/synapse-js/commit/4cf2ffefa75e0571805036b71644d2cdd4fe3192))
* Export crypto primitives ([#1728](https://github.com/bpx-chain/synapse-js/issues/1728)) ([7eb3375](https://github.com/bpx-chain/synapse-js/commit/7eb3375f50265240096d70bd2814549c8156a0eb))
* New `verifySignature` ([2f67a3b](https://github.com/bpx-chain/synapse-js/commit/2f67a3baffc085d61b057f9fdb5ab404bfd70a1b))


### Miscellaneous Chores

* Change all instances of `PubSubTopic` to `PubsubTopic` ([#1703](https://github.com/bpx-chain/synapse-js/issues/1703)) ([3166a51](https://github.com/bpx-chain/synapse-js/commit/3166a5135e77583da4fa722ee2aa47c785854a38))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @synapse/core bumped from 0.0.25 to 0.0.26
    * @synapse/interfaces bumped from 0.0.20 to 0.0.21
    * @synapse/proto bumped from 0.0.5 to 0.0.6
    * @synapse/utils bumped from 0.0.13 to 0.0.14

## [0.0.23](https://github.com/bpx-chain/synapse-js/compare/message-encryption-v0.0.22...message-encryption-v0.0.23) (2023-11-01)


### Features

* Logger with log levels ([#1672](https://github.com/bpx-chain/synapse-js/issues/1672)) ([0f7d63e](https://github.com/bpx-chain/synapse-js/commit/0f7d63ef93716223dc8fea7e8cb09e12e267b386))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @synapse/core bumped from 0.0.24 to 0.0.25
    * @synapse/interfaces bumped from 0.0.19 to 0.0.20
    * @synapse/utils bumped from 0.0.12 to 0.0.13

## [0.0.22](https://github.com/bpx-chain/synapse-js/compare/message-encryption-v0.0.21...message-encryption-v0.0.22) (2023-10-16)


### ⚠ BREAKING CHANGES

* **static-sharding:** allow multiple pubSubTopics ([#1586](https://github.com/bpx-chain/synapse-js/issues/1586))

### Features

* Add Firefox and Webkit to karma  ([#1598](https://github.com/bpx-chain/synapse-js/issues/1598)) ([d9e4bcb](https://github.com/bpx-chain/synapse-js/commit/d9e4bcbe3f7bcc092f20621bd362d76426701dab))
* **static-sharding:** Allow multiple pubSubTopics ([#1586](https://github.com/bpx-chain/synapse-js/issues/1586)) ([a3c45b6](https://github.com/bpx-chain/synapse-js/commit/a3c45b6e1a9beae488cae3c71c48949fa47bcaf6))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @synapse/core bumped from 0.0.23 to 0.0.24
    * @synapse/interfaces bumped from 0.0.18 to 0.0.19
    * @synapse/utils bumped from 0.0.11 to 0.0.12

## [0.0.19](https://github.com/bpx-chain/synapse-js/compare/message-encryption-v0.0.18...message-encryption-v0.0.19) (2023-07-26)


### ⚠ BREAKING CHANGES

* upgrade to libp2p@0.45 ([#1400](https://github.com/bpx-chain/synapse-js/issues/1400))

### Features

* Upgrade to libp2p@0.45 ([#1400](https://github.com/bpx-chain/synapse-js/issues/1400)) ([420e6c6](https://github.com/bpx-chain/synapse-js/commit/420e6c698dd8f44d40d34e47d876da5d2e1ce85e))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @synapse/core bumped from 0.0.20 to 0.0.21
    * @synapse/interfaces bumped from 0.0.15 to 0.0.16
    * @synapse/utils bumped from 0.0.8 to 0.0.9

## [0.0.16](https://github.com/bpx-chain/synapse-js/compare/message-encryption-v0.0.15...message-encryption-v0.0.16) (2023-05-18)


### ⚠ BREAKING CHANGES

* @synapse/relay ([#1316](https://github.com/bpx-chain/synapse-js/issues/1316))

### Features

* @synapse/relay ([#1316](https://github.com/bpx-chain/synapse-js/issues/1316)) ([50c2c25](https://github.com/bpx-chain/synapse-js/commit/50c2c2540f3c5ff78d93f3fea646da0eee246e17))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @synapse/core bumped from * to 0.0.18
    * @synapse/interfaces bumped from * to 0.0.13
    * @synapse/utils bumped from * to 0.0.6

## [0.0.15](https://github.com/bpx-chain/synapse-js/compare/message-encryption-v0.0.14...message-encryption-v0.0.15) (2023-05-09)


### Features

* Ensure content topic is defined ([bd9d073](https://github.com/bpx-chain/synapse-js/commit/bd9d07394fc2dcad573dd7f3b44ee692d0ea93e8))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @synapse/core bumped from 0.0.16 to 0.0.17
    * @synapse/interfaces bumped from 0.0.11 to 0.0.12
    * @synapse/utils bumped from 0.0.4 to 0.0.5

## [0.0.10](https://github.com/bpx-chain/synapse-js/compare/message-encryption-v0.0.9...message-encryption-v0.0.10) (2023-03-16)


### ⚠ BREAKING CHANGES

* add exports map to @synapse/utils ([#1201](https://github.com/bpx-chain/synapse-js/issues/1201))
* enable encoding of `meta` field
* expose pubsub topic in `IDecodedMessage`
* update message.proto: payload and content topic are always defined
* bump typescript

### Features

* Enable encoding of `meta` field ([bd983ea](https://github.com/bpx-chain/synapse-js/commit/bd983ea48ee73fda5a7137d5ef681965aeabb4a5))
* Export `Decoder`, `Encoder` and `DecodedMessage` types from root ([da1b18d](https://github.com/bpx-chain/synapse-js/commit/da1b18d9956259af4cb2e6f7c1f06de52b6ec3ac)), closes [#1010](https://github.com/bpx-chain/synapse-js/issues/1010)
* Expose pubsub topic in `IDecodedMessage` ([628ac50](https://github.com/bpx-chain/synapse-js/commit/628ac50d7104ec3c1dff44db58077a85db6b6aa1)), closes [#1208](https://github.com/bpx-chain/synapse-js/issues/1208)


### Bug Fixes

* Prettier and cspell ignore CHANGELOG ([#1235](https://github.com/bpx-chain/synapse-js/issues/1235)) ([4d7b3e3](https://github.com/bpx-chain/synapse-js/commit/4d7b3e39e6761afaf5d05a13cc4b3c23e15f9bd5))


### Miscellaneous Chores

* Add exports map to @synapse/utils ([#1201](https://github.com/bpx-chain/synapse-js/issues/1201)) ([a30b2bd](https://github.com/bpx-chain/synapse-js/commit/a30b2bd747dedeef69b46cfafb88898ba35d8f67))
* Bump typescript ([12d86e6](https://github.com/bpx-chain/synapse-js/commit/12d86e6abcc68e27c39ca86b4f0dc2b68cdd6000))
* Update message.proto: payload and content topic are always defined ([5cf8ed2](https://github.com/bpx-chain/synapse-js/commit/5cf8ed2030c9efbc4c4b66aa801827482c1e4249))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @synapse/core bumped from * to 0.0.11
    * @synapse/interfaces bumped from * to 0.0.8
    * @synapse/proto bumped from * to 0.0.3
    * @synapse/utils bumped from * to 0.0.2

## [Unreleased]

### Changed

- `createEncoder` now take an object of type `EncoderOptions` instead of `contentTopic` and `ephemeral`
- For Ecies, `createEncoder` now take an object of type `EncoderOptions` instead of `contentTopic`, `ephemeral`, `publicKey` and `sigPrivKey`
- For Symmetric, `createEncoder` now take an object of type `EncoderOptions` instead of `contentTopic`, `ephemeral`, `symKey` and `sigPrivKey`

## [0.0.9] - 2023-01-25

### Fixed

- Moved `@chai` and `@fast-check` to `devDependencies` list.

## [0.0.8] - 2023-01-18

### Changed

- Export `Encoder` and `Decoder` types.
- Moved `@chai` and `@fast-check` to `dependencies` list.
- Added missing `@js-sha3` and `@debug` to `dependencies` list.

## [0.0.7] - 2022-12-19

### Fixed

- Incorrect `proto` import.

## [0.0.6] - 2022-12-16

### Fixed

- Type resolution when using `moduleResolution: node`.

## [0.0.5] - 2022-12-15

### Added

- Add `@multiformats/multiaddr` as peer dependency.
- New `createEncoder` and `createDecoder` functions so that the consumer does not deal with Encoder/Decoder classes.
-

### Changed

- `Asymmetric` renamed to `ECIES` to follow RFC terminology.
- Split `ECIES` and `symmetric` packages, all items are now export from two different paths: `@synapse/message-encryption/ecies` and `@synapse/message-encryption/symmetric`.
- remove `asym` and `sym` prefix from exported items as they are now differentiated from their export path: `createEncoder`, `createDecoder`, `DecodedMessage`.
- Remove usage for `Partial` with `Message` as `Message`'s field are all optional.

## [0.0.4] - 2022-11-18

### Added

- Alpha version of `@synapse/message-encryption`.

[unreleased]: https://github.com/bpx-chain/synapse-js/compare/@synapse/message-encryption@0.0.9...HEAD
[0.0.9]: https://github.com/bpx-chain/synapse-js/compare/@synapse/message-encryption@0.0.8...@synapse/message-encryption@0.0.9
[0.0.8]: https://github.com/bpx-chain/synapse-js/compare/@synapse/message-encryption@0.0.7...@synapse/message-encryption@0.0.8
[0.0.7]: https://github.com/bpx-chain/synapse-js/compare/@synapse/message-encryption@0.0.6...@synapse/message-encryption@0.0.7
[0.0.6]: https://github.com/bpx-chain/synapse-js/compare/@synapse/message-encryption@0.0.5...@synapse/message-encryption@0.0.6
[0.0.5]: https://github.com/bpx-chain/synapse-js/compare/@synapse/message-encryption@0.0.4...@synapse/message-encryption@0.0.5
[0.0.4]: https://github.com/bpx-chain/synapse-js/compare/@synapse/message-encryption@0.0.3...@synapse/message-encryption@0.0.4
[0.0.3]: https://github.com/bpx-chain/synapse-js/compare/@synapse/message-encryption@0.0.2...%40waku/message-encryption@0.0.3
[0.0.2]: https://github.com/bpx-chain/synapse-js/compare/@synapse/message-encryption@0.0.1...%40waku/message-encryption@0.0.2
[0.0.1]: https://github.com/status-im/js-waku/compare/a20b7809d61ff9a9732aba82b99bbe99f229b935...%40waku/message-encryption%400.0.2
