---
tags:
  - "clippings"
title: "Generational indices guide"
source: "https://lucassardois.medium.com/generational-indices-guide-8e3c5f7fd594"
author:
  - "[[Lucas S.]]"
published: 2021-06-20
created: 2024-11-12
description: "Today we are going to explore the world of generational indices datastructures. We will also see how to implement such datastructure in Rust. This post will use Rust for showing code, but concepts…"
---
[

![Lucas S.](https://miro.medium.com/v2/resize:fill:88:88/1*wParvehYeuiiFutQSOjdag.jpeg)

](https://lucassardois.medium.com/?source=post_page---byline--8e3c5f7fd594--------------------------------)

Today we are going to explore the world of generational indices datastructures. We will also see how to implement such datastructure in Rust.  
今天，我们将探索分代索引数据结构的世界。我们还将看到如何在 Rust 中实现这样的数据结构。

*This post will use Rust for showing code, but concepts can be applied to other programming languages. The need for generational indices based datastrcture arise mostly in languages that must handle memory management such as Rust, C, C++…  
这篇文章将使用 Rust 来展示代码，但概念可以应用于其他编程语言。对基于分代索引的数据结构的需求主要出现在必须处理内存管理的语言中，例如 Rust、C、C++......*

*Inspired by* [*Catherine West’s closing keynote at RustConf 2018*](https://www.youtube.com/watch?v=aKLntZcp27M)*, presented in the context of an Entity-Component-System for games programming.*  
*受到* [*Catherine West 在 RustConf 2018 上的闭幕主题演讲*](https://www.youtube.com/watch?v=aKLntZcp27M)的启发*，该演讲在游戏编程的实体-组件-系统的上下文中呈现。*

## The issue 问题

Let’s say that we want to modelise a graph. A graph is a self-refential structure such as `A <- knows -> B` : `A` need keep something in it’s memory representation to find `B` . And `B` need to keep something to find `A` . **One way** to solve this issue is using indices.  
假设我们想要对图形进行建模。A 图是一种自引用结构，例如 `A <- 知道 -> B` ： `A` 需要在其内存表示中保留一些东西才能找到 `B` 。`B` 需要保留一些东西才能找到 `A` 。解决此问题**的一种方法是使用**索引。

The main issue of using indices is when you need to remove graph vertices, such as `A` or `B` , you must remove the vertex from it’s container and you remove it’s index for every other vertices. Then you either let created holes in the vertices container or fill them which lead to a huge perfomance cost.  
使用索引的主要问题是当您需要删除图形顶点（例如 `A` 或 `B`）时，您必须从其容器中删除顶点，并删除所有其他顶点的索引。然后，您可以在顶点容器中让创建的孔洞或填充它们，这会导致巨大的性能成本。

If you are clever you may wan to use an array not directly over vertices but over vertices or nothing: `Vec<Option<Vertex>>` in Rust. When deleting this will lead to the [ABA problem](https://en.wikipedia.org/wiki/ABA_problem). The ABA problem can be found when applying the following set of operations:  
如果你很聪明，你可能希望不要直接在顶点上使用数组，而是在顶点上使用数组：`Rust 中的 Vec<Option<Vertex>>`。删除此内容时，将导致 [ABA 问题](https://en.wikipedia.org/wiki/ABA_problem)。在应用以下操作集时，可以发现 ABA 问题：

- `A` references `B` at index 1  
`A` 在索引 1 处引用 `B`
- Someone delete `B` setting the value at index 1 to `None` (no “value” in Rust language)  
有人删除了 `B`，将索引 1 处的值设置为 `None`（在 Rust 语言中没有“值”）
- Someone else create the vertex `C` at the first available index 1 because the element there is `None`  
其他人在第一个可用索引 1 处创建顶点 `C`，因为那里的元素为 `None`
- `A` now incorrectly references `C` when using a get operation, when instead it should fail  
现在，在使用 get 操作时，`A` 会错误地引用 `C`，而它应该会失败

**The solution and how it works  
解决方案及其工作原理**

The solution to this issue is generational indices. The idea behind generational indices is to attach a *generation* to each indices and value in the array. This generation is a monotonically increasing counter. Let’s call the union of *index* and a *generation* a **key**. When we want to get the element of our collection we will supply our key. When removing elements from the collection we increase the generation attached to that element. When we get elements we check the generation of the provided index to the generation attached with the value if the generation does not match it means that the item inside has changed. This solution solve the ABA problem. Let’s dive into the details of one implementation of generational indices on an array. The following figure show the idea:  
这个问题的解决方案是代际索引。分代索引背后的想法是将*分代*附加到数组中的每个索引和值。这一代是一个单调递增的计数器。我们将 *index* 和 *generation* 的并称为 **key**。当我们想获取集合的元素时，我们将提供我们的 key。从集合中删除元素时，我们会增加附加到该元素的生成。当我们获取元素时，我们会检查所提供索引的生成与附加值的生成，如果生成不匹配，则表示里面的项目已更改。此解决方案解决了 ABA 问题。让我们深入了解数组上分代索引的一个实现的细节。下图显示了这个想法：

![](https://miro.medium.com/v2/resize:fit:700/1*jZrDYEJKEnWmia4FhDqncQ.png)

Inserterting new elements in an array produce keys  
在数组中插入新元素会生成键

![](https://miro.medium.com/v2/resize:fit:700/1*9b96pzbqS_0Ln2qZMtkdTA.png)

To get values we just need to provide their keys  
要获取值，我们只需要提供它们的键

![](https://miro.medium.com/v2/resize:fit:700/1*KKkOrAxwGADGrXKfbDpSRg.png)

We remove element by passing the key, then the value at the key’s index is removed and the generation is increased  
我们通过传递 key 来删除 element，然后删除 key 索引处的值并增加生成

![](https://miro.medium.com/v2/resize:fit:700/1*y4VKsW43oijUaDezq6tmFQ.png)

We insert vertex C in the first available space, returning a new key with a generation matching the one in the array entry, NOTE: the key returned has index: 0 and not 1 :)  
我们在第一个可用空间中插入顶点 C，返回一个新键，其生成与数组条目中的生成匹配，注意：返回的键具有 index： 0 而不是 1 :)

![](https://miro.medium.com/v2/resize:fit:700/1*8m5ZveNixOA78fm2gHQ8hw.png)

The key’s generation do no match the entry’s generation this means that the key now point to invalid data, return an empty result  
键的生成与条目的生成不匹配，这意味着该键现在指向无效数据，返回空结果

![](https://miro.medium.com/v2/resize:fit:700/1*ChHCYtpf8rfGqMohJ3M3QA.png)

Yet, key C point to the correct data!  
然而，关键 C 指向正确的数据！

As we can see from the previous figures, once a key get created it will always point to some index is in the array avoiding errors. If the generation **do not match** the value will be considered removed. Else, the value is returned.  
从前面的图中我们可以看出，一旦创建了 key，它将始终指向数组中的某个索引，从而避免错误。如果生成**不匹配**，则该值将被视为已删除。否则，则返回该值。

**My toy GenVec 我的玩具 GenVec**

Let’s review the following **toy** implementation of general indices on an array in Rust.  
让我们回顾一下 Rust 中数组上通用索引的 **toy** 实现。

The most important thing that we can see in this implementation not shown in the figures above is the need of `free_head` variable. This structure membere of `GenVec` let us know the first free index of the array. Then each `Free` enum variant point to the next free entry.  
在这个实现中，我们可以看到的最重要的事情上图中没有显示，那就是需要`free_head`变量。`GenVec` 的这个结构成员让我们知道数组的第一个 free 索引。然后，每个 `Free` 枚举变体都指向下一个 Free 条目。

Also note that we used an `u32` for the generation. Meaning that it may panic if we remove and reuse -**a lot**\- the same key. But, this should note be a concern for most user usage.  
另请注意，我们在这一代使用了 `u32`。这意味着如果我们删除并大量重用相同的 key，它可能会 panic。但是，这应该注意大多数用户使用都是一个问题。

**Available crates 可用的 crate**

The best Rust crate for an already implemented collection using generational indices is [slotmap](https://docs.rs/slotmap/1.0.3/slotmap/) : which provide multiple [implementations](https://docs.rs/slotmap/1.0.3/slotmap/#choosing-slotmap-hopslotmap-or-denseslotmap) as well as cool features such as secondary map and custom keys. Caution, this crate is some unsafe code.  
对于已经使用分代索引实现的集合，最好的 Rust crate 是 [slotmap](https://docs.rs/slotmap/1.0.3/slotmap/) ：它提供多种[实现](https://docs.rs/slotmap/1.0.3/slotmap/#choosing-slotmap-hopslotmap-or-denseslotmap)以及很酷的功能，例如辅助 map 和自定义键。注意，这个 crate 是一些不安全的代码。

If you don’t need to go fancy [generational-arena](https://docs.rs/generational-arena/0.2.8/generational_arena/) is a simpler but safe implementation.  
如果您不需要花哨，[generational-arena](https://docs.rs/generational-arena/0.2.8/generational_arena/) 是一种更简单但安全的实现方式。