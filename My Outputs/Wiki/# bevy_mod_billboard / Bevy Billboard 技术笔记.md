# bevy_mod_billboard / Bevy Billboard 技术笔记

Created: 2026-05-21

---

## 概述

广告牌（Billboard）是 3D 场景中永远面朝相机的薄片几何体，有实际世界坐标和深度关系。与 2D Sprite 的本质区别在于 Sprite 活在屏幕空间，而 Billboard 活在世界空间。典型用途：粒子特效、光晕、树木、路牌、角色头顶名牌。

在 Bevy 中官方无内置组件（Issue #3688 自 2022 年未解决），社区 crate `bevy_mod_billboard` 仅适配到 0.14。稳定使用的唯一路径：手写着色器 + `CustomMaterial`。

---

## 核心原理

### 为什么必须丢弃模型旋转

传统 MVP 矩阵会保留模型自带的 `Transform.rotation`，导致广告牌跟着模型旋转跑而非面朝相机。必须在顶点阶段手动重建世界坐标，只提取模型矩阵的**平移**（第 4 列）和**缩放**（基向量长度），扔掉旋转。

### 两种朝向模式

| 模式 | 旋转轴 | 适用场景 | 视觉特征 |
|------|--------|----------|----------|
| **Spherical** | 完整相机基向量 (right, up, forward) | 粒子、光晕、法术特效 | 完全追随相机 |
| **Cylindrical** | 仅绕世界 Y 轴 | 树木、路牌、站立名牌 | 始终保持垂直 |

数学差异：圆柱形需要把相机前向量拍扁到 XZ 平面（`front_xz = (cam_front.x, 0, cam_front.z)`），再用世界 Y 轴叉乘得到新的右向量。

---

## 实现细节

### 顶点着色器坐标重建

```
world_center = vec3(model[3][0], model[3][1], model[3][2])
scale_x = length(vec3(model[0][0], model[0][1], model[0][2]))
scale_y = length(vec3(model[1][0], model[1][1], model[1][2]))

// Spherical
world_position = world_center + x * scale_x * camera_right + y * scale_y * camera_up

// Cylindrical
front_xz = (cam_front.x, 0, cam_front.z)
right_cyl = normalize(cross(vec3(0, 1, 0), front_xz))
world_position = world_center + x * scale_x * right_cyl + y * scale_y * vec3(0, 1, 0)
```

### Rust 侧注册

```rust
pub struct BillboardPlugin;
impl Plugin for BillboardPlugin {
    fn build(&self, app: &mut App) {
        app.add_plugins(MaterialPlugin::<BillboardMaterial>::default());
    }
}
```

`MaterialPlugin` 自动处理管线、绑定组布局、渲染队列。无需手写 WebGPU 绑定组描述符。

### Uniform 切换模式

着色器内通过 `mode == 0u`（Spherical）与 `mode == 1u`（Cylindrical）分支切换，改 uniform 即可，无需重建网格。

---

## 最佳实践 / 常见陷阱

- **不要抄错模式**：用球形代码去种树，镜头一转树全倒。
- **不要用 CPU 逐帧旋转**：几百个实例就能把主线程拖垮；让 GPU 处理，天然享受 Instancing 批量优势。
- **不要硬编码相机向量**：必须从 `view.world_from_view` 矩阵实时提取相机基向量，否则相机旋转时广告牌不跟。
- **底边锚点**：地面标志物应使用 Bottom-Center 锚点（y = position.y × 2.0），避免缩放时底边漂移。
- **纯粒子场景优先用 hanabi**：`bevy_hanaki` 内置朝向设置，无需从零手写。

---

## 版本兼容性

| Bevy 版本 | 路径 |
|-----------|------|
| 0.14 | `bevy_mod_billboard` crate 可用 |
| 0.15+ | 官方 Issue #3688 未解决，社区 crate 未适配 |
| **推荐** | 手写着色器 + `CustomMaterial`（版本无关，仅 WGSL 语法可能微调） |

---

## 关联资源

- 博客正文: [[Bevy Billboard：面与不面]]
- 项目: `bevy_fog_of_war`
- 相关技术: [[bevy_mod_billboard]], [[bevy_hanabi]], [[WGSL 着色器编写]]
