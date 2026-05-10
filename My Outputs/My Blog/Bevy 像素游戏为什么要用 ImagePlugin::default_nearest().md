---

Status: ὾9
tags:
  - output/blog
Links:
  - "[[Bevy MOC]]"
Created: 2026-05-07T19:30:00
title: "Bevy 像素风采样问题复盘"
status: ready
risk: medium
publish_ready: false

audit:
  frontmatter: passed
  facts: warning
  code: passed
  style: passed
  links: passed

audit_score: 88
audit_summary: "style 已修复，教程腔和编号体已去除。facts 中 320×240 素材基准仍需注意验证。"
audit_note: "[[Bevy 像素游戏为什么要用 ImagePlugin::default_nearest().audit]]"
audit_updated: 2026-05-09
audit_agent: "狐言"
blocking_issues: 0
minor_issues: 2
BevyVersion:
  - "0.18"
share: true
Collection: "[[Bevy 技术短文]]"
---
# Bevy 像素游戏为什么要用 `ImagePlugin::default_nearest()`

做像素游戏时发现精灵图放大就糊，查了一下是 Bevy 的默认采样器在作祖。这里记下来为什么要改成 `ImagePlugin::default_nearest()`，以及 Linear / Nearest 的 GPU 采样原理。

---

## 问题背景

### 像素游戏放大时的模糊

像素游戏的素材分辨率通常很低。比如黄金矿工项目的素材是模拟 320×240 这种老游戏的分辨率，在现代屏幕上需要放大到 1280×960 才能看清。如果纹理采样方式不对，放大后的边缘会发虚，失去像素画特有的锐利感。

### Bevy 默认行为 + 30 秒速查

Bevy 的 `DefaultPlugins` 默认用 `ImagePlugin::default_linear()`。对写实风格是合理的，但对像素画是错的。

| 维度      | `default_linear()` | `default_nearest()` |
| ------- | ------------------ | ------------------- |
| 采样纹素数   | 单 mip 层通常 4 次      | 单 mip 层 1 次         |
| 是否创造新颜色 | 边界处产生中间色           | 否，始终返回原始颜色          |
| 放大效果    | 平滑但模糊              | 锐利、像素化              |
| 适合场景    | 照片、3D 纹理           | 像素画、精灵图、UI          |

所以像素游戏一定要显式改成 `ImagePlugin::default_nearest()`。

### 一行代码修复

```rust
// ❌ 默认行为 — 像素画变糊
App::new()
    .add_plugins(DefaultPlugins)

// ✅ 修正后 — 边缘锐利
App::new()
    .add_plugins(
        DefaultPlugins
            .set(ImagePlugin::default_nearest())
    )
```

---

## Nearest vs Linear 原理

### Nearest：1 次采样，不创造新颜色

Nearest 将 UV 坐标映射到最近的纹素：

```
texel_x = floor(u * width)
texel_y = floor(v * height)
return texture[texel_x][texel_y]
```

只读 1 个纹素。结果始终是原始颜色，不会创造新颜色。像素画的硬边缘放大后仍然保持硬边缘。

### Linear：4 次采样，边界产生幽灵像素

Linear 读取目标位置周围的 2×2 纹素四元组，通过加权平均计算结果：

```
1. 转换到 texel-center 坐标: x = u * width - 0.5, y = v * height - 0.5
2. floor 得到左上角索引: i = floor(x), j = floor(y)
3. 计算小数偏移: fx = fract(x), fy = fract(y)
4. 读取 2×2 纹素: c00, c10, c01, c11
5. 两次线性插值:
   top    = lerp(c00, c10, fx)
   bottom = lerp(c01, c11, fx)
   result = lerp(top, bottom, fy)
```

在颜色边界处，Linear 会创造原始纹理中不存在的新颜色。比如黑白边界会产生灰色过渡，像素画精心设计的硬边缘就被破坏了。

### 纹理游走：动态场景下的闪烁

Linear 在动态场景中还有更隐蔽的问题。摄像机以亚纹素精度移动时，小数偏移 `(fx, fy)` 持续变化，导致相邻屏幕像素采样到略有不同的混合比例，产生微妙的闪烁。

对只有 4~32 种颜色的像素画，这种色彩污染会很容易被看出来。

### 对比

| 维度 | Nearest | Linear |
|------|---------|--------|
| 采样次数 | 1 个纹素 | 通常 4 个纹素 |
| 创造新颜色 | 绝不 | 边界处通常会 |
| 边缘外观 | 锐利精确 | 模糊抗锯齿 |
| 非整数缩放 | 可能出现不均匀像素宽度 | 边界模糊、混色 |
| 动态稳定性 | 阶跃切换 | 平滑但有纹理游走 |
| 最适合 | 像素画、UI、文字 | 照片、3D 纹理、渐变 |

---

## Bevy 配置

### 全局设置

