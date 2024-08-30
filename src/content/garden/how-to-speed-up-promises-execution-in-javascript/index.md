---
title: "How to execute promises in parallel, advantages and pitfalls"
description: "Improving your javascript code by running promises in simultaneously"
slug: "executing-promises-in-parallel"
date: "Aug 28 2024"
updatedAt: "Aug 28 2024"
---

Hi folks! Recently, one of my friends showed me a piece of code that was taking about 12 seconds to execute. The code looked something like the example below. I want to discuss some small improvements we can make, along with their advantages and potential pitfalls.

```javascript
import { setTimeout } from "timers/promises";

async function mockIOCall({ delayInMs = 1000 }) {
  await setTimeout(delayInMs);
  if (mockError) throw mockError;
}

async function main() {
  const someIOCallResult = await mockIOCall({ delayInMs: 9000 });
  const anotherIOCallResult = await mockIOCall({ delayInMs: 3000 });
}
```

In the code above, it's just a regular JavaScript code to be executed by the NodeJS Runtime nothing inherently "wrong" with it. However, this code could run faster by executing both promises simultaneously.

## Huh? 🤔

Yes, I know, this was my first reaction when I was learning about this as well. Let’s say the first promise, `doSomeIOCall`, takes 9 seconds to complete, and the second promise, `doAnotherIOCall`, takes 3 seconds. In the original code, the total time is 12 seconds. However, with a small refactor, we can improve this code so that it takes only 9 seconds, which is the time taken by the longest IO operation in this example.

## How can we do it?

```javascript
//...rest of the code

async function main() {
  const [someIOCallResult, anotherIOCallResult] = await Promise.all([
    mockIOCall({ delayInMs: 9000 }),
    mockIOCall({ delayInMs: 3000 }),
  ]);
}
```

The `Promise.all` accepts a list of promises, and return an list of the value returned by every promise ordered by the registration order of the list of input

> That's it this seed end here... And this is something that I would like to say.

But we have a **SERIOUS PROBLEM** with this approach...

## The Problem with `Promise.all`

The `Promise.all` uses the principle of "all or none". This means that if any of the promises in the Promise.all call fails, the entire operation will throw an error, and you'll need to handle it.

Now, what happens to the promises that have already completed their tasks when one of the promises fails?

I will give to you a few seconds to think about it...

.

.

.

.

.

Correct! They remain completed, but you can't perform any cleanup or rollback functions for them after a failure. Let's modify our mockIOCall signature to illustrate this:

```javascript
async function mockIOCall({ delayInMs = 1000, mockError = null }) {
  await setTimeout(delayInMs);
  if (mockError) throw mockError;
}
```

Now, the code below will throw an error after 9 seconds, but the promise that takes 3 seconds to complete will have already done its job.

```javascript
async function main() {
  const [someIOCallResult, anotherIOCallResult] = await Promise.all([
    mockIOCall({
      delayInMs: 9000,
      mockError: new Error("Some Annoying Error"),
    }),
    mockIOCall({ delayInMs: 3000 }),
  ]);
}
```

## What If We Use try-catch?

Well, by doing this, you can handle the error, but it really depends on your specific case and what you want to do with the exception. If your desired behavior is "If something goes wrong, that's okay; we don't need to rollback the successful promises," then this is a good solution.

```javascript
async function main() {
  try {
    const [someIOCallResult, anotherIOCallResult] = await Promise.all([
      mockIOCall({
        delayInMs: 9000,
        mockError: new Error("Some Annoying Error"),
      }),
      mockIOCall({ delayInMs: 3000 }),
    ]);
  } catch (exception) {
    console.error(exception.message);
  }
}
```

But for scenarios where the "all or none" approach isn't acceptable and we need to handle each error individually, Promise.all isn't the best solution. Instead, we should use Promise.allSettled, which is very similar to Promise.all, but it returns an array of results for all promises, whether they were fulfilled or rejected.

```javascript
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
```

### References and you must read it, trust me

[Promise.all In MDN Docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)

[Promise.allSettled In MDN Docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled)

> 📘 Seed
>
> For now, this is all I have to write about it. When I notice something that can be improved in this seed, I will update it. But if you find something that could be added, or if I said something incorrect, feel free to correct me in the comments, and I'll update the seed later. Thank you for your time reading up to here!
