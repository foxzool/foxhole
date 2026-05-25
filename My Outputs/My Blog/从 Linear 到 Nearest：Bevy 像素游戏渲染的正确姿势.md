---
Status: 🟩
tags:
  - output/blog
  - bevy
  - rust
  - gamedev
Links:
  - "[[Bevy MOC]]"
Created: 2026-05-11
title: "from-linear-to-nearest-bevy-pixel-game-rendering"
Collection:
  - "[[Blog Posts MOC]]"
Finished: 2026-05-12
share: true
---

![像素游戏渲染封面](https://assets.zool.me/2026/05/48729c562da20b2683b5b6d3a8e7ce25.png)

上周给一个像素小游戏换皮肤，把一张56×56 的像素图导进 Bevy 里面，结果发现角色像是被蒸发了一样 —— 边缘模糊、颜色渐变，完全没有像素艺术那种刀锋锐利的边缘感。查了半天才想起来，这是 Bevy 默认的线性过滤在作祟。

---

## 现象：像素艺术怎么变成了油画

看一张图就懂了。同一张 16×16 的像素角色图，左边是 **Nearest** 过滤，右边是 **Linear** 过滤：

![Nearest 与 Linear 过滤模式对比](https://assets.zool.me/2026/05/8f9aa51b7534676b97628bc412727cf7.png)

**Nearest**：每个像素点都是清晰的小方块，边界明确，就是我们记忆中经典游戏的样子。

**Linear**：GPU 在像素之间做了渐变，边缘柔化，整体看起来像是低分辨率的油画。对于像素艺术来说，这就是一场灾难。

---

## 根源：纹理过滤与 Bevy 的默认值变更

### Nearest vs Linear 的本质区别

这两个词是 GPU 采样器（Sampler）的配置，决定了当渲染的像素不正好对齐纹理像素（texel）时，GPU 该怎么做。

<strong>Nearest （最近邻）</strong>

> “把离我最近的那个 texel 的颜色拿来。”

插值数量：1 个 texel（最快）。效果：块状感、像素锋利。用于：像素艺术、Minecraft 风格体素、数据纹理（法线 ID、标识等）。

<strong>Linear （线性插值）</strong>

> “看周围 4 个 texel，做一个双线性混合。”

插值数量：4 个 texel。效果：平滑、模糊。用于：标准 3D 表面、角色皮肤、UI 元素。

仅仅改这一个参数，像素游戏就能从“模糊”变回“锋利”。

### Bevy 为什么改了默认值

这里有个很有趣的历史。Bevy 0.8 之前默认其实是 Nearest，因为它继承了 wgpu 的默认设置。但 2022 年的 GitHub PR #4465 明确将默认过滤从 Nearest 改为 Linear，因为大多数游戏（写实风 3D、高清 UI）都需要模糊美观的过渡效果。对像素游戏开发者来说，每次都要手动切换回 Nearest。

---

## 一行解决：ImagePlugin::default_nearest()

Bevy 0.15+提供了最简单的全局设置方式：

```rust
use bevy::prelude::*;

fn main() {
    App::new()
        // 这一行让所有加载的图片都用 Nearest 过滤
        .add_plugins(DefaultPlugins.set(ImagePlugin::default_nearest()))
        .add_systems(Startup, setup)
        .run();
}
```

`ImagePlugin::default_nearest()` 的内部实现很简单，就是将默认的 `ImageSamplerDescriptor` 设为 Nearest：

```rust
pub fn default_nearest() -> ImagePlugin {
    ImagePlugin {
        default_sampler: ImageSamplerDescriptor {
            mag_filter: ImageFilterMode::Nearest,
            min_filter: ImageFilterMode::Nearest,
            ..default()
        },
    }
}
```

这是推荐的做法——一步到位，不用每张纹理去单独设置。当然，如果你有特殊需求（部分纹理仍然需要 Linear），也可以单独为某个 `Handle<Image>` 更改 sampler：

```rust
fn configure_pixel_art(
    mut images: ResMut<Assets<Image>>,
    asset_server: Res<AssetServer>,
    texture_handle: Res<MyPixelArtHandle>,
) {
    // 假设你定义了: #[derive(Resource)] struct MyPixelArtHandle(pub Handle<Image>);
    if asset_server.get_load_state(&texture_handle.0) == Some(LoadState::Loaded) {
        if let Some(image) = images.get_mut(&texture_handle.0) {
            image.sampler = ImageSampler::Descriptor(ImageSamplerDescriptor {
                mag_filter: ImageFilterMode::Nearest,
                min_filter: ImageFilterMode::Nearest,
                mipmap_filter: ImageFilterMode::Nearest,
                ..default()
            });
        }
    }
}
```

但对于像素游戏来说，全局 `default_nearest()` 足够了，不用给自己找麻烦。

---

## 进阶：仅仅 Nearest 还不够

改了过滤模式以后，像素边缘确实锋利了。但如果你想要真正的“像素完美”——比如窗口缩放时也不出现子像素失真，还需要更完整的方案。

Bevy 官方提供了 `pixel_grid_snap` 示例，核心思路是：

1. 用一个低分辨率相机（如 160×90）把游戏世界渲染到一张 off-screen 纹理
2. 再用第二个相机把这张纹理作为 Sprite 渲染到屏幕
3. 窗口缩放时只允许**整数倍**比例，避免子像素模糊

关键代码：

```rust
const RES_WIDTH: u32 = 160;
const RES_HEIGHT: u32 = 90;

#[derive(Component)]
struct InGameCamera;

#[derive(Component)]
struct OuterCamera;

fn setup_camera(mut commands: Commands, mut images: ResMut<Assets<Image>>) {
    // 1. 创建低分辨率 canvas 纹理
    let canvas_size = Extent3d {
        width: RES_WIDTH,
        height: RES_HEIGHT,
        ..default()
    };

    let mut canvas = Image {
        texture_descriptor: TextureDescriptor {
            label: None,
            size: canvas_size,
            dimension: TextureDimension::D2,
            format: TextureFormat::Bgra8UnormSrgb,
            mip_level_count: 1,
            sample_count: 1,
            usage: TextureUsages::TEXTURE_BINDING
                | TextureUsages::COPY_DST
                | TextureUsages::RENDER_ATTACHMENT,
            view_formats: &[],
        },
        ..default()
    };
    canvas.resize(canvas_size); // Image::default() 创建的是 1×1 占位纹理，需 resize 到目标尺寸
    let canvas_handle = images.add(canvas);

    // 2. 游戏相机：渲染到 canvas
    commands.spawn((
        Camera2d,
        Camera {
            order: -1, // 先渲染
            clear_color: ClearColorConfig::Custom(Color::srgb(0.2, 0.2, 0.2)),
            ..default()
        },
        RenderTarget::Image(canvas_handle.clone().into()),
        Msaa::Off, // 关闭抗锯齿
        InGameCamera,
        RenderLayers::layer(0), // 只渲染 layer 0 的实体
    ));

    // 3. Canvas sprite：让第二个相机来渲染
    commands.spawn((
        Sprite::from_image(canvas_handle),
        Transform::default(),
        RenderLayers::layer(1), // 只被外层相机看见
    ));

    // 4. 外层相机：渲染到屏幕
    commands.spawn((
        Camera2d,
        Msaa::Off,
        OuterCamera,
        RenderLayers::layer(1), // 只渲染 layer 1 的实体
    ));
}

// 窗口缩放时保持整数倍比例
fn fit_canvas(
    mut resize_events: EventReader<WindowResized>,
    mut projection: Single<&mut Projection, With<OuterCamera>>,
) {
    let Projection::Orthographic(projection) = &mut **projection else {
        return;
    };
    for window_resized in resize_events.read() {
        let h_scale = window_resized.width / RES_WIDTH as f32;
        let v_scale = window_resized.height / RES_HEIGHT as f32;
        projection.scale = 1.0 / h_scale.min(v_scale).round();
    }
}
```

实际使用时只需要在 `main()` 里注册这两个 system，像素完美就有了：

```rust
fn main() {
    App::new()
        .add_plugins(DefaultPlugins.set(ImagePlugin::default_nearest()))
        .add_systems(Startup, setup_camera)
        .add_systems(Update, fit_canvas)
        .run();
}
```

这个方案的好处是，你可以把游戏世界渲染在一个很低的分辨率（如 320×180），然后整数倍放大到屏幕，看起来就是完美的像素风格——而不是强行把游戏挂在一个 4K 屏幕上结果只占了左上角一小块。

---

## 速查表

| 场景 | mag_filter | min_filter | mipmap_filter | anisotropy |
|---|---|---|---|---|
| 像素 2D 游戏 | Nearest | Nearest | Nearest | 1（默认，即关闭） |
| 标准 3D 游戏 | Linear | Linear | Linear | 1 |
| 高品质 3D 地面 | Linear | Linear | Linear | 16 |
| UI / 2D 精细图标 | Linear | Linear | N/A | 1 |
| 数据纹理（ID/normal） | Nearest | Nearest | Nearest | 1 |

记住这个口诀：像素用 Nearest，写实用 Linear。

---

## 小结

Bevy 把默认过滤改成 Linear 是正确的——大多数游戏都需要它。但对像素游戏来说，一行 `ImagePlugin::default_nearest()` 就能让你的像素艺术回到它应该有的样子。如果想要更进一步的像素完美，不要只调过滤，还要整数倍窗口缩放 + off-screen 渲染。

---

## 参考来源

1. [Bevy ImagePlugin 文档 — docs.rs](https://docs.rs/bevy/latest/bevy/image/struct.ImagePlugin.html)
2. [Stack Overflow: Bevy NearestNeighbor 正确用法](https://stackoverflow.com/questions/76292957)
3. [GitHub PR #4465: 默认过滤从 Nearest 改为 Linear](https://github.com/bevyengine/bevy/pull/4465)
4. [Bevy 官方 pixel_grid_snap 示例](https://bevy.org/examples/2d-rendering/pixel-grid-snap/)
5. [wgpu FilterMode 文档](https://docs.rs/wgpu/latest/wgpu/enum.FilterMode.html)
6. [Hexbee 博客: Bevy & WGSL 纹理过滤与 Mipmap](https://blog.hexbee.net/4-2-texture-filtering-and-mipmapping)