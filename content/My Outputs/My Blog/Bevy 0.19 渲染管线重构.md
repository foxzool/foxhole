---
Status: 🟩
tags:
  - output/blog
  - bevy
  - rust
  - rendering
  - game-dev
Links: "[[Bevy MOC]]"
Created: 2026-05-14
title: Bevy 0.19 渲染管线重构
updated: 2026-05-14
Finished: 2026-05-14
share: true
---
# Bevy 0.19 渲染管线重构

升级 `bevy_fog_of_war` 到 0.19 时，编译器报了几十条和 `render_graph` 相关的错误。不是简单的版本号替换，是整个渲染执行模型换了。

## 从节点到系统

Bevy 的渲染管线**此前一直**用了一套「渲染图」抽象：你把渲染逻辑写成 `Node`，注册到 `RenderGraph`，再用 `RenderLabel` 做依赖排序。这套设计从 Bevy 0.6 左右开始成型，灵感明显来自图形学里的 render graph 论文（Yuriy O'Donnell 2017 那篇 *"FrameGraph: A Retained Mode Rendering Architecture"*），核心是声明式依赖 + 自动资源生命周期管理。

Bevy 的实现做了 ECS 化改造：Node 不是纯函数，而是带 `run()` 方法的 trait 对象，通过 `RenderGraphContext` 读写 GPU 资源。这在早期很清晰——每个 Node 职责单一，拓扑排序自动处理执行顺序。

但到了 0.19，这套机制被干掉了。`Node`、`ViewNode`、`RenderLabel`、`add_render_graph_node`、`add_render_graph_edge` 全部标记为移除。替代方案是**普通 ECS system**，注册到 `Core2d` 或 `Render` schedule，用 `.before()` / `.after()` 控制顺序。

官方 migration guide 的解释很克制：「RenderGraph schedule remains as the top-level schedule for non-camera rendering」。翻译过来就是：以前那个图结构还叫 `RenderGraph`，但它现在只是一个 `Schedule` Label，里面跑的是普通 system，不再是 Node trait。

## 为什么改

没见到官方**设计文档**详细论证，但从工程角度看动机很明显：

1. **ECS 一致性**。Node 和 system 两套并行抽象，学习曲线陡。Node 的 `run()` 签名和 system 函数完全不同，参数通过 `RenderGraphContext` 透传，而不是 ECS query。
2. **Compose 困难**。Node 之间的依赖是静态图边，而 ECS 的 system ordering 更灵活（conditional、run criteria、dynamic set）。
3. **维护负担**。Node trait 需要 `ViewNodeRunner` 等额外脚手架，0.19 的 `RenderContext` 直接作为 system parameter 后，这些 wrapper 没必要存在。

## 实战：三个节点的迁移

`bevy_fog_of_war` 里有三个 Node 需要改。迁移模式出奇一致：拆 trait impl，改成普通函数，参数从 `RenderGraphContext` 透传改为 ECS system parameter。

### 1. Compute Node → System

```rust
// 0.18: impl Node for FogComputeNode
impl Node for FogComputeNode {
    fn run(&self, graph: &mut RenderGraphContext, ctx: &mut RenderContext, world: &World) {
        // 从 world 取 resource，从 graph 取输入
    }
}

// 注册
render_app.add_render_graph_node::<FogComputeNode>(Core2d, FogComputeNodeLabel);
```

```rust
// 0.19: 普通 system
pub fn fog_compute_system(
    mut render_context: RenderContext,
    pipeline_cache: Res<PipelineCache>,
    compute_pipeline: Res<FogComputePipeline>,
    // ... 其他 ECS parameter
) {
    let Some(pipeline) = pipeline_cache.get_compute_pipeline(compute_pipeline.pipeline_id) else {
        return; // pipeline 还没编译好，下帧再说
    };
    let mut pass = render_context
        .command_encoder()
        .begin_compute_pass(&ComputePassDescriptor::default());
    pass.set_pipeline(pipeline);
    // ... dispatch
}

// 注册
render_app.add_systems(Core2d, fog_compute_system);
```

变化很小：把 `run()` 的参数摊平成 system parameters，`graph` 和 `ctx` 合并成 `RenderContext`。

