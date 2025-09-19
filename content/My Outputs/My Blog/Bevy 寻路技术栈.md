---
Status: 🌲
tags:
  - output/blog
Links:
  - "[[Bevy MOC|Bevy MOC]]"
Created: 2025-08-21T14:46:32
BevyVersion:
  - "0.16"
share: true
---
# Bevy 寻路技术栈

## 1.0 执行摘要

### 1.1 Bevy 寻路生态系统概述

想象你在玩一个策略游戏，点击地图上的某个位置，你的单位就会自动找到路径走过去，避开所有障碍物。这就是寻路系统的作用！

在 Bevy 中，实现寻路功能就像搭积木一样，需要组合使用不同的"积木块"（库）。每个库负责解决特定的问题，它们组合在一起就形成了完整的寻路系统。

一个完整的寻路系统包含三个层次：

**物理层 (Physics Layer)**：

- 想象这是你游戏世界的"骨架"
- 它定义了哪里是地面、哪里是墙壁、哪里是障碍物
- 就像告诉系统："这里有一堵墙，角色不能穿过去"

**导航网格生成层 (Navmesh Generation Layer)**：

- 这一层把复杂的3D世界转换成一张"地图"
- 就像把一个复杂的城市简化成一张只标记道路的地图
- 它告诉角色："这些地方可以走，哪些地方不能走"

**代理逻辑层 (Agent Logic Layer)**：

- 这是最"聪明"的一层
- 它负责让角色知道怎么从A点走到B点
- 包括转弯、避让其他角色等高级行为

对于 Bevy 0.16，目前还没有一个库能够独自完成所有这三层的工作。所以我们需要像搭积木一样，选择合适的库来组合使用。

### 1.2 关键架构决策概要

在构建寻路系统时，你需要做两个重要的选择：

**物理层选择：bevy_rapier vs avian**

- **bevy_rapier**：就像一辆功能强大的越野车，性能卓越，功能丰富，但操作相对复杂
- **avian**：就像一辆现代化的电动车，设计优雅，使用简单，与 Bevy 完美融合

**导航网格生成层选择：bevy_rerecast vs oxidized_navigation**

- **bevy_rerecast**：就像使用专业的地图编辑软件，功能强大，可以精确控制每个细节
- **oxidized_navigation**：就像使用自动导航系统，全自动生成，无需手动干预

**代理逻辑层：landmass**

- 这是目前的最佳选择，没有其他竞争对手
- 它负责让你的角色智能地移动

### 1.3 推荐技术栈总结

**对于初学者，我强烈推荐：avian + oxidized_navigation + landmass**

为什么推荐这个组合？

- **简单易用**：大部分工作都是自动的
- **符合 Bevy 理念**：完全融入 Bevy 的 ECS 系统
- **适合动态世界**：当你的世界发生变化时（比如墙倒了），寻路会自动更新

### 1.4 关键组件对比表

|组件|作用|初学者友好度|主要特点|
|---|---|---|---|
|**bevy_rapier**|物理引擎|⭐⭐⭐|功能强大但较复杂|
|**avian**|物理引擎|⭐⭐⭐⭐⭐|简单易用，与 Bevy 完美融合|
|**bevy_rerecast**|导航网格生成|⭐⭐|需要使用外部编辑器|
|**oxidized_navigation**|导航网格生成|⭐⭐⭐⭐⭐|全自动，即插即用|
|**landmass**|代理逻辑|⭐⭐⭐⭐|功能完整，使用简单|

## 2.0 基础层：物理引擎分析

物理引擎就像是游戏世界的"物理规则制定者"。它决定了什么东西是实体的（不能穿过），什么东西会掉落，什么东西会碰撞。

对于寻路来说，物理引擎最重要的作用是告诉系统："这里有障碍物，角色不能穿过去"。

### 2.1 bevy_rapier: 成熟的行业标杆

bevy_rapier 就像是物理引擎界的"瑞士军刀"——功能齐全，性能强大，经过了时间的考验。

#### 2.1.1 架构哲学："独立世界"模型

想象 bevy_rapier 的工作方式：

- Bevy 有自己的世界（存储所有游戏数据）
- Rapier 创建了另一个独立的物理世界
- 每一帧，数据在这两个世界之间同步

这就像你有两本账本，需要保持它们的数据一致：

```
Bevy 世界 <--同步--> Rapier 物理世界
```

**优点**：

- 物理计算非常快
- 功能非常完整

**缺点**：

- 需要理解两个世界如何同步
- 代码稍微复杂一些

