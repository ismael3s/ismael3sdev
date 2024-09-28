import { setTimeout } from "timers/promises";

async function mockIOCall({ delayInMs = 1000, mockError = null }) {
  await setTimeout(delayInMs);
  if (mockError) throw mockError;
}

async function main() {
  const [someIOCallResult, anotherIOCallResult] = await Promise.allSettled([
    mockIOCall({
      delayInMs: 5000,
      mockError: new Error("Some Annoying Error"),
    }),
    mockIOCall({ delayInMs: 3000 }),
  ]);
  if (someIOCallResult.reason) {
    console.error(someIOCallResult.reason.message);
    //  do anything necessary
  }
  if (anotherIOCallResult.reason) {
    console.error(someIOCallResult.reason.message);
    //  do anything necessary
  }
}
await main();