### 2. ViewNode → System + Query

ViewNode 是带 view 过滤的 Node，以前由 `ViewNodeRunner` 帮你遍历所有 camera view。现在直接写 `Query`：

```rust
// 0.19
pub fn fog_overlay_system(
    mut render_context: RenderContext,
    views: Query<(Entity, &ViewTarget, &ViewUniformOffset), Without<SnapshotCamera>>,
    // ...
) {
    for (entity, view_target, view_uniform) in views.iter() {
        // 每个 view 执行一次 overlay render pass
        let mut pass = render_context.begin_tracked_render_pass(...);
        // ... draw fullscreen quad
    }
}
```

`Without<SnapshotCamera>` 排除快照相机，以前 ViewNode 的 `ViewNode::run()` 返回 `Option<()>` 做同样的事，但 ECS Query 的表达力更强。

### 3. Snapshot Node → System

Snapshot 复制逻辑原来也在 Node 里，现在放到 `Render` schedule（不是 `Core2d`）：

```rust
render_app.add_systems(Render, snapshot_copy_system);
```

因为 snapshot 复制需要在 2D 主渲染之后执行，用 `Render` schedule 的默认顺序即可。如果需要更精确控制，加 `.after(Core2d)`——但 `Core2d` 在 0.19 不是 system set，不能直接 `.after()`，得改用 `.after(render_system)` 或者自定义 set。

## 其他 API 碎片

Node → system 是大头，但 0.19 还顺手改了几个边角：

| 0.18 | 0.19 | 场景 |
|---|---|---|
| `push_constant_ranges: vec![]` | `immediate_size: 0` | Compute/Render pipeline descriptor |
| `FilterMode::Linear` | `MipmapFilterMode::Linear` | Sampler descriptor |
| `TextureFormat::bevy_default()` | `TextureFormat::Rgba8UnormSrgb` | 全屏 shader target format |
| `gpu_image.size` | `gpu_image.texture_descriptor.size` | GPU 图像尺寸读取 |
| `gpu_image.texture_format` | `gpu_image.texture_descriptor.format` | GPU 图像格式读取 |
| `Assets::get_mut()` 返回 `&mut T` | 返回 `AssetMut<'_, T>` | 需要显式 `drop()` 或 scope 隔离才能二次借用 |

最后一条 `AssetMut` 是 Rust borrow checker 层面的变化，和渲染无关，但升级时踩坑最多——以前可以连写两次 `images.get_mut()`，现在编译器会报 cannot borrow as mutable more than once。用显式 `{ ... }` scope 包裹或者 `drop(asset_mut)` 释放。

## 一个感受

这次升级让我意识到 Bevy 正在做一件很务实的事：把「特殊机制」逐步回收成「通用机制」。渲染图变成 schedule、Node 变成 system、Asset mutability 统一成 `AssetMut`——这些都不是炫技，是在减少概念数量。对维护者来说，少一套抽象就少一块需要同步文档和修复 bug 的表面。

代价是迁移工作量。三个 Node 加起来不到一千行代码，但理清每个 Node 的输入输出对应哪些 ECS parameter，花了大半天。官方 migration guide 已经写得不错，但遇到 `ViewNode` 这种带 runner 的复合抽象，指南里的「just use a system」略显轻描淡写。

如果你也在升级带自定义渲染的 crate，建议先做一件事：grep 项目里所有 `impl Node`、`impl ViewNode`、`RenderLabel`、`add_render_graph_node` 的出现位置。这些就是 0.19 的变更点清单。按这个清单逐个改成 system，比对着编译错误修要快得多。

---

**参考**
- [Bevy 0.19 Migration Guide](https://bevy.org/learn/migration-guides/0-18-to-0-19/)
- [Bevy #24257: RenderGraph should be pub and exported](https://github.com/bevyengine/bevy/issues/24257)
- [FrameGraph: A Retained Mode Rendering Architecture (O'Donnell 2017)](https://www.gdcvault.com/play/1024612/FrameGraph-A-Retained-Mode-Rendering)
- `bevy_fog_of_war` [PR #8](https://github.com/foxzool/bevy_fog_of_war/pull/8)
