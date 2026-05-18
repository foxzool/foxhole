---
Status: 🟩
tags:
  - output/blog
  - bevy
  - 3d-rendering
  - graphics
Created: 2026-05-13
title: Bevy 球体：选 UV 还是 Ico
cover: https://assets.zool.me/2026/05/6f35a7057e3ef31ede7902d82f02b9b0.png
Finished: 2026-05-13
collection:
share: true
media_id: ed1N6WNPfW3HZiWLH5PgaWYC_2zik8lPL3aI9JoPtVegay9m9KVSP_2yqh10Hm4q
---

有次做了个台球模型，用了最顺手的 `Sphere::default()`，结果某个角度的高光下出现了奇怪的亮斑。一开始以为是材质问题，换了好几种 roughness 和 metallic 都没解决。后来才发现，原来是球的**拓扑结构**在作祟。

在 Bevy 0.18+ 里，`Sphere::default()` 默认走的是 IcoSphere，而且细分级别是 5。但这不是唯一选项。同一个半径，可以用两种完全不同的方式构建。

```rust
// 方式一：UV Sphere（经纬球）
let uv = Sphere::new(1.0).mesh().uv(32, 18);

// 方式二：IcoSphere（二十面体细分球）
let ico = Sphere::new(1.0).mesh().ico(5).unwrap();

// 默认（不指定 kind）→ IcoSphere subdivisions=5
let default = Sphere::new(1.0).mesh().build();
```

看起来都是个球，但拓扑策略完全不同。很多人误以为 IcoSphere 总是"更密"，实际上 Bevy 默认的 Ico(5) 顶点数比 UV(32,18) 还少——它胜在分布均匀，而非数量庞大。更重要的是，它们在渲染管线里的表现完全不同。

---

## 拓扑是什么，从哪来的

先说清楚两种球的"家谱"。

### UV Sphere — 从地球仪来的

UV Sphere 的拓扑直接来自地球的经纬度坐标系。经线（longitude）从南极到北极穿越整个球面，纬线（latitude）环绕赤道平行分布。这两组线在球面交织成网格，两极处的经线全部汇聚到两个顶点。

名字里的 "UV" 就是纹理坐标的参数化表示：U 对应经度，V 对应纬度。这意味着贴地球纹理或天空盒时，UV 坐标天然对齐，完全不用额外计算。

早期 3D 建模软件（如 3DS Max、Blender）都把它作为默认球体 primitive，因为它最直观——就像地球仪上的网格。

### IcoSphere — 从测地线穹顶来的

IcoSphere 的根在柏拉图正二十面体（Platonic solid）。这种几何体有 12 个顶点和 20 个等边三角形面，每个顶点出发的面数量相同。1950 年代，建筑师 Buckminster Fuller 用这种结构做了测地线穹顶（geodesic dome），之后被称为 "Bucky Ball"。

细分的规则很简单：每条边按给定次数切分，产生小三角形。传统的递归细分是每次将每个三角形切为 4 份，面数按 $20 \times 4^n$ 增长。但 Bevy 采用的是另一套参数化方案：`ico(s)` 中的 `s` 是每条边上插入的点数，最终面数为 $20 \times (s+1)^2$。所以 `ico(5)` 对应的是 $20 \times 36 = 720$ 个三角形，而非传统细分第 5 次的 20480 个。

这种结构没有物理极点，顶点在球面均匀分布。在计算机图形学里，它是细分曲面（subdivision surfaces）和程序化地形生成的经典基础。

### 为什么这俩会同时存在

UV Sphere 统治了早期实时渲染——它简单、直观、贴图友好。IcoSphere 在科学计算可视化、物理模拟、细分曲面领域更受欢迎。

Bevy 把它们都包进来，因为"球"这个需求太常见，没有一种拓扑能通吃。

| | UV Sphere | IcoSphere |
|---|-----------|-----------|
| **基础几何** | 经纬线网格 | 二十面体递归细分 |
| **面类型** | 四边形为主 | 纯三角形 |
| **极点** | 有 — 经线汇聚 | 无 — 顶点均匀分布 |
| **顶点数**（默认） | ~627 个 | ~362 个 |
| **面数**（默认） | ~1,088 个 | ~720 个 |
| **面均匀度** | 赤道大、两极小 | 大致均匀 |

> **关键**: Bevy 默认 Ico(5) 的顶点/面数实际上比 UV(32,18) 更少。它的优势不是"更密"，而是顶点分布均匀、法线连续、无极点 artifact。