#### 2.1.2 功能集与性能

bevy_rapier 提供的功能就像一个专业的物理实验室：

- **刚体类型**：
    
    - 动态（会掉落的箱子）
    - 静态（地面、墙壁）
    - 运动学（移动平台）
- **碰撞体形状**：
    
    - 基本形状：球、立方体、胶囊体
    - 复杂形状：任意网格形状
- **高级功能**：
    
    - 关节（像门的铰链）
    - 连续碰撞检测（防止高速物体穿墙）

#### 2.1.3 代码质量、维护与社区

- 由专业团队维护
- 有大量用户和活跃社区
- 文档详尽，示例丰富

### 2.2 avian: ECS 原生的挑战者

avian 就像是专门为 Bevy 设计的"定制版"物理引擎——它完全融入 Bevy 的系统，使用起来非常自然。

#### 2.2.1 架构哲学："集成 ECS"模型

avian 的工作方式非常简单直接：

- 只有一个世界（Bevy 的世界）
- 物理对象就是普通的 Bevy 实体
- 所有计算都在 Bevy 系统中进行

```
Bevy 世界（包含所有物理数据）
```

**优点**：

- 使用超级简单
- 完全符合 Bevy 的设计理念
- 没有同步问题

**初学者示例**：

```rust
// 使用 avian 创建一个物理对象就这么简单！
commands.spawn((
    PbrBundle { /* 视觉外观 */ },
    RigidBody::Static,  // 这是个静态物体
    Collider::cuboid(1.0, 1.0, 1.0),  // 碰撞体形状
));
```

#### 2.2.2 功能集与确定性

avian 提供的功能对于大多数游戏来说完全够用：

- **基础物理功能**：✅ 全部支持
- **碰撞检测**：✅ 和 rapier 用同样的底层库
- **确定性**：✅ 这是 avian 的独特优势！

**什么是确定性？** 想象你在玩网络游戏，确定性意味着：

- 相同的输入总是产生相同的结果
- 这对网络同步非常重要
- avian 在这方面做得很好

#### 2.2.3 代码质量、维护与社区

- 快速发展中
- 社区非常活跃
- 被认为是 Bevy 未来的"官方"物理引擎候选

### 2.3 寻路几何源的比较与推荐

对于寻路来说，两个物理引擎都能很好地提供障碍物信息。

**初学者推荐：使用 avian**

原因：

1. 更简单易用
2. 与 Bevy 完美融合
3. 对于大多数游戏来说性能完全足够

**什么时候用 bevy_rapier？**

- 你的游戏有数千个物理对象在互相碰撞
- 你需要非常特殊的物理功能
- 你的项目已经在使用它了

## 3.0 几何层：导航网格生成

导航网格生成层就像是一个"地图制作者"——它把复杂的3D世界转换成角色能理解的"地图"。

### 3.1 bevy_rerecast: 行业标准的移植

bevy_rerecast 就像使用 Photoshop 编辑图片——功能强大，可以精确控制每个细节，但需要学习如何使用。

#### 3.1.1 核心技术：Recast & Detour

Recast 算法的工作原理（简化版）：

1. 把3D世界切成很多小方块（像素化）
2. 标记哪些方块能走，哪些不能走
3. 把能走的方块连接成一张网

它生成两种网格：

- **多边形网格**：简单快速，用于寻路
- **细节网格**：精确贴合地形，让移动更自然

#### 3.1.2 工作流与工具：bevy_rerecast_editor

使用 bevy_rerecast 的流程就像使用地图编辑器：

1. **运行游戏**
2. **打开编辑器**（一个独立的程序）
3. **调整参数**：
    - 角色有多高？
    - 角色有多胖？
    - 能爬多陡的坡？
4. **保存地图文件**
5. **在游戏中加载**

这种方式适合：

- 静态关卡（不会变化的地图）
- 需要精确控制的复杂场景

#### 3.1.3 通过后端与 Bevy 集成

bevy_rerecast 需要知道世界中有哪些障碍物。它通过"后端"系统来获取这些信息：

```rust
// 告诉 bevy_rerecast 使用 avian 的碰撞体
app.add_plugin(AvianBackendPlugin);
```

### 3.2 oxidized_navigation: 原生的 Rust 实现

oxidized_navigation 就像手机的自动导航——你不需要做任何事，它会自动为你生成地图。

#### 3.2.1 核心技术与运行时工作流

oxidized_navigation 的工作流程极其简单：

