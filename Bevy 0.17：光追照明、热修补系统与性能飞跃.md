---
Status: 
tags:
  - note
Links: 
Created: 2025-10-01T07:59:52
BevyVersion:
share:
---
# Bevy 0.17：光追照明、热修补系统与性能飞跃

![Bevy 0.17 发布](https://bevy.org/news/bevy-0-17/cover.jpg)
*来自 Exofactory 的工厂场景，一个使用 Bevy 开发中的工厂建造游戏*

**Bevy 0.17 正式发布！** 278 位贡献者，1311 个拉取请求，这个版本带来了实验性的实时光线追踪、Rust 代码热重载、以及能渲染超千亿三角形的虚拟几何系统。让我们一起看看这个里程碑版本为 Rust 游戏开发带来了什么。

> 原文链接：[Bevy 0.17 Release Notes](https://bevy.org/news/bevy-0-17/)

## 🌟 核心亮点速览

- **Bevy Solari**：实时光线追踪全局光照系统
- **系统热修补**：无需重编译，实时更新 Rust 代码
- **虚拟几何 BVH**：渲染 1150 亿三角形仅需 3.5ms
- **DLSS 支持**：AI 驱动的超采样和降噪
- **UI 系统革新**：专用 2D 变换、渐变支持、无头组件库
- **自动反射注册**：告别繁琐的类型注册

## 💡 实时光线追踪：Bevy Solari 横空出世

想象一下，你的游戏中每个发光物体都能真实地投射光线，数百个光源同时产生准确的阴影，而这一切都是动态的、实时的。这就是 **Bevy Solari** 带来的魔法。

### 光线追踪渲染流程

![噪点直接光照](https://bevy.org/news/bevy-0-17/noisy_di.jpg)
*原始的直接光照输出（充满噪点）*

![噪点全局光照](https://bevy.org/news/bevy-0-17/noisy_gi.jpg)
*原始的全局光照输出（充满噪点）*

![降噪后的完整图像](https://bevy.org/news/bevy-0-17/denoised_full.jpg)
*经过降噪、抗锯齿处理后的最终合成图像*

### DLSS 带来的画质提升

![无抗锯齿](https://bevy.org/news/bevy-0-17/no_aa.jpg)
*无抗锯齿效果*

![DLSS效果](https://bevy.org/news/bevy-0-17/dlss.jpg)
*DLSS 启用后的效果*

DLSS 不仅提供了出色的抗锯齿效果，还通过 AI 超采样技术大幅提升了画面质量，同时保持了优秀的性能表现。在支持的 NVIDIA RTX GPU 上，DLSS 能够显著改善 Bevy Solari 的渲染质量。

### 工作原理简述

Solari 使用 GPU 光线追踪技术，通过 ReSTIR DI/GI 算法采样光照，并使用世界空间辐照缓存提升全局光照质量。简单来说，它模拟真实世界中光线的传播方式，让你的游戏画面更加真实。

### 两种渲染模式

```bash
# 高质量参考模式（用于截图和效果验证）
cargo run --release --example solari --features bevy_solari -- --pathtracer

# 实时渲染模式（游戏运行时使用）
cargo run --release --example solari --features bevy_solari
```

### 与 DLSS 的完美配合

光线追踪的原始输出往往充满噪点，这时 NVIDIA DLSS 就派上用场了。DLSS 的光线重建功能能够智能降噪，让画面既清晰又流畅。虽然目前仅支持 NVIDIA RTX GPU，但未来会支持 AMD FSR 和 Intel XeSS。

## ⚡ 性能突破：虚拟几何的疯狂数字

![大量龙模型渲染](https://bevy.org/news/bevy-0-17/mesh_bvh.jpg)
*130,000 条龙模型实时渲染，超过 1150 亿个三角形*

Bevy 的虚拟几何系统通过 BVH（包围盒层次结构）剔除技术实现了惊人的性能提升。现在渲染成本几乎与场景几何复杂度无关！

### 震撼的性能数据

准备好被震撼了吗？在 RTX 4070 上：

- **130,000 条龙**（每条约 870,000 个三角形，总计约 1150 亿个三角形）：渲染时间仅 3.5ms
- **1,000,000 条龙**（约 9000 亿个三角形）：渲染时间仅 4.5ms

更令人印象深刻的是：**8 倍的场景复杂度仅增加 30% 的 GPU 时间**！

相比 Bevy 0.16 版本，1,300 实例场景的渲染时间从 2.2ms 降至 1.3ms，**性能提升了 41%**！这意味着你可以创建前所未有的复杂场景，而不用担心性能问题。这种级别的性能突破为大规模开放世界游戏和复杂场景开辟了全新的可能性。

## 🔥 热重载：Rust 开发的游戏规则改变者

还在为每次改代码都要等待漫长的编译而烦恼吗？Bevy 0.17 的系统热修补功能让你能够：

1. 修改系统代码
2. 保存文件
3. **立即**在运行中的游戏里看到效果

```rust
// 启用热重载很简单
// 在 Cargo.toml 中添加：
[features]
hotpatching = ["bevy/hotpatching"]

// 然后你的系统就可以实时修改了！
fn my_game_system(mut query: Query<&mut Transform>) {
    // 修改这里的代码，保存，立即生效！
}
```

虽然目前仅支持二进制 crate 且不支持 WebAssembly，但这已经极大提升了原型开发速度。

## 🎨 UI 系统的全面进化

### UI 渐变系统

![UI 渐变效果](https://bevy.org/news/bevy-0-17/ui_gradients.jpg)
*Bevy 0.17 支持的各种 UI 渐变效果*

### 分边框颜色

![UI 边框颜色](https://bevy.org/news/bevy-0-17/ui_border_colors.jpg)
*每个边都可以设置不同的颜色*

### 专用的 UI 变换系统

告别通用的 `Transform`，迎接专为 UI 设计的 `UiTransform`：

```rust
// 之前
commands.spawn((
    Node::default(),
    Transform::from_xyz(100.0, 50.0, 0.0),
));

// 现在 - 更清晰、更高效
commands.spawn((
    Node::default(),
    UiTransform::from_xy(100.0, 50.0),
));
```

### 炫酷的渐变效果

UI 渐变支持三种类型：**线性渐变**、**锥形渐变**和**径向渐变**，可以与 `BackgroundColor` 组合使用，创造出丰富的视觉效果。

```rust
// 创建彩虹渐变按钮
commands.spawn((
    Node::default(),
    BackgroundGradient::new_linear(
        LinearGradient::new(90.0) // 90度角
            .with_stop(Color::RED, 0.0)
            .with_stop(Color::YELLOW, 0.5)
            .with_stop(Color::GREEN, 1.0)
    ),
));

// 径向渐变效果
commands.spawn((
    Node::default(),
    BackgroundGradient::new_radial(
        RadialGradient::new()
            .with_stop(Color::WHITE, 0.0)
            .with_stop(Color::BLACK, 1.0)
    ),
));
```

这些渐变效果不仅可以用于背景，还可以应用于边框，为 UI 设计提供了更大的创意空间。

### 实验性 UI 框架

#### Bevy Feathers：专业的开发者工具 UI

![Bevy Feathers 组件](https://bevy.org/news/bevy-0-17/feathers.jpg)
*Bevy Feathers 提供的专业 UI 组件展示*

**Bevy Feathers** 是为即将推出的 Bevy 编辑器设计的专业 UI 组件库。它提供了统一的视觉风格和完整的功能集：

- **标准组件**：按钮、滑块、复选框、菜单等
- **布局容器**：灵活的排版系统
- **主题支持**：可自定义的视觉风格
- **辅助功能**：内置屏幕阅读器支持
- **虚拟键盘**：适用于触屏设备的文本输入

![Rerecast 编辑器](https://bevy.org/news/bevy-0-17/rerecast.jpg)
*使用 Feathers 构建的 Rerecast 导航网格编辑器*

社区已经开始使用 Feathers 构建工具，例如 [Rerecast Editor](https://github.com/janhohenheim/rerecast)（导航网格编辑器）就展示了 Feathers 的强大能力。

#### 无头组件：完全的样式控制

**无头组件库**提供纯逻辑组件，不包含任何视觉样式。这让你可以完全控制 UI 的外观，同时享受经过充分测试的交互逻辑：

- 正确的键盘导航
- 无障碍支持
- 状态管理
- 事件处理

这种方式借鉴了 Web 开发中流行的 headlessui 和 reakit 等库的设计理念。

## 🛠️ 开发者体验大幅提升

### 自动反射注册

```rust
// 之前：需要手动注册每个类型
app.register_type::<Player>()
   .register_type::<Enemy>()
   .register_type::<Health>();

// 现在：自动完成！
#[derive(Component, Reflect)]
struct Player { /* ... */ }  // 自动注册
```

### 实时性能监控

新增的帧时间图表让性能分析变得简单直观：

```rust
app.add_plugins(FpsOverlayPlugin);
// 绿色 = 达到目标 FPS
// 红色 = 需要优化
```

这个工具可以实时显示帧时间历史，帮助开发者快速识别性能瓶颈。

### Web 资源加载

```rust
// 直接从网络加载资源
let texture = asset_server.load("https://example.com/sprite.png");
```

## 🎮 更多视觉和交互特性

### 瓦片地图分块渲染

![瓦片地图渲染](https://bevy.org/news/bevy-0-17/tilemap.jpg)
*高性能的瓦片地图分块渲染系统*

作为 Bevy 内置瓦片地图系统的第一个构建块，提供了高性能的分块渲染方式。

### 实时过滤环境贴图

![大气反射](https://bevy.org/news/bevy-0-17/atmosphere_reflections.jpg)
*动态生成的环境贴图与大气渲染完美配合*

动态生成的环境贴图与大气渲染完美配合，无需预烘焙即可获得高质量的环境光照。

### Text2d 增强效果

![Text2d 阴影](https://bevy.org/news/bevy-0-17/text2d_shadow.jpg)
*Text2d 投影阴影效果*

![Text2d 背景](https://bevy.org/news/bevy-0-17/text2d_background.jpg)
*Text2d 背景色支持*

Text2d 现在支持投影阴影和背景色，让世界空间文本更加美观。

### 光照纹理（Light Cookies）
使用纹理调制光照强度，可以创造窗户投影、树叶阴影等各种艺术效果。

### 大气渲染模式
Bevy 的程序化大气系统现在提供两种渲染模式：
- **Raymarched**：更精确的光照，适合电影镜头和太空视角
- **LookupTexture**：更快速，适合地面场景

### ViewportNode 渲染
新的 `ViewportNode` 组件让你可以将相机输出直接渲染到 UI 节点，非常适合创建小地图、分屏效果或游戏内监控画面。

## 📝 升级注意事项

主要破坏性变更：

1. **事件系统**：`Trigger` → `On`
2. **UI 变换**：`Transform` → `UiTransform`  
3. **系统集命名**：统一使用 `*Systems` 后缀
4. **glTF 导入**：坐标系处理有变化

详细迁移指南请参考官方文档。

## 🎯 总结

Bevy 0.17 不仅仅是一次更新，它是 Bevy 向世界级游戏引擎迈进的坚实一步。光线追踪展示了渲染的未来，热重载解决了 Rust 开发的痛点，性能突破打开了新的可能性。

### 下一步计划

根据官方路线图，Bevy 团队正在开发：

- **BSN 系统**：新一代场景/UI 系统，计划在 0.18 发布
- **完整 UI 框架**：基于 Feathers 的扩展，提供更多组件
- **实体检查器**：强大的调试工具，使用 Feathers 构建
- **Firewheel 音频**：通过 `bevy_seedling` 集成的生产级音频方案

更重要的是，这个版本为即将到来的可视化编辑器奠定了基础。Bevy 正在快速成长为一个功能完备、开发者友好的现代游戏引擎。

**现在是加入 Bevy 社区的最佳时机！** 无论你是 Rust 老手还是游戏开发新手，Bevy 0.17 都为你准备了强大的工具和无限的可能。

---

*想要开始使用 Bevy 0.17？查看 [官方文档](https://bevyengine.org/learn/) 和 [示例代码](https://github.com/bevyengine/bevy/tree/main/examples)。加入 [Discord 社区](https://discord.gg/bevy) 与其他开发者交流！*