文件：`src/main.rs`
```rust
use bevy::{image::ImagePlugin, prelude::*};

fn main() -> AppExit {
    App::new()
        .add_plugins(
            DefaultPlugins
                .set(WindowPlugin {
                    primary_window: Window {
                        title: "Pixel Game".to_string(),
                        resolution: (1280, 960).into(),
                        ..default()
                    }
                    .into(),
                    ..default()
                })
                .set(ImagePlugin::default_nearest()),
        )
        .run()
}
```

`default_nearest()` 同时设了三项：

- `mag_filter: Nearest` — 放大时
- `min_filter: Nearest` — 缩小时
- `mipmap_filter: Nearest` — mip 层级切换

### 单张图片覆盖

理想情况下，全局 Nearest 后某些非像素美术资源（启动画面、照片背景）可以单独覆盖为 Linear。用 `ImageLoaderSettings.sampler`设成 `ImageSampler::linear()`即可。

但有两个很容易踩的坑：

1. 同一路径已经用默认设置加载过，再用 `load_with_settings` 可能复用旧 handle / 旧设置（issue [#11111](https://github.com/bevyengine/bevy/issues/11111)，截至 2026-05 仍为 open）。
2. 从 `ImageSampler::Default` 调 `get_or_init_descriptor()` 再改局部字段，初始化出来的 descriptor 不会对齐当前 `ImagePlugin` 的默认采样器（issue [#17566](https://github.com/bevyengine/bevy/issues/17566)，截至 2026-05 仍为 open）。

所以相对安全的写法是确保第一次加载就显式设 sampler：

```rust
use bevy::image::{ImageLoaderSettings, ImageSampler};

// 确保这个路径没有先被 asset_server.load(...) 用默认设置加载过
asset_server.load_with_settings(
    "images/splash.png",
    |settings: &mut ImageLoaderSettings| {
        settings.sampler = ImageSampler::linear();
    },
);
```

如果需要大量混用 Nearest / Linear，最好把资源路径和加载策略设计清晰，不要让同一个文件路径被不同设置重复加载。

如果是纯像素游戏（不需要混用），这个问题不影响你，直接设 `default_nearest()` 就好。

### mipmap 的影响

如果图片生成了 mipmap，`mipmap_filter` 会影响层级过渡。

- `Nearest`：直接跳到最近的 mip 层，层级之间硬切换
- `Linear`：两个 mip 层级之间插值，过渡平滑但可能边缘发虚

多数 2D 像素游戏固定虚拟分辨率，可以直接避免生成 mipmap，或把 mipmap_filter 也设成 Nearest。如果存在大幅缩小或旋转，mipmap 可能能减少闪烁，但也更容易带来边缘发虚，需要单独看效果。

### wgpu 映射

`ImageFilterMode` 直接映射到 wgpu 的 `FilterMode`：

- `Nearest` → `FilterMode::Nearest`
- `Linear` → `FilterMode::Linear`

最终由 wgpu 后端（Vulkan / Metal / DX12 / WebGPU / GLES）实现。

---

## 业界实践

成熟像素画游戏通常会避免直接用 Linear 放大主画面，常见做法是低分辨率渲染后用 Nearest 或 pixel-perfect 流程放大。例如 Celeste 内部渲染 320×180，放大到 1080p 时使用 Nearest，保持像素边界。Shovel Knight（400×240）、Stardew Valley（16×16 瓦片）、Undertale（640×480）等也同理。这些游戏的共同点是主画面尽量保持像素边界 — 放大倍数越高，Linear 的模糊越明显。

各引擎的设置方式差不多：

| 引擎 | 设置方式 |
|------|----------|
| Bevy | `ImagePlugin::default_nearest()` |
| Unity | Texture Import → Filter Mode → "Point (no filter)" |
| Godot | Import Settings → Filter → "Nearest" |
| LÖVE | `love.graphics.setDefaultFilter("nearest")` |

---

## 常见踩坑

### 忘记设全局默认

`DefaultPlugins` 默认是 Linear。像素游戏必须显式 `.set(ImagePlugin::default_nearest())`，否则所有精灵图都会糊。

### 设了 nearest 但图片仍模糊

检查几点：

- 图片是否通过 `ImageSampler::Descriptor(...)` 单独覆盖了采样器
- 是否启用了 mipmap 且 `mipmap_filter` 不是 Nearest
- 相机投影的 `scale` 是否导致非整数像素对齐

### 非像素美术资源需要单独处理

启动画面、照片背景、渐变纹理不应受全局 Nearest 影响。可以用 `load_with_settings` 显式设 `ImageSampler::linear()`，但要注意同一路径不能先被默认设置加载过（踩坑 #11111），也别用 `get_or_init_descriptor()` 从 `ImageSampler::Default` 初始化后只改局部字段（踩坑 #17566）。

---

---

