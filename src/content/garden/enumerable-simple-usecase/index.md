---
title: "Using IEnumerable To Optimize Memory Usage"
description: "An alternative to create a lot of records with low memory allocation"
slug: "using-ienumerable-to-optimize-memory-usage"
date: "Sep 28 2024"
updatedAt: "Sep 28 2024"
---

These days my friend brought me a problem that was suddenly introduced by the client from his company overnight, and the code that was working before now has a small problem due to this 'simple' edge case. But first, let's rewind a little bit

Friend: "Ismael I'm developing an app where the user can create raffles and sell as many they want"

I: "Oh, that it's nice, but you always seek me out when some trouble happens. What is it this time?"

Friend: "Well, let's say that we have a code that creates a loop to generate instances of the raffle items. But when we try this edge case added by client, the code doesn't finis, and the raffles and their items aren't created"

I: "Gosh... and what was the edge case added by the client?"

Friend: "We need to be able to create 1 million raffle items and store them. The code works fine for values under 100,000"

I: "HE WANTS WHAT?!"

![Throw Chair](./throw-chair.png)

And this is the context: an app that needs to create **A LOT** of records in the database, and the code isn't handling this well. We found a lot of things that could be improved, but this time I'll focus on only one thing: **Memory Allocation**.

That same night, I couldn't sleep, so I thought to myself, "What can I do to feel tired?" I could go for a walk, do some push ups, jump rope, but for some reason I decide to check with my friend how exactly the code was working. It seemed like a task that could give me excitement and make me feel mentally exhausted. So I asked to my friend for the code, and the first thing that I saw was something like this code:

```csharp
public sealed record DoSomethingRequest(int Amount, Guid RaffleId);

public sealed class Item
{
    public Guid Id { get; set; }

    public Guid RaffleId { get; set; }

    public DateTime CreatedAt { get; set; }

    public static Item Create( Guid raflfeId)
    {
        return new Item { Id = Guid.NewGuid(), RaffleId = raflfeId, CreatedAt = DateTime.Now };
    }
}

 public List<Item> Generate(DoSomethingRequest request)
    {
        var items = new List<Item>();
        for (var i = 0; i < request.Amount; i++)
        {
            items.Add(Item.Create(request.RaffleId));
        }
        return items;
    }
}
```

And at this moment, we already knew one of the problems, and this is a perfect meme:

![meme](./meme.png)

This code works like a charm for a specific amount of items to generate, but since we are bringing `N` items into memory and it could be **1 million** items, this code can break in production, because the memory usage can grow significantly and we may have more than just one user trying to create a raffle.

Let's bring in a small benchmark:

```csharp
[MemoryDiagnoser]
[MarkdownExporter]
public class BenchmarkingExecution
{
    private readonly SomeRandomService _someRandomService = new ();
    private readonly Guid OrderId = Guid.NewGuid();
    private DoSomethingRequest _request;

    [Params(100, 1_000, 10_000, 100_000, 1_000_000)]
    public int AmountOfItems;

    [GlobalSetup]
    public void Setup()
    {
        _request = new DoSomethingRequest(AmountOfItems, OrderId);
    }

    [Benchmark]
    public List<Item> Measure() => _someRandomService.Generate(_request);
}
```

## Results

```

BenchmarkDotNet v0.14.0, Linux Mint 22 (Wilma)
AMD Ryzen 9 7900, 1 CPU, 24 logical and 12 physical cores
.NET SDK 8.0.108
  [Host]     : .NET 8.0.8 (8.0.824.36612), X64 RyuJIT AVX-512F+CD+BW+DQ+VL+VBMI
  DefaultJob : .NET 8.0.8 (8.0.824.36612), X64 RyuJIT AVX-512F+CD+BW+DQ+VL+VBMI


```

| AmountOfItems |              Mean |       Allocated |
| ------------- | ----------------: | --------------: |
| **100**       |      **41.56 μs** |     **7.61 KB** |
| **1000**      |     **411.70 μs** |     **70.9 KB** |
| **10000**     |   **4,232.83 μs** |   **803.21 KB** |
| **100000**    |  **41,614.02 μs** |  **7517.46 KB** |
| **1000000**   | **439,286.79 μs** | **71080.71 KB** |

And to be honest, I'm Very impressed that in the worst case, for a single user, it's only 67.8MB (on my machine). But we can do better. We can use `IEnumerable` to give the behavior of only bringing items into memory when needed, processing them one by one. Since a `List` implements the `IEnumerable ` under the hood, we can refactor this code with low effort.

### But why use IEnumerable interface?

Because `IEnumerable` avoids bringing all records into memory and only brings one when it's needed, such as when looping trough or when it's asked to materialize into any data structure that implements this interface, like the `List` that was used before. This way we can create 1 million records (or even more) without bringing all the records into memory.

### How?

The code after the refactor looks like:

```csharp
public IEnumerable<Item> GenerateEnumerable(DoSomethingRequest request)
{
    for (var i = 0; i < request.Amount; i++)
    {
        yield return Item.Create(request.RaffleId);
    }
}
```

The code is very straightforward; a new keyword was introduced. The `yield return` allows your code to "emit" to the caller without leaving the flow of the code. In the example, we creating `N` items as requested, but we can do something like "When all items generated, also create a bonus item when the amount is greater than 1000" (I couldn't think in a better example 😱 )

```csharp
public IEnumerable<Item> GenerateEnumerable(DoSomethingRequest request)
{
    for (var i = 0; i < request.Amount; i++)
    {
        yield return Item.Create(request.RaffleId);
    }
    if (request.Amount > 1_000)
    {
        yield return Item.Create(request.RaffleId);
    }
}
```

And since this code isn't bringing anything to memory, we can't have a benchmark on it 😄.

And if we need, for some reason bring all those items into memory we can do it easily with any `.To..` method, for example `.ToList()`, and so on.

But this was only the first refactor we made, because there is another trouble in the original code. We are creating those instances to do something (of course), and what we want is: insert it into a Postgres database, but we'll talk about it in another seed.

### References and you must read it, trust me

[Microsoft Official Docs](https://learn.microsoft.com/en-us/dotnet/api/system.collections.ienumerable?view=net-8.0)

[IEnumerable UseCases](https://www.bytehide.com/blog/ienumerable-csharp)

> 📘 Seed
>
> For now, this is all I have to write about it. When I notice something that can be improved in this seed, I will update it. But if you find something that could be added, or if I said something incorrect, feel free to correct me in the comments, and I'll update the seed later. Thank you for your time reading up to here!
