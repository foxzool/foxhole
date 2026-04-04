---
Status: 🌲
tags:
  - note
Links:
  - "[[Bevy MOC]]"
Created: 2025-08-31T18:41:19
BevyVersion:
  - "0.16"
share:
---
# `bevy_landmass` 全面架构解析：从核心概念到自动化导航

## 引言：解构 `bevy_landmass` 生态系统

`bevy_landmass` 是一个为 Bevy 游戏引擎设计的复杂插件，旨在通过使用导航网格（navmeshes）来处理 AI 角色的导航问题 。它为实现寻路和局部碰撞规避提供了强大的工具集，这两者是构建游戏中智能 NPC 行为的关键组成部分 。  

深入分析其架构可以发现，`bevy_landmass` 并非一个单一的库，而是一个更庞大、模块化生态系统中的集成层。理解这一结构至关重要。该生态系统主要由三个部分组成：

1.  **`landmass`**：这是核心的、与引擎无关的 crate，包含了基础的导航算法，如寻路和规避逻辑 。这种关注点分离的设计是稳健软件工程的标志。  
    
2.  **`bevy_landmass`**：这是 Bevy 专用的插件，它提供了在 Bevy 的实体组件系统（ECS）框架内使用 `landmass` 所需的组件、系统和资产集成 。它扮演着连接核心逻辑与游戏引擎的桥梁角色。  
    
3.  **`landmass_oxidized_navigation`**：这是一个高级实用工具 crate，它通过与 `oxidized_navigation` 库集成，将导航系统中最复杂的环节——导航网格生成——自动化 。这个 crate 极大地改善了开发体验，并促成了强大的动态工作流。  

这种由三个相互关联的 crate 组成的结构 ，揭示了一种刻意为之的设计哲学，即强调模块化和可移植性。核心的  

`landmass` crate 对 Bevy 没有任何依赖，这意味着其强大的导航逻辑理论上可以通过一个新的集成层移植到其他基于 Rust 的游戏引擎中。`bevy_landmass` 则是如何构建这样一个集成层的完美范例，它遵循了 Bevy 的数据驱动设计原则 。最后，  

`landmass_oxidized_navigation` 的存在表明了对开发者体验的重视，它认识到导航网格生成是一个主要痛点，并为此提供了一个无缝的自动化解决方案。这种分层方法允许开发者根据需求选择不同的抽象层次，从深度的手动控制到完全自动化的便捷操作。

本报告旨在剖析这些层次结构及其核心概念，从其基础的架构隐喻开始，逐步深入到最高效、最强大的开发工作流程。

## I. 世界容器：理解 `Archipelago`

`Archipelago`（群岛）组件的命名并非仅仅是主题性的，它精确地反映了其在导航世界中的架构角色：根容器 。在现实世界中，群岛是岛屿的集合；在  

`bevy_landmass` 中，拥有 `Archipelago` 组件的实体是管理一系列 `Island`（岛屿）实体的有状态容器。

### 角色与功能

`Archipelago` 是持有 `landmass` 导航系统内部状态的中央组件 。它是核心逻辑进行交互的主要入口点。在场景中，必须生成一个唯一的  

`Archipelago` 实体。所有的 `Island` 和 `Agent`（代理）都将引用这同一个 `Archipelago`，以确保它们属于同一个导航世界。

`Island` 和 `Agent` 实体通过 `ArchipelagoRef` 组件将自身链接到正确的 `Archipelago` 。这一机制支持延迟初始化：即使在  

`Archipelago` 实体存在之前生成代理和岛屿，它们也会在 `Archipelago` 出现后自动完成注册 。  

这种以一个中央 `Archipelago` 为中心、其他实体通过引用进行关联的设计 ，具有深远的架构意义。虽然大多数游戏场景只需要一个  

`Archipelago`，但该架构原生支持多个完全隔离的导航世界。开发者可以生成两个 `Archipelago` 实体，链接到第一个的代理将完全感知不到链接到第二个的岛屿和代理。这一特性可用于分屏多人游戏、复杂的模拟场景，或者在不卸载整个游戏世界的情况下让玩家在不同“维度”或大型区域之间转换。其延迟初始化的能力 对于实体生成顺序无法保证的动态或网络游戏也至关重要。  

## II. 定义可导航区域：`Island` 与 `NavMesh`

### `Island`：可导航性的基本单元

一个 `Island` 实体代表一个单一的、连续的可导航区域 。代理可以在单个  

`Island` 内部的任何地方寻路，但不能在两个独立的 `Island` 之间寻路。生成 `Island` 通常通过 `IslandBundle` 完成，该 `Bundle` 包含 `Island` 标记组件、一个 `ArchipelagoRef` 和一个 `NavMeshHandle` 。此外，它还需要一个  

`TransformBundle` 来确定岛屿在世界中的位置 。  

