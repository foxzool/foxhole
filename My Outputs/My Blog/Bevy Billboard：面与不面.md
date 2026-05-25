---
Status: 🟩
tags:
  - output/blog
  - bevy
  - shader
  - 3d-rendering
Created: 2026-05-21
share: true
Finished: 2026-05-21
title: Bevy Billboard：面与不面
cover: https://assets.zool.me/2026/05/10cdbf475d44a9dada45dfc6c58739ea.png
collection:
Lin: "[[Bevy MOC]]"
---

先搞清楚一件事：广告牌（Billboard）不是 2D 的 Sprite。Sprite 活在屏幕空间里，跟深度缓冲没什么关系；广告牌是 3D 场景里的一张薄片，有实际的世界坐标，会被前面的物体挡住，也会挡住后面的物体。它的唯一使命是永远面朝相机，让你从任何角度看过去都只看到它的正面。

这个技术老得可以。PS1 时代的《最终幻想战略版》就已经大量用纸片角色来节省面数——一整支军队里真正做了模型的可能只有主角，杂兵全是永远面朝镜头的贴图平面。

![PS1《最终幻想战略版》战斗场景：角色 billboard 始终正面朝向相机，清晰展示 2D 精灵图效果](https://assets.zool.me/2026/05/a8bc704fc5534be130a0a150d2f46994.png)

（图源：[MobyGames — Final Fantasy Tactics Screenshots](https://www.mobygames.com/game/4522/final-fantasy-tactics/screenshots)）

到了今天，广告牌依然是粒子特效、光晕、法术火花、树木、路牌、角色头顶名字标签的标配。想象一片台球厅，每张球桌上空漂浮着球员名字；或者一片森林，每棵树其实只是一张旋转的贴图，但因为你始终从正面看，根本察觉不到它是纸片。

关键在于：广告牌的旋转必须发生在 GPU 顶点阶段，而不是 CPU 里每帧改 Transform。如果你在 CPU 里每帧去旋转那张四边形，几百个实例就能把主线程拖垮；让着色器去算，几千个实例也不过是几行向量乘法，还能自动享受实例化（Instancing）的批量优势。

---

## 两种朝向模式：球形 vs 圆柱形

广告牌有两种朝向策略，选错的话效果会很滑稽。

<strong>球形（Spherical）</strong>让平面完全复制相机的朝向，适合粒子、光晕、星空中的十字星标记。不管你从哪个角度飞过去，它都像一只眼睛死死盯着你。

<strong>圆柱形（Cylindrical）</strong>则只绕世界 Y 轴旋转，保持垂直轴始终直立，适合树木、路牌、站立角色头顶的名牌。你可以从侧面看出它的"厚度"——也就是它确实只是一张纸——但它绝不会像被风吹倒一样歪掉。

很多教程把这两种模式混在一起讲，结果读者抄了球形代码去种树，镜头一转，树倒了一地。

数学上的差异在于基向量的构造方式。球形需要相机的完整基向量（右、上、前）；圆柱形需要把相机的前向量先拍扁到 XZ 平面，再用世界 Y 轴叉乘得到新的右向量，确保广告牌的"上"始终与世界 Y 对齐[知乎 Billboard 教程](https://zhuanlan.zhihu.com/p/568974914)[Unity 广告牌实现](https://www.starloong.top/2025/01/19/Unity中广告牌效果实现/index.html)。

```rust
/// 广告牌朝向模式。
#[derive(Clone, Copy, PartialEq, Eq, Debug, Default, Reflect)]
pub enum BillboardMode {
    /// 完全面向相机（粒子、光晕、法术命中特效）。
    #[default]
    Spherical,
    /// 只绕世界 Y 轴旋转（树木、名牌、站立角色）。
    Cylindrical,
}
```

在着色器里，`mode == 0u` 走球形分支，`mode == 1u` 走圆柱形分支。切换模式不需要重新生成网格，改 uniform 即可。

下图是同一行广告牌分别用球形和圆柱形朝向的效果对比。左侧完全追随相机，右侧始终保持垂直。

![两种朝向模式对比](https://assets.zool.me/2026/05/75472fd59157688a4247a6d923b02950.png)

---

## 为什么在 Bevy 里必须手写着色器

Bevy 官方至今没有内置的广告牌组件。Issue #3688 从 2022 年挂到现在，维护者承认这是合理需求，但优先级一直没排上[Issue #3688](https://github.com/bevyengine/bevy/issues/3688)。社区最成熟的 crate `bevy_mod_billboard` 只适配到 Bevy 0.14，0.15+ 没有官方适配——这在新版本迁移频繁的 Bevy 生态里几乎是致命伤。

结论很直白：想在自己项目里稳定用，只能自己动手写 Custom Material + 顶点着色器。每次升版本都要检查一遍社区 crate 的兼容性，不如自己掌握原理来得踏实。顺带一提，如果你要做的只是纯粒子特效（比如火焰、爆炸、魔法粉尘），`bevy_hanabi` 更省事，它内置了朝向设置，不用从零开始。

在 Rust 侧，注册自定义材质只需要一个插件：

```rust
pub struct BillboardPlugin;

impl Plugin for BillboardPlugin {
    fn build(&self, app: &mut App) {
        app.add_plugins(MaterialPlugin::<BillboardMaterial>::default());
    }
}
```

`MaterialPlugin` 会把着色器管线、绑定组布局、渲染队列全部替你铺好[Bevy Shader Material 官方示例](https://bevy.org/examples/shaders/shader-material)。你不需要手写任何 WebGPU 绑定组描述符。

---

## 顶点着色器里的坐标重建

传统 MVP 矩阵在这里不管用。模型矩阵里的旋转部分必须被忽略——广告牌的朝向由相机决定，而不是由模型自己的 `Transform.rotation` 决定。如果你在顶点着色器里直接乘 MVP，得到的结果会跟着模型的原始旋转跑，而不是面朝相机。

正确的做法是在顶点阶段**手动重建世界坐标**。推导过程如下：

模型矩阵 `M = T * R * S`。我们需要的是平移 `T`（世界中心）和缩放 `S`（尺寸），但要把旋转 `R` 扔掉。在 WGSL 中，从 `get_world_from_local(instance_index)` 拿到的 `model` 就是完整的模型矩阵。它的第 4 列 `(model[3][0], model[3][1], model[3][2])` 正是世界坐标系下的中心点[知乎 Billboard 教程](https://zhuanlan.zhihu.com/p/568974914)。而第 1 列和第 2 列基向量的长度，分别对应 X 轴和 Y 轴的缩放系数：

```text
scale_x = length( vec3(model[0][0], model[0][1], model[0][2]) )
scale_y = length( vec3(model[1][0], model[1][1], model[1][2]) )
```

相机的视角矩阵 `view.world_from_view` 同样关键。这个矩阵的列向量分别代表相机在世界空间中的 `right`、`up`、`forward` 基向量[Bevy Extended Material 官方示例](https://bevy.org/examples/shaders/extended-material)[WebGL2 Billboard 视频](https://www.youtube.com/watch?v=AY73ZAEKqBM)。

有了这四个向量，球形广告牌的顶点世界坐标就是：

```text
world_position = world_center + x * scale_x * camera_right + y * scale_y * camera_up
```

其中 `x` 和 `y` 来自局部四边形顶点的 `position.xy`（范围 [-0.5, 0.5]）。这个公式的几何意义很清楚：以 `world_center` 为原点，沿着相机的右向量和上向量铺开一张缩放后的平面。

圆柱形模式稍微复杂。首先把相机前向量拍扁到 XZ 平面：

```text
front_xz = (cam_front.x, 0, cam_front.z)
```

归一化后得到 `front_flat`。然后用世界 Y 轴与它叉乘，得到水平面内的右向量：

```text
right = normalize( cross(world_up, front_flat) )
up    = world_up
```

这样广告牌只能在水平面内旋转，垂直方向永远直立[知乎 Billboard 教程](https://zhuanlan.zhihu.com/p/568974914)[Unity 广告牌实现](https://www.starloong.top/2025/01/19/Unity中广告牌效果实现/index.html)。

下面是完整的顶点着色器。注释已经写得很细，直接复制就能用：

```wgsl
#import bevy_pbr::forward_io::VertexOutput
#import bevy_pbr::mesh_functions::get_world_from_local
#import bevy_pbr::mesh_view_bindings::view

struct BillboardMaterialUniform {
    base_color: vec4<f32>,
    mode: u32,        // 0 = 球形, 1 = 圆柱形
    use_texture: u32,
    _pad: vec2<f32>,
};

@group(#{MATERIAL_BIND_GROUP}) @binding(0) var<uniform> material: BillboardMaterialUniform;
@group(#{MATERIAL_BIND_GROUP}) @binding(1) var base_texture: texture_2d<f32>;
@group(#{MATERIAL_BIND_GROUP}) @binding(2) var base_sampler: sampler;

@vertex
fn vertex(
    @location(0) position: vec3<f32>,
    @location(1) normal: vec3<f32>,
    @location(2) uv: vec2<f32>,
    @builtin(instance_index) instance_index: u32
) -> VertexOutput {
    var out: VertexOutput;

    // 1. 从模型矩阵提取世界中心与缩放
    let model = get_world_from_local(instance_index);
    let world_center = vec3<f32>(model[3][0], model[3][1], model[3][2]);

    let scale_x = length(vec3<f32>(model[0][0], model[0][1], model[0][2]));
    let scale_y = length(vec3<f32>(model[1][0], model[1][1], model[1][2]));

    // 2. 从视图矩阵提取相机方向基向量
    // world_from_view 是相机的变换矩阵，其列向量分别是 [right, up, forward]
    let cam_matrix = view.world_from_view;
    let cam_right  = normalize(vec3<f32>(cam_matrix[0][0], cam_matrix[0][1], cam_matrix[0][2]));
    let cam_up     = normalize(vec3<f32>(cam_matrix[1][0], cam_matrix[1][1], cam_matrix[1][2]));
    let cam_front  = normalize(vec3<f32>(cam_matrix[2][0], cam_matrix[2][1], cam_matrix[2][2]));

    // 3. 按模式选择基向量
    var right = cam_right;
    var up    = cam_up;

    if material.mode == 1u {
        let front_xz = vec3<f32>(cam_front.x, 0.0, cam_front.z);
        let len = length(front_xz);
        if len > 0.001 {
            let front_flat = front_xz / len;
            right = normalize(cross(vec3<f32>(0.0, 1.0, 0.0), front_flat));
            up = vec3<f32>(0.0, 1.0, 0.0);
        }
    }

    // 4. 在世界空间重建广告牌顶点
    let billboard_world = world_center
        + position.x * scale_x * right
        + position.y * scale_y * up;

    // 5. 输出
    out.world_position = vec4<f32>(billboard_world, 1.0);
    out.position = view.clip_from_world * vec4<f32>(billboard_world, 1.0);
    out.world_normal = -cam_front;
    out.uv = uv;

    return out;
}

@fragment
fn fragment(mesh: VertexOutput) -> @location(0) vec4<f32> {
    var color = material.base_color;

    if material.use_texture != 0u {
        let tex = textureSample(base_texture, base_sampler, mesh.uv);
        color = color * tex;
    }

    // 直接输出颜色，不受光照。粒子/光晕/火焰这类特效不需要 PBR。
    return color;
}
```

注意 `world_normal` 被硬编码成了 `-cam_front`，这是为了将来如果接入 PBR 光照，面法线已经指向相机。目前片元阶段直接输出颜色，走的是 Unlit 路线。

---

## Rust 侧的自定义材质

Rust 侧的核心是 `BillboardMaterial`。我用 `#[derive(AsBindGroup)]` 自动生成了绑定组布局，完全不用手写 WebGPU 的 `BindGroupLayoutDescriptor`。这省下的不只是代码量，还有心智负担——Bevy 的宏会替你处理槽位对齐和内存排布。

```rust
/// 自定义材质。生成时用 [`MeshMaterial3d<BillboardMaterial>`]。
#[derive(Asset, TypePath, AsBindGroup, Debug, Clone)]
pub struct BillboardMaterial {
    #[uniform(0)]
    pub uniform: BillboardMaterialUniform,

    #[texture(1)]
    #[sampler(2)]
    pub base_texture: Option<Handle<Image>>,
}

impl Material for BillboardMaterial {
    fn vertex_shader() -> ShaderRef {
        "shaders/billboard.wgsl".into()
    }

    fn fragment_shader() -> ShaderRef {
        "shaders/billboard.wgsl".into()
    }

    fn alpha_mode(&self) -> AlphaMode {
        // 广告牌几乎总是透明的。
        AlphaMode::Blend
    }
}
```

这里用的是纯 `Material` trait，而不是 `ExtendedMaterial<StandardMaterial, ...>`。这两者差别很大：

`ExtendedMaterial` 的官方定位是在保留标准 PBR 光照的前提下注入自定义顶点或片元逻辑[Bevy Extended Material 官方示例](https://bevy.org/examples/shaders/extended-material)[PR #17269](https://github.com/bevyengine/bevy/pull/17269)。如果你需要广告牌受环境光、投射阴影、响应法线贴图，那它是最平滑的升级路径。但它的代价是复杂度：`StandardMaterial` 已经占用了绑定槽位 0–99，你的扩展只能从 100 开始；WGSL 侧必须 `import` PBR 的输入输出结构，按 Forward/Deferred 的不同路径处理光照[Bevy Extended Material 官方示例](https://bevy.org/examples/shaders/extended-material)。

而纯 `Material` 从零搭建管线，片元直接输出颜色，不参与 PBR 计算。对于粒子、光晕、火焰、UI 标记这类天然不需要光照的特效，这反而是更轻量的选择。我当前的需求是星空粒子和路牌，走 Unlit 完全够用。以后如果真的要在场景里放一个受 directional light 照射的金属告示牌，再迁移到 `ExtendedMaterial` 也不迟[DEV Community 教程](https://dev.to/mikeam565/rust-game-dev-log-6-custom-vertex-shading-using-extendedmaterial-4312)。

生成实体时，除了常规的 `Mesh3d` 和 `MeshMaterial3d`，还要记得挂上 `NoFrustumCulling`：

```rust
/// 生成单个广告牌实体。
pub fn spawn_billboard(
    commands: &mut Commands,
    mesh: &BillboardMesh,
    materials: &mut Assets<BillboardMaterial>,
    material: BillboardMaterial,
    position: Vec3,
    size: Vec2,
) -> Entity {
    commands.spawn((
        Mesh3d(mesh.0.clone()),
        MeshMaterial3d(materials.add(material)),
        Transform::from_translation(position)
            .with_scale(Vec3::new(size.x, size.y, 1.0)),
        // 广告牌在着色器里面向相机；轴对称包围盒可能过于保守。
        // 如果斜角观察时出现闪烁消失，就禁用视锥剔除。
        NoFrustumCulling,
    )).id()
}
```

---

## 最大的坑：视锥剔除

这是整个实现里最隐蔽、也最容易让人怀疑人生的坑。

Bevy 的视锥剔除在 **CPU 阶段**完成。它读取实体的轴对称包围盒（Aabb），判断这个盒子是否落在相机视锥内。如果不在，实体直接被跳过，根本不会送到 GPU 去渲染。

问题是：广告牌的朝向变换在 **GPU 顶点着色器** 里完成，CPU 对此一无所知。CPU 看到的 Aabb 仍然是原始 mesh 经过静态 Transform 后的结果，而 Transform 的旋转通常是 identity 或某种固定值，完全无法反映着色器里的动态朝向。于是 CPU 拿着一个又扁又小的原始包围盒做剔除判断——当相机从侧面斜着靠近时，着色器已经把广告牌竖起来面向你了，但 CPU 依然认为那个扁盒子在视锥外，物体**凭空消失**。如果你把广告牌放大（通过 `transform.scale`），触发概率会更高，因为原始 Aabb 的保守估计更容易漏出视锥。

这不是 Bevy 独有的 bug。Unity、Godot 的论坛里， billboard 着色器配视锥剔除是日经帖。跨引擎的普遍解法都是同一个思路：要么扩大包围盒做保守估计，要么直接关闭 CPU 剔除。

Bevy 给了三种出路：

**方案 A**：给实体挂上 `NoFrustumCulling`，完全退出 CPU 剔除。这是最干净的解法。广告牌本来就不该由原始 mesh 的包围盒决定可见性——它的可见性应该由屏幕空间判断，或者由 GPU 侧的逻辑决定。

**方案 B**：手动设置一个巨大的 `Aabb`。可行，但你需要为每个广告牌计算一个足够大的半径，维护起来很烦，而且浪费 CPU 剔除的计算量。

**方案 C**：在 CPU 系统里每帧同步旋转 Transform，让 CPU 和 GPU 的旋转保持一致。但这直接摧毁了 GPU 实例化的性能优势，几百个实例就能把主线程吃光，本末倒置。

我选的是方案 A。`NoFrustumCulling` 这个名字听起来很吓人，好像要渲染整个宇宙，但实际上广告牌的顶点数极低（一个四边形才 4 个顶点），关闭剔除的代价可以忽略不计。

还有一个相关的暗雷：Bevy 在实体生成后**不会自动更新** `Aabb`。Issue #4294 曾经长期未解决，但后续版本已由 PR #18742 修复。如果你仍在使用旧版本或遇到边界情况，禁用 CPU 剔除依然是稳妥的兜底方案。不过对于任何在着色器里发生形变的 mesh——骨骼动画、地形位移、广告牌——都会遇到类似的 Aabb 过时问题。`NoFrustumCulling` 对这类场景几乎是必选项。

---

## 社区现成的轮子

如果你不想从零写，社区有几个现成选择，但都有各自的局限。

`bevy_mod_billboard` 是最成熟的，支持纹理和文字两种广告牌，也有 Y 轴锁定和 HDR。但它最新 0.7.0 只支持到 Bevy 0.14，0.15+ 没有官方适配。如果你的项目锁定在 0.14，它是首选；否则只能自己 fork 或者等社区更新。

`bevy_hanabi` 是粒子系统，内置了广告牌朝向设置。如果你的需求只是火焰、魔法粉尘、爆炸这类纯粒子特效，直接用它比手写材质更划算。

`bevy_healthbar_3d` 专门做 3D 血条，可以参考它的广告牌写法，但功能太单一。

我的个人倾向是：自己写一遍之后，再看社区 crate 的代码会清晰很多。而且掌握顶点着色器里的坐标重建原理，对后续做植被摆动、水面顶点动画、角色描边都有直接帮助。

---

## 性能与后续扩展

当前实现天然支持 GPU 实例化。批量生成时，所有球形广告牌共享同一个 mesh handle 和同一个 material handle，Bevy 会自动把它们合并成一批实例提交给 GPU。

```rust
// 球形广告牌网格（星空粒子、火焰光点）
let sphere_mat = BillboardMaterial::new(
    Color::srgb(0.9, 0.4, 0.1),
    BillboardMode::Spherical,
);
let positions = (-8..=8)
    .flat_map(|x| (-8..=8).map(move |z| (x, z)))
    .map(|(x, z)| Vec3::new(x as f32 * 2.5, 1.5, z as f32 * 2.5));

spawn_billboard_batch(
    &mut commands,
    &mesh_res,
    &mut materials,
    sphere_mat,
    positions,
    Vec2::splat(1.2),
);

// 圆柱形环形排列（路牌、树木）
let cyl_mat = BillboardMaterial::new(
    Color::srgb(0.2, 0.8, 0.4),
    BillboardMode::Cylindrical,
);
let cyl_positions = (0..24).map(|i| {
    let angle = (i as f32) * std::f32::consts::TAU / 24.0;
    Vec3::new(angle.cos() * 18.0, 3.0, angle.sin() * 18.0)
});

spawn_billboard_batch(
    &mut commands,
    &mesh_res,
    &mut materials,
    cyl_mat,
    cyl_positions,
    Vec2::new(2.0, 4.0),
);
```

不过有个限制：只要材质实例不同（比如不同的颜色、不同的纹理），Bevy 就分不了批。如果你的场景里有几百个广告牌，每个都贴不一样的纹理，实例化会失效。极致性能路线需要手动合批——要么用 Texture Atlas（把所有小图塞进一张大图），要么用材质数组/纹理数组，但这已经超出本文范围。

实际体验上，Demo 里同时放了 17×17 的球形网格（289 个）加 24 个圆柱形（共 313 个），MacBook Air M2 稳 120fps，性能焦虑不大[Billboard Demo 源码](https://github.com/foxzool/billboard_demo)。

后续如果要扩展，路径也很清晰：
- 需要 PBR 光照和阴影 → 迁移到 `ExtendedMaterial`，保留标准材质的光照管线[Bevy Extended Material 官方示例](https://bevy.org/examples/shaders/extended-material)[PR #17269](https://github.com/bevyengine/bevy/pull/17269)。
- 需要支持 Prepass/Deferred/MSAA → 补充对应的顶点着色器 pass[DEV Community 教程](https://dev.to/mikeam565/rust-game-dev-log-6-custom-vertex-shading-using-extendedmaterial-4312)。
- 需要文字广告牌 → 参考 `bevy_mod_billboard` 的字体 atlas 构建逻辑。

---

## 参考

- [Bevy 官方 Extended Material 示例](https://bevy.org/examples/shaders/extended-material)
- [DEV Community — Custom Vertex Shading using ExtendedMaterial](https://dev.to/mikeam565/rust-game-dev-log-6-custom-vertex-shading-using-extendedmaterial-4312)
- [GitHub PR #17269 — Extended material + custom vertex shader example](https://github.com/bevyengine/bevy/pull/17269)
- [GitHub Issue #3688 — Billboard sprites (Sprites in a 3D camera)](https://github.com/bevyengine/bevy/issues/3688)
- [知乎专栏 — 【UnityShader】BillBoard 广告牌（3）](https://zhuanlan.zhihu.com/p/568974914)
- [星光与路人 — Unity 中广告牌效果实现](https://www.starloong.top/2025/01/19/Unity中广告牌效果实现/index.html)
- [Bevy 官方 Shader Material 示例](https://bevy.org/examples/shaders/shader-material)
- [WebGL2 Particle Spherical / Cylindrical Billboard (YouTube)](https://www.youtube.com/watch?v=AY73ZAEKqBM)
- [GitHub — Bevy Billboard Demo（本文配套源码）](https://github.com/foxzool/billboard_demo)