1. **添加插件**
2. **标记障碍物**（添加一个组件）
3. **完成！**（系统自动处理剩下的）

```rust
// 就是这么简单！
commands.spawn((
    // 你的墙壁模型
    PbrBundle { /* ... */ },
    // 物理碰撞体
    Collider::cuboid(5.0, 2.0, 1.0),
    // 告诉系统：这个会影响导航
    NavMeshAffector,  // <-- 只需要加这个！
));
```

当世界发生变化时（比如墙倒了），导航网格会自动更新！

#### 3.2.2 与物理引擎的集成

oxidized_navigation 可以和任何物理引擎配合：

- 使用 avian？安装 `oxidized_navigation_avian`
- 使用 rapier？安装 `oxidized_navigation_rapier`

它会自动读取物理碰撞体，生成导航网格。

#### 3.2.3 API 设计与异步操作

oxidized_navigation 的聪明之处：

- **异步生成**：不会让游戏卡顿
- **自动更新**：世界变化时自动重新生成
- **简单配置**：只需设置角色大小

```rust
NavMeshSettings {
    agent_radius: 0.4,  // 角色半径
    agent_height: 1.8,  // 角色高度
    ..default()
}
```

### 3.3 导航网格生成的比较与推荐

|特性|bevy_rerecast|oxidized_navigation|
|---|---|---|
|**易用性**|⭐⭐|⭐⭐⭐⭐⭐|
|**自动化**|❌|✅|
|**动态更新**|❌|✅|
|**精确控制**|⭐⭐⭐⭐⭐|⭐⭐⭐|
|**需要外部工具**|✅|❌|

**初学者推荐：oxidized_navigation**

原因：

- 即插即用，无需学习额外工具
- 自动处理动态变化
- 代码量最少

## 4.0 逻辑层：使用 landmass 进行代理导航

landmass 就像是角色的"大脑"——它让角色知道如何智能地移动。

### 4.1 一个综合性的导航系统

landmass 不仅仅是寻路，它是一个完整的 AI 移动系统。

#### 4.1.1 功能范围

landmass 提供四大功能：

1. **路径寻找**：找到从A到B的路
2. **路径简化**：让路径更自然（不是锯齿状）
3. **转向**：控制角色如何转弯
4. **避障**：避开其他移动的角色

想象一群人在商场里走动——landmass 让每个人都能找到路，同时避免撞到别人。

#### 4.1.2 架构设计："群岛"模型

landmass 使用一个有趣的比喻：

- **Archipelago（群岛）**：整个导航世界
- **Island（岛屿）**：一块连通的可行走区域
- **Agent（代理）**：在岛上移动的角色

```rust
// 创建一个"群岛"
let archipelago = commands.spawn(Archipelago3d::new()).id();

// 角色加入这个群岛
commands.spawn(Agent3dBundle {
    archipelago_ref: ArchipelagoRef::new(archipelago),
    ..default()
});
```

#### 4.1.3 API 与使用方法

使用 landmass 的步骤：

1. **添加插件**

```rust
app.add_plugins(Landmass3dPlugin::default());
```

2. **创建群岛**（导航世界）

```rust
commands.spawn(Archipelago3d::new());
```

3. **创建角色**

```rust
commands.spawn(Agent3dBundle {
    agent: Agent {
        radius: 0.4,         // 角色大小
        desired_speed: 3.0,  // 想要的速度
        max_speed: 5.0,      // 最大速度
    },
    // ... 其他设置
});
```

4. **设置目标**

```rust
// 告诉角色去哪里
*agent_target = AgentTarget::Point(Vec3::new(10.0, 0.0, 10.0));
```

5. **移动角色**

```rust
// landmass 会计算速度，你只需要应用它
transform.translation += desired_velocity.velocity() * time.delta_seconds();
```

## 5.0 整合技术栈：推荐组合与实现

现在让我们把所有积木组合起来！

### 5.1 生态系统版图：集成库的角色

数据流程图（简化版）：

```
物理碰撞体 (avian)
    ↓
[转换器] (oxidized_navigation_avian)
    ↓
导航网格 (oxidized_navigation)
    ↓
[转换器] (landmass_oxidized_navigation)
    ↓
角色移动 (landmass)
```

这些"转换器"库就像适配器，让不同的库能够互相理解。

### 5.2 首要推荐：全集成技术栈 (avian + oxidized_navigation + landmass)

#### 5.2.1 推荐理由

这个组合就像买了一套智能家居系统——所有东西都能自动协同工作：