### `NavMesh`：导航的数据基础

`NavMesh` 是定义 `Island` 可行走表面的核心数据结构。它被实现为一种 Bevy `Asset`（资产）。这种数据驱动的方法是 Bevy 设计哲学的基石 ，并提供了巨大的灵活性。  

`NavMesh` 资产可以在运行时程序化生成，也可以从文件中加载（例如，由 Blender 等外部工具生成并导出），并由 Bevy 的资产服务器进行管理。

### `NavMeshHandle`：关键的链接

`NavMeshHandle` 组件是将 `Island` 实体与特定的 `NavMesh` 资产连接起来的粘合剂 。其工作流程如下：首先创建一个  

`NavMesh` 并将其添加到 `Assets<NavMesh>` 资源中，该操作会返回一个 `Handle`（句柄）。然后，这个 `Handle` 被包装在 `NavMeshHandle` 组件中，并添加到 `Island` 实体上 。这种机制允许多个  

`Island` 实体复用同一个 `NavMesh` 资产，例如在处理相同的关卡区块时。

### 高级 `NavMesh` 特性

该系统支持的功能不止是简单的二进制可达性（可行走/不可行走）。近期的更新引入了带有不同成本的节点类型 。这使得开发者可以在导航网格内定义一些穿越成本更高的区域，用以模拟泥地、浅水或需要潜行的区域等地形。这为 AI 的决策制定增加了一个重要的战术维度。  

将可导航空间严格划分为离散的 `Island` ，是一个经过深思熟虑的设计决策，它在性能和设计之间做出了权衡。默认情况下，系统不允许在岛屿之间进行寻路，这使得任何给定的寻路查询的搜索空间都被限制在单个导航网格内，从而显著加快了寻路计算的速度。然而，这也将处理这些区域之间转换的责任交给了游戏设计师。例如，要让一个代理从建筑的一层（Island A）移动到另一层（Island B），开发者需要实现一个更高级别的逻辑系统（如行为树）。该系统首先将代理寻路到 Island A 上的电梯，触发动画或事件，将代理传送到 Island B 上对应的电梯位置，然后在 Island B 上发起一个新的寻路查询。  

`bevy_landmass` 负责处理岛屿内部的导航，而非岛屿之间的逻辑。

## III. 自主实体：配置与控制 `Agent`

### `Agent`：移动的实体

`Agent` 是任何需要在世界中导航的实体。通过生成一个带有 `AgentBundle` 和 `TransformBundle` 的实体来创建它 。  

`AgentBundle` 包含了导航系统管理该实体所需的所有必要组件 。  

### 使用 `AgentSettings` 进行精细控制

`AgentSettings` 组件允许对代理的物理和移动属性进行详细配置 。关键字段包括：  

-   `radius`：代理的物理半径，用于寻路（确保路径足够宽）和碰撞规避。
    
-   `desired_speed`：代理的期望行进速度。
    
-   `max_speed`：代理能够达到的绝对最大速度。

### AI 控制契约：清晰的 ECS 接口

`bevy_landmass` 提供了一个清晰且解耦的“控制契约”，与 Bevy 的 ECS 范式完美集成。

-   **输入（开发者责任）**：要为代理指定一个目的地，开发者需要向代理实体添加一个 `AgentTarget` 组件。该组件指定了目标，可以是一个世界中的特定点 。  
    
-   **输出（库的责任）**：`bevy_landmass` 的系统在后台运行。它们会在相应的 `NavMesh` 上执行 A\* 寻路查询，并运行局部碰撞规避算法（鉴于作者的 `dodgy` crate，很可能是 ORCA ）以防止代理相互碰撞。这些计算的结果最终被写入到代理实体的  
    
    `AgentDesiredVelocity` 组件中 。  
    
-   **行动（开发者责任）**：开发者编写一个简单的系统，查询所有带有 `AgentDesiredVelocity` 的实体，并将这个速度应用到它们的 `Transform` 组件上，从而使它们移动。

引入独立的 `desired_speed` 和 `max_speed` 值 并非微小的调整，而是实现高质量局部碰撞规避的关键特性。像 ORCA 这样的局部规避算法，其工作原理是计算一个既能避免碰撞又尽可能接近“首选”速度的速度向量。通过将  

`max_speed` 设置得高于 `desired_speed`，开发者为规避算法提供了“余量”。代理可以暂时超过其正常速度来超越另一个代理，或更有效地躲避障碍。如果没有这个余量，密集人群中的代理可能会陷入“相互谦让”的僵局，因为它们在固定的速度下找不到有效的移动方案。这个细节使得群体移动看起来明显更加流畅和自然。

## IV. 自动化工作流：与 `oxidized_navigation` 的无缝集成

对于使用 `bevy_landmass` 的开发者来说，一个关键的选择是如何生成导航网格。手动创建和自动化生成是两种截然不同的工作流程。

