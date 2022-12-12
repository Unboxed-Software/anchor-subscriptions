import { expect } from "chai";
import sdk from "@plege/subscriptions";
import { web3 } from "@project-serum/anchor";
import {
  createGeneralScaffolding,
  createSubscription,
} from "./utils/basic-functions";
import { createAssociatedTokenAccount } from "@solana/spl-token";

// describe("sdk tests", () => {
//   it.only("random test", async () => {
// sdk.setup(global.connection, global.program.programId)

// const subscriber = web3.Keypair.generate()
// let subscriberAta = await createAssociatedTokenAccount(
//   global.connection,
//   subscriber,
//   global.mint,
//   subscriber.publicKey
// )
// await createSubscription(app, tier1, subscriber, subscriberAta)
//   const count = await sdk.getActiveSubscriptionCountForApp(
//     new web3.PublicKey("FZ3LyWWrorXTfNHp6v4tncoN7iojo1Dud9YofPizwycB")
//   );

//   const subscriptions = await sdk.getSubscriptionsToApp(
//     new web3.PublicKey("FZ3LyWWrorXTfNHp6v4tncoN7iojo1Dud9YofPizwycB")
//   );

//   expect(count).to.equal(2);
// });

// let user, app, tier1, tier2, auth
// beforeEach(async () => {
//   ;({ user, app, tier1, tier2, auth } = await createGeneralScaffolding())
// })
// });

(async () => {
  const subscriptions = await sdk.app.get.subscriptions.all(
    new web3.PublicKey("FZ3LyWWrorXTfNHp6v4tncoN7iojo1Dud9YofPizwycB")
  );

  console.log(subscriptions);
})();
