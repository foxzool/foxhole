---
title: Bevy 复刻黄金矿工｜Stage 1：玩法规划与前期准备
Status: 🟩
tags:
  - output/blog
Links:
  - "[[Bevy MOC]]"
Created: 2025-11-12
BevyVersion:
  - "0.17"
share: true
Collection: "[[黄金矿工]]"
Finished: 2025-11-12
---
# Bevy 复刻黄金矿工｜Stage 1：玩法规划与前期准备

本系列将使用 **Bevy 0.17** 来复刻经典游戏《黄金矿工》，目标同时支持 **Native** 与 **Web（WASM）** 运行。本篇为 Stage 1，重点放在：

- 明确项目整体目标与边界  
- 拆解经典黄金矿工的核心玩法机制  
- 选择并确认 MIT 协议的免费素材  
- 使用 `bevy_cli` 完成项目初始化与 Web 版本运行  
- 实现最小可行 Demo：加载页 + 菜单 + 文本 UI

内容偏向「实战开发记录」，既可以当作个人开发日志，也可以作为之后 Stage 2 / Stage 3 的基础说明。

---

## 一、项目目标与范围

### 1.1 核心目标

- 使用 **Bevy 游戏引擎** 复刻经典《黄金矿工》  
- 支持 **Native 桌面** 与 **Web（WASM）** 运行环境  
- 采用 **Rust + ECS（实体组件系统）** 开发范式  
- 尽量保持玩法风格接近原版，同时保留一定扩展空间（如更多道具、关卡配置等）

### 1.2 Stage 1 的具体目标

在 Stage 1 中，项目暂时不追求「可玩性完整」，而是聚焦于：

1. 搭建基础工程结构  
2. 确认素材与坐标系转换方案  
3. 让主菜单场景可以在 Native / Web 上稳定运行  
4. 预留状态机与后续关卡机制的扩展点

可以理解为：**先把“壳”搭好，再逐步往里面填玩法逻辑。**

---

## 二、玩法机制分析

在动手写代码之前，先快速回顾一下《黄金矿工》的经典玩法：

### 2.1 抓钩与摆动

- 抓钩以角色为中心左右摆动，形成一个周期性的角度变化  
- 玩家在合适时机按下按键，下放抓钩  
- 抓钩沿当前方向直线伸出，直到碰到目标或超出边界

### 2.2 物品与重量

- 金块：价值高，重量中等或偏重  
- 小金块 / 宝石 / 钻石：价值高但体积小，重量轻  
- 石头：价值低，重量大，拖拽慢  
- 宝袋：随机奖励或特殊效果

不同物品的 **重量** 将直接影响抓回速度，是后续物理与速度计算的关键参数。

### 2.3 关卡目标

- 每一关有 **时间限制** 与 **目标金额**  
- 在限定时间内，累计金币达到目标值即可通关  
- 未达标则关卡失败

### 2.4 商店与道具

在关卡之间，玩家可以花费金币购买：

- 炸药（丢弃大石头）  
- 时间延长类道具  
- 抓钩加速类道具  
- 其他定制玩法道具

这些内容将在后续 Stage 中逐步实现，Stage 1 主要为它们预留结构空间。

---

## 三、免费素材与授权

选择素材时，有两个关键考虑：

1. **授权协议**（是否允许商用、修改、分发）  
2. **完整度**（是否包含玩家、物品、背景、UI、字体、音效等）

本项目使用 GitHub 上的开源项目：

**GoldMiner-Rebirth（MIT 协议）**  
仓库地址：<https://github.com/zzxzzk115/GoldMiner-Rebirth>

该仓库提供：

- PNG 格式的游戏元素图片（包括金块、石头、角色、背景等）  
- 字体资源  
- 部分音效文件  
- 原项目的逻辑参考（Love2D 实现）

MIT 协议非常宽松，允许：

- 复制、修改、合并、发布、再授权  
- 用于开源或闭源项目  
- 用于商业或非商业用途  

只需在最终项目中保留相应许可声明即可。

---

## 四、项目初始化：bevy_cli

为了提高项目脚手架质量，同时简化 Web 构建流程，本项目采用官方的命令行工具 **`bevy_cli`** 来初始化。

### 4.1 什么是 bevy_cli？

`bevy_cli` 是 Bevy 官方团队实现的「多合一」命令行工具，目前仍处于预览阶段，主要功能包括：

- 创建不同模板类型的 Bevy 项目（2D / 3D 等）  
- 方便地运行 Web 版本（WASM）  
- 集成 Lint、格式检查等  
- 后续还会扩展更多工具链（如部署、打包等）

### 4.2 安装 bevy_cli

`bevy_cli` 尚未发布到 crates.io，需要通过 Git 直接安装：