**表1: `bevy_landmass` 设置方法对比**

特性

手动 `NavMesh` 设置

通过 `landmass_oxidized_navigation` 自动化设置

**主要插件**

`LandmassPlugin`

物理插件 (如 `bevy_rapier`), `OxidizedNavigationPlugin`, `LandmassPlugin`, `LandmassOxidizedNavigationPlugin`

**`NavMesh` 来源**

手动创建或作为 `NavMesh` 资产加载。需要外部工具或复杂的程序化代码。

在运行时从带有物理 `Collider` 组件的实体自动生成。

**关键组件**

`Archipelago`, `IslandBundle`, `NavMeshHandle`, `AgentBundle`

`Archipelago` (带有 `OxidizedArchipelago` 标记), `AgentBundle`。`Island` 和 `NavMesh` 由内部管理。

**开发者工作量**

**高**：创建、导入和管理导航网格数据需要大量工作，尤其对于复杂或动态的关卡。

**低**：只需用碰撞体定义世界的物理形状，导航网格便会自动生成。

**适用场景**

静态、预定义的关卡，需要对可行走区域进行精确的艺术控制。

动态或程序化生成的关卡；快速原型开发；关卡几何形状频繁变化的项目。

导出到 Google 表格

手动创建导航网格是一个耗时且容易出错的过程，几十年来一直是游戏开发中的一个瓶颈。由 `landmass_oxidized_navigation` 促成的自动化工作流完全抽象了这个问题。它利用  

`oxidized_navigation` 从物理碰撞体生成导航网格，将问题从“如何定义可行走空间？”转变为“如何定义物理世界？”。而后者是游戏开发者为实现物理交互本就需要做的事情。这种协同作用极大地降低了入门门槛并加速了开发进程，使其成为绝大多数项目的推荐方法。  

### 自动化设置步骤

1.  **添加依赖**：在 `Cargo.toml` 文件中包含 `bevy_landmass`、`landmass_oxidized_navigation`、`oxidized_navigation` 以及一个兼容的物理插件（例如 `bevy_rapier3d`）。
    
2.  **注册插件**：按照文档指定的正确顺序将插件添加到 Bevy `App` 中 ：  
    
    -   物理插件
        
    -   `OxidizedNavigationPlugin`
        
    -   `LandmassPlugin` (或 `Landmass3dPlugin`/`Landmass2dPlugin`)
        
    -   `LandmassOxidizedNavigationPlugin`
        
3.  **生成世界容器**：创建一个实体，为其添加 `Archipelago` 组件（例如 `Archipelago3d`）和 `OxidizedArchipelago` 标记组件。这个标记告诉集成插件应将自动生成的导航网格填充到哪个 `Archipelago` 中 。  
    
4.  **构建关卡**：使用带有 `Collider` 组件的实体来创建关卡几何体。这些碰撞体将作为 `oxidized_navigation` 生成导航网格的输入。
    
5.  **生成代理**：像往常一样使用 `AgentBundle` 生成代理。它们现在将能够跨越自动生成的导航网格进行寻路。

## V. 高级概念与系统架构

### `CoordinateSystem` Trait：实现 2D 与 3D 导航

`bevy_landmass` 并不局限于 3D 世界。其核心逻辑通过 `CoordinateSystem` trait 的运用，实现了对坐标系的泛型支持 。该 trait 定义了一系列必需的方法，用于在 Bevy 的原生类型（如  

`Vec3`、`Quat`）和 `landmass` crate 内部使用的表示之间进行转换 。库中提供了两个具体的实现：  

`ThreeD` 和 `TwoD`。正是这种优雅的抽象，使得同一套寻路和规避逻辑能够无缝地应用于俯视角的 2D 游戏和完整的 3D 环境，正如在 0.7.0 版本更新中所宣布的那样 。  

### `LandmassPlugin`：整合一切

`LandmassPlugin` 是该库的主要入口点 。当被添加到 Bevy  

`App` 中时，它会注册所有必需的组件、资产（`NavMesh`）以及执行持续工作的系统，这些系统负责更新代理状态、运行寻路查询和计算规避速度。它是使整个基于 ECS 的系统得以运作的协调者。

### 生态系统中的定位

`bevy_landmass` 存在于一个充满活力的 Bevy 导航解决方案生态系统中 。其他 crate 探索了不同的技术，如流场（  

`bevy_flowfield_tiles_plugin`）或分层寻路（`bevy_northstar`）。根据用户反馈 ，  

`bevy_landmass` 通常被认为比某些替代方案更易于使用和理解。其主要优势在于其稳健的、基于导航网格的方法、清晰的架构隐喻，尤其是由 `landmass_oxidized_navigation` 提供的强大且易于使用的自动化工作流。这使其成为从简单原型到复杂模拟等各种游戏的绝佳选择。

