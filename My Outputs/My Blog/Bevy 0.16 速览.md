---
title: "Bevy 0.16 速览"
Status: 🟩
tags:
  - note
  - output/blog
Links:
  - "[[Bevy MOC]]"
Created: 2025-04-25
BevyVersion:
  - "0.16"
share: true
Finished: 2025-04-25
---
Bevy 0.16 刚刚发布 [新闻](https://bevyengine.org/news/bevy-0-16/)


* GPU 驱动渲染(GPU-Driven Rendering)
ECS 关系(ECS Relationships)
* `no_std` 支持(no_std Support)
* 程序化大气散射(Procedural Atmospheric Scattering)
* 贴花(Decals)
* 遮挡剔除(Occlusion Culling)
* 改进的生成 API(Improved Spawn API)
* 统一的错误处理(Unified Error Handling)
* 更快的坐标变换传播(Faster Transform Propagation)

其中这次0.16更新, 我认为重要是下面几个特性

## cpu 驱动渲染流程
在0.16之前, Bevy 使用的是CPU 驱动渲染.
1、从在CPU端通过相机的视锥体裁剪和遮挡裁剪, 获取所有要渲染的对象.
对每个对象
* CPU将位置(transform),网格(mesh),材质(material),纹理(texture),缓冲区如光照(buffer), 上传到GPU
* CPU 发出绘制命令(drawcall)
* GPU 渲染对象.
## gpu驱动渲染流程
1、CPU上传一个包含所有对象信息的缓冲区给GPU, GPU批量处理对象.
2、如果上一帧有新对象生成, CPU会把新的对象信息填充到缓冲区,并标明新的数据位置.
3、如果上一帧有材质被修改,CPU会把材质信息上传到GPU.
4、CPU上传本帧要渲染的对象列表.列表里只有对象的整数ID引用,所以列表很小, 根据场景大小和复杂度,会创建多个列表.
5、对每个对象列表
* CPU 发出drawcall.
* GPU 处理列表里所有的对象,进行裁剪, 确认哪些对象是可见的.
* GPU 渲染对象

对有几万个对象的大场景,  GPU驱动渲染会比CPU驱动渲染开销减少3倍以上. 主要是将比较复杂的裁剪计算放到的GPU里, 并且大幅度减少了drawcall 请求.

## 目前的GPU渲染的限制
新的GPU驱动渲染用了Multi-draw indirect (万人同屏渲染所需技术),   Bindless resources  等新技术, 对平台和显卡驱动有要求,具体兼容性表格如下:

| OS      | Graphics API | GPU transform | Multi-draw & GPU cull | Bindless resources |
| ------- | ------------ | ------------- | --------------------- | ------------------ |
| Windows | Vulkan       | ✅             | ✅                     | ✅                  |
| Windows | Direct3D 12  | ✅             | ❌                     | ❌                  |
| Windows | OpenGL       | ✅             | ❌                     | ❌                  |
| Linux   | Vulkan       | ✅             | ✅                     | ✅                  |
| Linux   | OpenGL       | ✅             | ❌                     | ❌                  |
| macOS   | Metal        | ✅             | ❌                     | ➖¹                 |
| iOS     | Metal        | ✅             | ❌                     | ➖¹                 |
| Android | Vulkan       | ➖²            | ➖²                    | ➖²                 |
| Web     | WebGPU       | ✅             | ❌                     | ❌                  |
| Web     | WebGL 2      | ❌             | ❌                     | ❌                  |

¹ Bevy 支持在 Metal 上使用无绑定资源，但当前限制明显较低，可能会导致更多的绘制调用。
² 一些已知在 Bevy 工作负载中存在问题的 Android 驱动程序已被列入黑名单，这会导致 Bevy 回退到 CPU 驱动渲染。

## 未来展望
目前GPU驱动渲染只对3D 渲染管道起作用, 其他2D渲染管道、精灵、UI还是由CPU驱动渲染. 后续Bevy会将更多的工作交由GPU驱动渲染.
这次Bevy 0.16 还尝试性的加入了 [WESL](https://wesl-lang.dev/)的支持. WESL 是WGSL的扩展版本,支持下面两个特性:
* imports
  可以将着色器拆分为模块化, 可重复使用的文件
* conditional compiliation
  条件编译, 可以根据传递给WESl的参数编译出不同的shader.

千呼万唤始出来,没有Relation前,  实体与实体的之间一般关系用Parent/Children关系维护, 不然要自己实现一套机制来维护.
Bevy 0.16 初步实现了 [`Relationship`](https://docs.rs/bevy/0.16/bevy/ecs/relationship/trait.Relationship.html),  解读一下官方示例
```rust
/// 这是一个 关系(relationship) 组件.
/// 这个组件的关系目标(relationship target) 是 `LikedBy`
#[derive(Component)]
#[relationship(relationship_target = LikedBy)]
struct Likes(pub Entity);

/// 这是一个 关系目标(relationship target) 组件.
/// 它会自动维护所有拥有 `Likes` 组件的实体列表
#[derive(Component, Deref)]
#[relationship_target(relationship = Likes)]
struct LikedBy(Vec<Entity>);

//  增加关系
let e1 = world.spawn_empty().id();
let e2 = world.spawn(Likes(e1)).id();
let e3 = world.spawn(Likes(e1)).id();

// e1 is liked by e2 and e3 
let liked_by = world.entity(e1).get::<LikedBy>().unwrap();
assert_eq!(&**liked_by, &[e2, e3]);
```
在早期版本中我想实现一架飞机发射导弹, 导弹命中时想知道是谁发射的, 关系维护用了很大一圈查询. ECS有了关系就方便很多了.
注意Bevy目前0.16的ECS关系还是一对多(one-to-many).

# [no_std] 支持
Bevy 已经开始对 [no_std] 特性进行支持, 虽然在一些平台上对渲染、音频、资产缺少API支持, 但社区里已经有人在GBA掌机上成功运行Bevy了
![image.png](https://assets.zool.me/2025/04/f740a377bc41fd90496effc0c6265a77.png)

我在树莓派4 上跑过std的bevy,  如果可能, 国内的其他一些嵌入式硬件也有可能运行bevy? 

## 统一 错误处理
之前Bevy将错误处理都留给用户自己处理,   错误要么Panic, 要么内部捕获后用其他传出来.
现在Bevy 0.16 的 系统、观察者和命令现在支持返回Result.
``` rust
pub type Result<T = (), E = BevyError> = core::result::Result<T, E>;
```
BevyError 类似于 anyhow, 接受任何错误类型.
所有的错误现在交由[`GLOBAL_ERROR_HANDLER`](https://docs.rs/bevy/0.16/bevy/ecs/error/static.GLOBAL_ERROR_HANDLER.html)进行处理,  默认还是Panic.
部署到生产环境可以通过下面的方式切换到日志记录错误
``` rust
GLOBAL_ERROR_HANDLER  
    .set(warn)  
    .expect("The error handler can only be set once, globally.");
```

# 其他特性
## 程序化大气散射
![image.png](https://assets.zool.me/2025/04/62ac3f7314a672c250291cef7509d110.png)

## 贴花
### Forward Decals  前向贴花
![image.png](https://assets.zool.me/2025/04/be8e046a8e9af01d118973d8f36ddf40.png)

### Clustered Decals  集群贴花
![image.png](https://assets.zool.me/2025/04/625774b85077cde6c81679c12448bb11.png)
