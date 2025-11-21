---
Status: 🌲
tags:
  - note
  - output/blog
Links:
  - "[[Bevy MOC|Bevy MOC]]"
Created: 2024-11-13T13:10:26
share: true
---
![[Bevy ECS 介绍|Bevy ECS 介绍]]

## Bevy Entity 结构
当我们打印/调试时， 经常看到`Entity`的Display/Debug输出是这样的
```
enemy entity: 1v1
player entity: 3v1
```
为什么呢？ 我们看一下Entity的源码
```rust
// 简化注释和代码
pub struct Entity {
    index: u32,
    generation: NonZeroU32,
}
```
可以看到Entity内部存储了index和generation两个值，但为什么要存储这两个值呢？ 索引用一个usize不能解决吗？
bevy在文档里提到了这里使用了[分代索引](https://lucassardois.medium.com/generational-indices-guide-8e3c5f7fd594)设计,它是一种复合索引，由两部分组成：
1. **Index**：一个唯一的标识符，用于快速查找对象。
2. **Generation**：一个计数器，用于区分同一索引在不同时间点上引用的对象
## 问题来源
ECS架构会牵涉到大量的实体创建/销毁, 因此会实现回收id。如果只用了一个usize做索引，会带一个[ABA](https://en.wikipedia.org/wiki/ABA_problem)的问题。
比如说:
创建`A`， index为0。
创建`B`， index为1。
A自己创建了`B`的索引，标记index为1。
有人删除了`B`，又创建了`C`，index也为1。
此时`A`用index=1去引用`B`， 但实际上却会拿到`C`
## 解决方案
代际索引就是将`Index`和`Generation`合并起来组成了一个key。当我们删除Entity时，会将其Generation增加，这样原来的key和现在新的key不一致，从而解决ABA问题。
用文章里的图解释一下:

![](https://miro.medium.com/v2/resize:fit:700/1*jZrDYEJKEnWmia4FhDqncQ.png)
*在数组中插入新元素会生成key*

![](https://miro.medium.com/v2/resize:fit:700/1*9b96pzbqS_0Ln2qZMtkdTA.png)

*要获取值，我们只需要提供它们的key*

![](https://miro.medium.com/v2/resize:fit:700/1*KKkOrAxwGADGrXKfbDpSRg.png)

*我们通过传递 key 来删除 element，然后删除 key 索引处的值并增加生成*

![](https://miro.medium.com/v2/resize:fit:700/1*y4VKsW43oijUaDezq6tmFQ.png)

*我们在第一个可用空间中插入顶点 C，返回一个新key，其生成与数组条目中的生成匹配，注意：返回的key具有 index:  0 而不是 1。*

![](https://miro.medium.com/v2/resize:fit:700/1*8m5ZveNixOA78fm2gHQ8hw.png)

*key的生成与条目的生成不匹配，这意味着该key现在指向无效数据，返回空结果*

![](https://miro.medium.com/v2/resize:fit:700/1*ChHCYtpf8rfGqMohJ3M3QA.png)

*然而Key C 指向正确的数据C！*
## 结论
Bevy ECS 使用了代际索引机制，解决了在对象频繁创建和销毁的情况下，高效管理和查找对象的问题。
## 参考文档 
* [docs](https://docs.rs/bevy/latest/bevy/ecs/entity/struct.Entity.html)
* [Generational indices guide](https://lucassardois.medium.com/generational-indices-guide-8e3c5f7fd594)
* [Making the most of ECS identifiers](https://ajmmertens.medium.com/doing-a-lot-with-a-little-ecs-identifiers-25a72bd2647)