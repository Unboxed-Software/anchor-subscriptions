# Plege - On-chain subscriptions

Plege is a Solana-based payments provider dedicated to reaching Web2 feature parity and beyond. This repository hosts our on-chain subscriptions payment program and an accompanying client-side SDK.

The program is written using Rust and Anchor. Its payment automation works using [clockwork threads](https://docs.clockwork.xyz/about/readme), thus eliminating any reliance on client-side automation.

## Interacting with the Subscriptions Program

The easiest way to interact with the subscriptions is using the [Typescript SDK](./client/subscription-sdk/).

This SDK is published as `@plege/subscriptions`. You can bring it into your JS/TS projects using the following:

```ts
npm install @plege/subscriptions
```

To see an example of how to interact with the program, take a look at our [demo frontend repo](https://github.com/plege-xyz/website-beta).

The package is broken into three primary namespaces `user`, `app`, and `tier`.

### `user`

`user` exposes basic functionality for creating and fetching a user with the following functions:

* `createUser` - creates a new user
* `fetchUser` - fetches an existing user

The corresponding on-chain account is of type `UserMeta` and represents an authority under which multiple subscriptions apps can be created.

### `app`

`app` exposes functionality for creating and interacting with subscriptions apps. The corresponding account on-chain is `App`. It can be thought of as a way to bundle related subscriptions so you can easily identify what to serve up to subscribers. 

Through the `app` namespace you have the following:

* `create` - creates a new app
* `fetch` - fetches an existing app
* `get.subscriptions.all` - gets all active subscriptions to a given app
* `get.subscriptions.count` - gets a count of all the active subscriptions to a given app
* `get.subscriptions.groupedByTier` - gets all active subscriptions to a given app grouped by their tier
* `get.tiers.all` - gets all tiers for a given app
* `get.tiers.count` - gets the tier count for a given app

### `tier`

Tiers are a owned by apps. This allows flexibility in how you design your subscriptions. For example, you can create a tier that represents a base level monthly membership and another that represents a base level yearly membership.

This namespace surfaces the following:

* `create` - creates a new tier belonging to a given app
* `fetch` - fetches an existing tier
* `pauseTier` - pauses new subscriptions to a given tier
* `unpauseTier` - allows new subscriptions to a previously paused tier
* `disable` - permanently disables a tier. Note that this makes it so no new subscribers can subscribe to this tier and also terminates all existing subscriptions to that tier.
* `get.subscriptions.all` - gets all active subscriptions to a given tier
* `get.subscriptions.count` - gets a count of all active subscriptions to a given tier