```bash
cargo install --git https://github.com/TheBevyFlock/bevy_cli   --tag cli-v0.1.0-alpha.2 --locked bevy_cli
```

这里通过 `--tag` 锁定版本，以避免未来 API 变化带来的不兼容。

### 4.3 创建项目

安装完成后，可以通过一行命令创建 2D 模板：

```bash
bevy new -t=2d goldminer
cd goldminer
```

`-t=2d` 表示使用官方提供的 2D 模板，默认包含：

- 基础 Bevy 依赖  
- 示例场景（常见是一个简单动画 Demo）  
- Web 构建所需的配置

### 4.4 首次运行：Web 版本

执行以下命令可以直接运行 Web 版本：

```bash
bevy run web --open
```

构建完成后，浏览器会自动打开：

- 包含加载页面（Loading）  
- 主菜单页面（Menu）  
- 示例动画页面（例如一只小鸭走来走去）

示例画面如下：

![menu](https://assets.zool.me/2025/11/ac05b1ae6c6ab74cb3a157d8319d7deb.png)  

![duck](https://assets.zool.me/2025/11/30f98ed97466f87dcb34439f37fc8458.png)  

从这一刻起，整个黄金矿工项目已经拥有了一个可运行的「骨架」。

---

## 五、菜单场景设计与分辨率策略

菜单是整个游戏的入口，本篇先把菜单屏幕和基础视觉设定搭好。

### 5.1 分辨率设定

原始素材以 **320×240** 为基准分辨率。  
为了在现代屏幕上避免画面过小，本项目将窗口放大到 **1280×960**，也就是 4 倍缩放：

```rust
.set(WindowPlugin {
    primary_window: Window {
        title: "Goldminer".to_string(),
        resolution: (1280, 960).into(),
        fit_canvas_to_parent: true,
        ..default()
    }.into(),
    ..default()
})
```

这样既能保持像素风格，又能让画面在桌面与浏览器中看起来更清晰。

### 5.2 Camera 视野缩放

素材本身仍然是 320×240 尺寸，如果直接绘制在 1280×960 的窗口中，会显得非常小。因此需要通过 **正交投影（Orthographic Projection）** 来缩放视野。

```rust
fn spawn_camera(mut commands: Commands) {
    commands.spawn((
        Name::new("Camera"),
        Camera2d,
        Projection::Orthographic(OrthographicProjection {
            near: -1000.0,
            scale: 0.25,
            ..OrthographicProjection::default_2d()
        }),
    ));
}
```

这里的关键点在于：

- 将 `scale` 设置为 `0.25`，相当于把画面放大 4 倍  
- 结合前面 1280×960 的窗口尺寸，能够把原始 320×240 的内容完整展示并放大

---

## 六、坐标系转换：Love2D → Bevy

由于原项目使用 **Love2D** 实现，相关素材和位置设计都基于 Love2D 的坐标系：

- 原点在左上角  
- X 轴向右递增  
- Y 轴向下递增

而 Bevy 默认的 2D 世界坐标系是：

- 原点在屏幕中心  
- X 轴向右递增  
- Y 轴向上递增（与 Love2D 相反）

为了复用原项目中的坐标数据，需要实现一个坐标转换函数：

```rust
pub const VIRTUAL_WIDTH: f32 = 320.0;
pub const VIRTUAL_HEIGHT: f32 = 240.0;

/// 将 Love2D 坐标转换为 Bevy 坐标
pub fn love_to_bevy_coords(x: f32, y: f32) -> Vec2 {
    Vec2::new(
        x - VIRTUAL_WIDTH / 2.0,      // X：从左上角平移到中心
        VIRTUAL_HEIGHT / 2.0 - y,     // Y：翻转 + 平移到中心
    )
}
```

有了这个函数之后：

- 可以直接把原 Love2D 项目里写死的坐标迁移过来  
- 在 Bevy 中绘制时保持位置一致  
- 也为后续关卡布局复刻提供了基础工具

---

## 七、菜单状态管理

为了支持多种菜单（主菜单、高分榜、设置等），需要一个简单的 **菜单状态机**。

```rust
#[derive(States, Copy, Clone, Eq, PartialEq, Hash, Debug, Default)]
pub enum Menu {
    #[default]
    None,
    Main,
    HighScore,
}
```

典型使用方式：

- `Menu::Main`：主菜单  
- `Menu::HighScore`：高分榜  
- `Menu::None`：非菜单状态（例如游戏中）

这个状态枚举会与 Bevy 的 `States` 系统结合，用于控制哪些系统在当前状态下运行。

---

## 八、菜单布局与 UI 构建

在 Stage 1 中，菜单不采用复杂的 UI 布局系统，而是使用最直接的：

- 背景图：`Sprite`  
- 文本：`Text2d`  

这种方式足够还原经典黄金矿工的菜单，也更利于初期快速搭建。

### 8.1 主菜单根节点

```rust
fn spawn_main_menu(mut commands: Commands, asset_server: Res<AssetServer>) {
    commands.spawn((
        widget::ui_root("Main Menu"),
        GlobalZIndex(2),
        DespawnOnExit(Menu::Main),
        Sprite::from_image(asset_server.load("images/bg_start_menu.png")),
        children![
            play_button(&asset_server),
            score_button(&asset_server),
            developer_text(&asset_server),
            menu_arrow(&asset_server)
        ],
    ));
}
```

这里做了几件事：

- 设置菜单根节点的名称 `Main Menu`  
- 使用 `GlobalZIndex(2)` 保证菜单在上层渲染  
- 使用 `DespawnOnExit(Menu::Main)` 来实现「离开主菜单状态时自动销毁节点」  
- 使用背景图片 `bg_start_menu.png`  
- 通过 `children!` 挂载多个子元素（按钮、文字、指示箭头）

### 8.2 Play 按钮示例

```rust
fn play_button(asset_server: &AssetServer) -> impl Bundle {
    let font = asset_server.load("fonts/Kurland.ttf");

    (
        Name::new("Start Game"),
        Text2d::new("Start Game"),
        TextFont {
            font,
            font_size: 20.0,
            ..default()
        },
        Transform::from_translation(love_to_bevy_coords(30.0, 150.0).extend(0.0)),
        Anchor::TOP_LEFT,
        TextColor(COLOR_YELLOW),
    )
}
```

要点：

- 按钮文本使用素材项目中的字体 `Kurland.ttf`  
- 文本通过 `Text2d` 渲染，而不是 UI Text  
- 位置通过前面提到的 `love_to_bevy_coords` 转换实现  
- 使用 `Anchor::TOP_LEFT` 配合 Love 风格布局

其他按钮（例如高分榜、开发者信息等）可以按同样模式添加。

---

## 九、菜单输入逻辑与系统绑定

主菜单需要处理的典型输入包括：

- 上下方向键：切换当前选中项  
- Enter / 小键盘回车：确认操作  

首先在调度中声明系统只在主菜单状态下运行：

```rust
.add_systems(Update, keyboard_input.run_if(in_state(Menu::Main)));
```

然后实现具体输入逻辑：

```rust
fn keyboard_input(
    input: Res<ButtonInput<KeyCode>>,
    current_item: Res<State<MenuSelect>>,
    mut next_item: ResMut<NextState<MenuSelect>>,
    mut next_menu: ResMut<NextState<Menu>>,
    mut next_screen: ResMut<NextState<Screen>>,
    resource_handles: Res<ResourceHandles>,
) {
    if input.just_pressed(KeyCode::ArrowUp) || input.just_pressed(KeyCode::ArrowDown) {
        if current_item.get() == &MenuSelect::StartGame {
            next_item.set(MenuSelect::HighScore);
        } else {
            next_item.set(MenuSelect::StartGame);
        }
    }

    if input.just_pressed(KeyCode::Enter) || input.just_pressed(KeyCode::NumpadEnter) {
        if current_item.get() == &MenuSelect::StartGame {
            if resource_handles.is_all_done() {
                next_screen.set(Screen::Gameplay);
            } else {
                next_screen.set(Screen::Loading);
            }
        } else {
            next_menu.set(Menu::HighScore);
        }
    }
}
```

这里体现了几个重要设计点：

- 菜单选择项 `MenuSelect` 作为独立状态，便于扩展更多菜单项  
- 按下回车后，不是直接进入游戏，而是先判断资源是否加载完毕  
- 如果资源尚未加载完成，则跳转到 `Screen::Loading`，表现更加友好

---

## 十、Stage 1 完成效果

在完成本阶段所有工作后，项目已经具备：

- 可运行的 Native / Web 版本  
- 带有背景与文本按钮的主菜单  
- 基于 Love2D 原始设计的布局与坐标  
- 简单但可扩展的菜单状态机与输入逻辑  

示例效果如下：

![finish1](https://assets.zool.me/2025/11/29641c388f2907ecee1b0a9ad0e148f8.png)  

![finish2](https://assets.zool.me/2025/11/3a8d07bd9a9670f186a0df6c56abae16.png)  

---

## 十一、下一阶段预告：Stage 2 抓钩系统

在接下来的 Stage 2 中，重点会放在真正的「黄金矿工核心玩法」上：

- 抓钩左右摆动与角度控制  
- 抓钩下放与回收逻辑  
- 与场景中物体的碰撞检测  
- 不同物体基于重量的拉回速度计算  
- 拖拽过程中的动画反馈与音效处理  
- 初版关卡时间与目标金额系统

届时将正式进入「可玩版本」的实现阶段，而本篇搭建的菜单、坐标与基础结构，会成为后续所有内容的支撑骨架。