![两种球体拓扑对比图](https://assets.zool.me/2026/05/6f35a7057e3ef31ede7902d82f02b9b0.png)

---

## 渲染管线的实际差异

两种拓扑在渲染管线里的表现差很远。下面分四个尺度说。

### UV 映射：地球纹理怎么贴

UV Sphere 的纹理坐标天然对应经纬度。贴等距柱状投影图（如地球纹理、HDR skybox）时，纹理和几何完美对齐，**零扭曲**。两极处的 UV 汇聚是投影本身的特性，不是 mesh 的 bug，但会导致纹理在两极"挤压"。

IcoSphere 没有天然的 UV 参数化。Bevy 对 icosphere 的 UV 生成采用球面投影策略，在默认细分级别下两极无挤压、纹理拉伸更均匀，但贴 equirectangular 图时会引入额外扭曲，且必然存在一条 UV 接缝。

**结论**: 做地球仪、天空盒或任何贴等距柱状贴图的场景 → **UV Sphere**。

### 法线与高光：那个亮斑是怎么来的

这是我碰到的问题。UV Sphere 两极的顶点被多个三角形面共享，每个面在该顶点的法线方向不同。当光线从某个角度照射时，这些法线会产生发散的反射方向，在 PBR 高光下形成**法线不连续的 "pinching" 亮斑**。

IcoSphere 的每个顶点都是由相邻三角形面的法线平均得来，没有物理极点。法场连续平滑，高光表现更均匀。

**结论**: 做台球、水滴、水晶球、玻璃珠——任何需要"完美球面反光"的场景 → **IcoSphere**。

### 细分策略：性能 vs 视觉

UV Sphere 的细分粒度可独立控制：sectors（经线数）× stacks（纬线数）。这意味着你可以“赤道加密、两极稀疏”，非均匀细分。但细分后拓扑结构变化大，不利于 GPU 批量处理。

IcoSphere 的面数按 $(s+1)^2$ 规律增长，每次提高细分级别 `s`，面数从 20 个基础三角形扩展。这种规律性构造让它天然适合**逐级 LOD**（如 `ico(2)` 180 面、`ico(3)` 320 面、`ico(4)` 500 面、`ico(5)` 720 面……）。Nanite/Meshlet 风格的 GPU-driven 渲染对这种规划化拓扑更友好。

**结论**: 大量粒子/弹丸/星空场景 → **UV Sphere 低细分**（省顶点）；单个精细模型 → **IcoSphere 高细分**。

### 变形：谁更耐抖

UV Sphere 极点处的密集顶点在缩放或非均匀变形时容易拉扯出尖错突起。这是 subdivision surface modeling 中的经典问题——Blender 社区里有大量关于"如何修复 UV sphere 的极点 pinching"的讨论。

IcoSphere 的均匀顶点分布使任意方向的形变更一致。做 displacement/noise 变形时结果更"自然"。

**结论**: 行星地表、气球生成、程序化地形球 → **IcoSphere + noise**。

---

## 一张表搞定选择

| 场景 | 推荐 | 理由 |
|------|------|------|
| 地球仪 / 天空盒 / 等距柱状贴图 | UV Sphere | 纹理坐标天然对齐，零扭曲 |
| 台球 / 水滴 / 玻璃珠 / 水晶球 | IcoSphere | 法线连续，反光均匀 |
| 大量粒子 / 弹丸 / 星空 | UV Sphere 低细分 | 顶点少，省带宽 |
| 行星地表 / 气球 / 变形地形 | IcoSphere | 均匀顶点，noise 自然 |
| 不知道选什么 | IcoSphere | 通用性最好，极点问题最少 |
| 知道了为什么选 UV Sphere | UV Sphere | 你已经有明确需求 |

---

## 默认不是最佳

Bevy `Sphere::default().mesh().build()` 默认走 IcoSphere(subdivisions=5)。这个设计意图很清晰：**通用性优先**。它的顶点分布均匀、法线连续、无极点 artifact，在大多数场景下是更"正确"的选择。

但注意：默认 Ico(5) 的三角形数量虽然不高（720 个），对于需要极细节的场景（如特写镜头的玻璃珠）可能不够。另一方面，对于大量 instance 的小球体、粒子系统，UV Sphere 低细分可能更省。

实践建议：**每次用 Sphere 都显式指定 kind，不要信任默认**。

```rust
// 台球 — 需要均匀反光，但不需要太细
let billiard = Sphere::new(1.0).mesh().ico(3).unwrap();

// 地球仪 — 贴经纬度贴图
let globe = Sphere::new(1.0).mesh().uv(64, 32);

// 星空粒子 — 越粗糙越好
let star = Sphere::new(1.0).mesh().uv(8, 4);
```

球体是最简单的 3D 形状，但选对拓扑能省下不少张。

---

## 参考

- [Bevy `SphereMeshBuilder` API docs](https://docs.rs/bevy/latest/bevy/mesh/struct.SphereMeshBuilder.html)
- [Bevy `3d_shapes.rs` 官方示例](https://github.com/bevyengine/bevy/blob/main/examples/3d/3d_shapes.rs)
- [Blender StackExchange — UV Sphere vs Icosphere](https://blender.stackexchange.com/questions/72/what-is-the-difference-between-a-uv-sphere-and-an-icosphere)
- [Bevy Issue #10569: Meshes from primitives](https://github.com/bevyengine/bevy/issues/10569)