- **超级简单**：大部分是自动的
- **动态更新**：世界变化时自动适应
- **符合 Bevy 理念**：完美融入 ECS 系统

#### 5.2.2 实现蓝图

**步骤1：设置依赖**

```toml
# Cargo.toml
[dependencies]
bevy = "0.16"
avian3d = "0.3"
oxidized_navigation = { version = "0.12", features = ["avian"] }
bevy_landmass = "0.8"
landmass_oxidized_navigation = "0.2"
```

**步骤2：初始化系统**

```rust
fn main() {
    App::new()
        .add_plugins(DefaultPlugins)
        
        // 1. 物理引擎
        .add_plugins(PhysicsPlugins::default())
        
        // 2. 导航网格生成（自动的！）
        .add_plugins(OxidizedNavigationPlugin::<Collider>::new(
            NavMeshSettings {
                agent_radius: 0.4,
                agent_height: 1.8,
                ..default()
            }
        ))
        
        // 3. 角色AI
        .add_plugins(Landmass3dPlugin::default())
        
        // 4. 连接器（让它们协同工作）
        .add_plugins(LandmassOxidizedNavigationPlugin)
        
        .run();
}
```

**步骤3：创建世界**

```rust
fn setup(mut commands: Commands) {
    // 地面（角色能走的地方）
    commands.spawn((
        PbrBundle { /* 外观 */ },
        RigidBody::Static,
        Collider::cuboid(50.0, 0.1, 50.0),
        NavMeshAffector,  // 关键！标记为可行走
    ));
    
    // 障碍物（角色不能穿过的）
    commands.spawn((
        PbrBundle { /* 外观 */ },
        RigidBody::Static,
        Collider::cuboid(5.0, 2.0, 1.0),
        NavMeshAffector,  // 关键！标记为障碍
    ));
    
    // 创建导航世界
    let archipelago = commands.spawn((
        Archipelago3d::new(),
        OxidizedArchipelago,  // 自动连接！
    )).id();
    
    // 创建角色
    commands.spawn((
        PbrBundle { /* 外观 */ },
        Agent3dBundle {
            agent: Agent {
                radius: 0.4,
                desired_speed: 3.0,
                max_speed: 5.0,
                ..default()
            },
            archipelago_ref: ArchipelagoRef::new(archipelago),
            ..default()
        },
        AgentTarget::Point(Vec3::new(10.0, 1.0, 10.0)),
    ));
}
```

### 5.3 备选技术栈及其适用场景

#### 5.3.1 性能优先栈 (bevy_rapier + oxidized_navigation + landmass)

**什么时候用？**

- 你有数千个物理对象
- 性能是第一优先级
- 你已经熟悉 rapier

**改动很小**：

```toml
# 只需要改 Cargo.toml
bevy_rapier3d = "0.27"  # 替代 avian3d
oxidized_navigation = { version = "0.12", features = ["rapier"] }  # 改 feature
```

#### 5.3.2 设计创作优先栈 (avian + bevy_rerecast + landmass)

**什么时候用？**

- 静态关卡（不会变的地图）
- 需要美术精确控制
- 有专门的关卡设计师

**工作流程**：

1. 使用编辑器精心设计导航网格
2. 保存为文件
3. 游戏加载文件

## 6.0 结论与未来展望

### 6.1 最终总结

恭喜你！现在你已经了解了 Bevy 寻路系统的全貌。

**关键要点**：

1. **寻路需要三层**：物理、导航网格、AI逻辑
2. **推荐组合**：avian + oxidized_navigation + landmass
3. **核心优势**：简单、自动、动态

这个技术栈的美妙之处在于它的自动化——你只需要：

1. 标记哪些东西是障碍物（添加组件）
2. 创建角色
3. 设置目标
4. 系统会处理剩下的一切！

### 6.2 未来展望

Bevy 生态系统在快速发展，未来会有：

**更好的性能**：

- avian 会越来越快
- 可能会有更多优化

**更多功能**：

- 更智能的 AI 行为
- 更复杂的避障算法
- 可能的官方集成

**更简单的使用**：

- 可能会有"一键式"解决方案
- 更好的调试工具
- 更多教程和示例

**初学者建议**：

1. 先用推荐的技术栈上手
2. 做一些简单的项目练习
3. 随着经验增长，探索更高级的功能
4. 关注社区动态，学习最新技术

记住：**现在就可以开始**！这个技术栈已经足够成熟，可以用来做真正的游戏了。

祝你在 Bevy 寻路的旅程中一切顺利！🎮 🚀