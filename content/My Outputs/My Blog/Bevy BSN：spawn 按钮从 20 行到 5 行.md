---
title: "Bevy BSN：spawn 按钮从 20 行到 5 行"
Status: 🟩
tags:
  - output/blog
Links:
  - "[[Blog Posts MOC]]"
Created: 2026-05-13
Finished: 2026-05-13
share: true
---
> **版本说明**：本文基于 Bevy 0.19 / main 分支撰写。截至 2026-05-13，crates.io 上最新正式版仍为 0.18.x，但 GitHub 上的 0.19 milestone 已经完成 99%（428 closed / 2 open）[^1]，BSN 的核心子集已经落到了 main 分支。如果你现在就想尝鲜，直接拉 main 即可。

![封面图](assets/blog-images/bsn-cover.png)


---

## 我的 Bundle 恶梦：一个按钮到底要多少行？

说实话，我写 Bevy UI 的时候最烦的不是逻辑，是**样板代码**。

每次我想在屏幕上放一个简单的 "Ok" 按钮，我得先深呼吸。因为我要写的东西大概长这样——

```rust
use bevy::prelude::*;

fn spawn_button(mut commands: Commands, asset_server: Res<AssetServer>) {
    commands.spawn((
        Button,
        Node {
            width: Val::Px(150.0),
            height: Val::Px(65.0),
            justify_content: JustifyContent::Center,
            align_items: AlignItems::Center,
            ..default()
        },
        BorderColor(Color::BLACK),
        BorderRadius::MAX,
        BackgroundColor(Color::srgb(0.15, 0.15, 0.15)),
    ))
    .with_children(|parent| {
        parent.spawn((
            Text::new("Ok"),
            TextFont {
                font: asset_server.load("fonts/FiraSans-Bold.ttf"),
                font_size: 33.0,
                ..default()
            },
            TextColor(Color::WHITE),
        ));
    });
}
```

数一下，不算 import 和函数签名，光是 `commands.spawn` 这一坨就有将近 20 行。而且这还是一个**啥交互都没绑**的裸按钮。如果我要再加个 `On::<Pointer<Press>>` 事件处理，行数直接奔着 30 行去。

更烦的是，这种写法我管它叫「`.spawn` 密集型」。每个组件都是命令式堆上去的，层级关系靠 `with_children` 闭包硬嵌，视觉结构全挤在一坨元组里。改个对齐方式？在一堆 `..default()` 和逗号之间找吧。想复用？ copy-paste，然后祈祷别漏改哪个 `BackgroundColor`。

别误会，Bundle 机制本身是伟大的——它让 ECS 的组件组合变得类型安全。但伟大不等于写得爽。当我第 100 次为一个弹窗写 40 行 UI 样板时，我开始怀疑人生：我到底是做游戏，还是在写 Rust 版的 XML？

<!-- TODO: 代码对比截图 — 已用下方 mock 替代 -->

```
╔════════════════════════════════════════════════════╗
║  Bundle 时代：20 行代码做一个按钮                  ║
╠════════════════════════════════════════════════════╗
║  commands.spawn((                                              ║
║      Button,                                                    ║
║      Node { width: Val::Px(150), height: Val::Px(65),          ║
║          justify_content: JustifyContent::Center,               ║
║          align_items: AlignItems::Center,                      ║
║          ..default() },                                        ║
║      BorderColor(Color::BLACK),                                ║
║      BorderRadius::MAX,                                        ║
║      BackgroundColor(Color::srgb(0.15, 0.15, 0.15)),           ║
║  ))                                                            ║
║  .with_children(|parent| {                                     ║
║      parent.spawn((                                             ║
║          Text::new("Ok"),                                        ║
║          TextFont {                                             ║
║              font: asset_server.load("fonts/FiraSans-Bold.ttf"),║
║              font_size: 33.0,                                  ║
║              ..default()                                        ║
║          },                                                    ║
║          TextColor(Color::WHITE),                               ║
║      ));                                                        ║
║  });                                                            ║
║                                                                 ║
║  // 还没加交互...还得再写一堆                                  ║
╚════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════╗
║  BSN 时代：7 行代码，且已经包含交互                        ║
╠════════════════════════════════════════════════════╗
║  bsn! {                                                        ║
║      Button                                                    ║
║      Node { width: px(150), height: px(65),                   ║
║          justify_content: Center, align_items: Center }         ║
║      BorderColor::from(Color::BLACK)                           ║
║      BorderRadius::MAX                                         ║
║      BackgroundColor(Color::srgb(0.15, 0.15, 0.15))            ║
║      Children [(Text("Ok") TextFont { font_size: 33.0 }          ║
║                  TextColor(Color::WHITE))]                      ║
║      on(|_: On<Pointer<Press>>| println!("Ok pressed!"))       ║
║  }                                                             ║
╚════════════════════════════════════════════════════╝
```

*以上为纯文本模拟，展示了从 20 行到 7 行的代码压缩对比。*

## bsn! 宏：把组件堆叠写成声明式的一句话

然后我在 main 分支翻到了 `examples/scene/bsn.rs`[^2]，看完之后只有一个感受：**这早该有了**。

同一份 "Ok" 按钮，用 BSN 的 `bsn!` 宏写出来是这样的：

```rust
fn button(label: &str) -> impl Scene {
    bsn! {
        Button
        Node { width: px(150), height: px(65), justify_content: Center, align_items: Center }
        BorderColor::from(Color::BLACK)
        BorderRadius::MAX
        BackgroundColor(Color::srgb(0.15, 0.15, 0.15))
        Children [(Text(label) TextFont { font_size: 33.0 } TextColor(Color::WHITE))]
    }
}
```

> 注：BSN 中 `TextFont` 可以省略 `font` 字段（默认字体），或使用 `FontSourceTemplate::Handle(...)` 指定具体路径。上面这个简化版本为了突出 BSN 的简洁。

7 行。而且读起来像是一份**声明式清单**：这是 Button，它长这样，里面有个 Text。没有逗号地狱，没有 `..default()` 噪音，`px(150)` 这种短 helper 也比 `Val::Px(150.0)` 干净得多。

要是再包一层带交互的：

```rust
fn ok_button() -> impl Scene {
    bsn! {
        button("Ok")
        on(|_event: On<Pointer<Press>>| println!("Ok pressed!"))
    }
}
```

`on(...)` 直接绑事件，不需要额外 `commands.entity(id).insert(...)`。整个 UI 的「长什么样」和「点了我干嘛」写在同一个视觉块里，不用在脑子里做跳转。

更爽的是复用。我可以写一个 `button()` 函数返回 `impl Scene`，然后到处 `:button("Ok")`、`:button("Cancel")` 这样继承它。这跟以前 copy-paste 20 行再改两个字段的体验，根本不在一个次元。

如果你需要一个完整的场景（比如 Camera + UI 根节点），用 `bsn_list!` 返回 `impl SceneList`：

```rust
fn scene() -> impl SceneList {
    bsn_list![Camera2d, ui()]
}

fn ui() -> impl Scene {
    bsn! {
        Node { width: percent(100), height: percent(100), justify_content: Center, align_items: Center }
        Children [
            (ok_button()),
            (bsn! { button("Cancel") BackgroundColor(Color::srgb(0.4, 0.15, 0.15)) }),
        ]
    }
}
```

注意这里 Cancel 按钮的写法：`bsn! { :button("Cancel") BackgroundColor(...) }`。这就是 BSN 的**继承 + 覆盖**语法。先展开 `button()` 里定义的所有组件，再把 `BackgroundColor` 覆写成暗红色。一行代码完成了「基于模板做微调」[^3]。

spawn 的时候也很直接：

```rust
fn setup(world: &mut World) {
    world.spawn_scene(scene());
}
```

没有 `commands.spawn`，没有 `Children!` 宏。`world.spawn_scene(...)` 接受任何 `impl Scene` 或 `impl SceneList`，把整个声明式结构拍进 World。

有一点要吐槽：bsn! 宏内部的语法不是标准 Rust，所以编辑器高亮可能会抽风。我在 Zed 里试的时候，里面有些字段名没被识别，一片灰白色。不过这是宏的宿命，等官方 LSP 跟进或者社区出 tree-sitter 补丁吧。

## SceneComponent：你的 Player 终于可以「自带装备」出厂了

BSN 的 `bsn!` 宏解决的是 UI 样板代码问题，但 0.19 还有一个更底层的架构改动——`SceneComponent`。这是 cart 在 PR #24008[^4] 里推进的东西，解决的是一个让我纠结了很久的问题：

> 我定义了一个 `Player` 组件，怎么让它一 spawn 就自动带上 `Transform`、`Mesh`、`LeftHand`、`RightHand`？

以前的做法是命令式堆叠：

```rust
commands.spawn((
    Player { score: 0 },
    Transform::default(),
    LeftHand,
    RightHand,
));
```

问题在于，**"Player 应该长什么样"这个知识，并没有住在 `Player` 自己身上**。它散落在每一个 `commands.spawn` 的调用点。如果哪天 Player 需要再加个 `Collider`，我得全局搜索所有 `spawn(Player` 然后逐个改——漏一个就 runtime 缺组件。

`#[derive(SceneComponent)]` 做的就是让组件自带一份「出厂配置」：

```rust
#[derive(SceneComponent, Default, Clone)]
struct Player {
    score: usize,
}

impl Player {
    fn scene() -> impl Scene {
        bsn! {
            Transform::default()
            Children [LeftHand, RightHand]
        }
    }
}
```

然后在 BSN 里用 `:` 继承它：

```rust
world.spawn_scene(bsn! {
    :Player { score: 0 }
});
```

`Player::scene()` 会在 spawn 时自动展开，Player 实体上照样有 `Player` 组件和 `score: 0`，同时还会自动挂上 `Transform` 和两个子实体。这就是声明式继承——你写的是「这是一个 Player」，而「Player 自带什么」由 `Player` 自己定义。

不过这里有个坑得交代清楚：如果你忘了在 `bsn!` 里写 `:Player`，只写了 `Player { score: 0 }`，那它只会 spawn 一个裸 `Player` 组件，不会自动展开 scene。PR 里提到这种情况下**会在运行时打 error log**，而不是编译期报错[^4]。cart 说 0.20 才会做 Static enforcement。所以现在还是靠自觉和测试，别手滑漏写冒号。

另外要提醒：Bevy 0.18 以前用 `Camera2dBundle`，0.19 用 `Camera2d`。BSN 示例里也是 `Camera2d`，如果你还在 0.18 的项目里，注意 Bundle 和纯组件的区别。

## 现实检查：BSN 现在能做什么、不能做什么

我看过太多教程只吹不黑，结果读者上去一跑，发现「怎么保存不了场景？」「怎么 GLTF 加载炸了？」。BSN 现在真的**不是银弹**，以下限制是官方迁移指南[^5]和 milestone 里白纸黑字写的，我逐条列出来，你自己判断能不能接受：

### ❌ 不能导出 / 序列化 World 为 BSN

旧系统的 `DynamicScene` 可以 `scene.write_to_file("foo.scn.ron")`，BSN 目前没有等效能力。旧系统也没删，只是改名叫 `bevy_world_serialization`，`Scene` 变 `WorldAsset`，`SceneRoot` 变 `WorldAssetRoot`[^5]。如果你需要保存场景到文件，继续用旧系统，它跑不掉。

### ❌ GLTF 场景加载器未移植

加载 GLTF 场景仍需 `WorldAssetRoot`（旧系统）。BSN 暂时只管你手写代码的场景，不管外部模型管线[^5]。

### ❌ `.bsn` 资产文件格式尚未实现

目前 BSN 只能写在 Rust 代码里，不能像 `.ron` 那样作为外部资产加载。0.20 milestone 已明确排期 "Implement dynamic BSN (.bsn asset format)"[^6]。也就是说，编辑器工作流、热重载、非程序员配场景——这些都要等 0.20。

### ⚠️ debug symbol 膨胀

`bsn!` 宏会生成极度嵌套的泛型闭包类型，单个 debug symbol 可达 **121KB**，场景创建函数的栈使用可达 **62KB**[^7]。cart 已经提交了优化 commit（"Reduce bsn! codegen / debug symbols"），但改善程度目前没有公开基准数据。如果你 debug build 本来就编译得慢，上了 BSN 可能会更酸爽。release 模式不受影响。

### ⚠️ 负数常量不支持

这 Bug 小到让人哭笑不得：`bsn!` 宏目前会让 rust-analyzer 对负数数字常量报错（Issue #24050）[^8]，但 rustc 本身可以编译通过。所以你不能在宏里裸写：

```rust
// rust-analyzer 会标红，但 cargo build 能过
bsn! {
    Transform { translation: Vec3::new(-1.0, 0.0, 0.0) }
}
```

workaround 是给负数加个花括号，或者先在外面定义好变量再传进去：

```rust
bsn! {
    Transform { translation: Vec3::new({-1.0}, 0.0, 0.0) }
}

// 或者
let x = -1.0;
bsn! {
    Transform { translation: Vec3::new(x, 0.0, 0.0) }
}
```

Issue #24050 还在 open，已经有 PR #24069 在修，不确定 0.19 正式版能不能带上。

---

**决策树（抄作业版）：**

- **做 UI / 2D 原型，不想写 20 行按钮** → main 分支上的 BSN 已经可以爽了。
- **需要保存场景到文件 / 加载 GLTF / 编辑器工作流** → 继续用 `bevy_world_serialization`（旧系统），等 0.20。
- **debug build 编译慢到受不了** → 等 cart 的优化进稳定版，或者只在 UI 模块局部使用 BSN。
- <strong>项目要求可序列化场景格式（如 MOD 支持）</strong> → BSN 目前做不了，别硬上。

## 从 Bundle 到 BSN：这三年的演进简史（可选阅读）

如果你好奇 BSN 是怎么突然冒出来的，这里快速串一下时间线。这不是考试重点，只是我个人觉得 cart 在下一盘大棋。

| 阶段 | 版本 | 关键机制 | 解决了什么 |
|------|------|----------|-----------|
| Bundle 时代 | 0.1–0.14 | `#[derive(Bundle)]` + `commands.spawn(MyBundle)` | 类型安全的组件组合，但样板代码爆炸 |
| Required Components | 0.15 | `#[require(Node, UiImage)] struct Button;` | 组件自描述依赖，spawn `Button` 自动带 `Node`[^3] |
| BSN 子集落地 | 0.19 | `bsn!` / `bsn_list!` + `SceneComponent` | 声明式语法 + 层级 + 继承覆盖 |
| 完整 BSN | 0.20（计划）| `.bsn` 资产格式 + BSN writer + 静态检查 | 外部文件、编辑器管线、编译期安全 |

可以看到，BSN 不是从石头里蹦出来的。0.15 的 Required Components 已经在解决「组件依赖声明」的问题，BSN 只是把这件事从「命令式 API」推进到了「声明式语法层」。

社区也在跟。Bevy Feathers（官方 UI widget 工具集）在 0.17 发布时就说 "We will port Feathers to BSN when that lands"，后来确实通过 PR #23536 完成了移植[^9]。甚至第三方还有个叫 `i-cant-believe-its-not-bsn` 的库（Leafwing-Studios 出品），看名字就知道社区等官方 BSN 等得有多苦[^10]。

cart 在 Discussion #14437[^3] 里把这套东西归纳为四大支柱：

1. Required Components（已在 0.15 落地）
2. Construct / GetTemplate Trait（需要 World 上下文才能构造的组件）
3. Scenes and Patches（格式无关的场景补丁系统）
4. **BSN**（人体工学的声明式语法）

BSN 只是最后一块拼图的**语法层**。理解这一点，你就不会抱怨「为什么 BSN 还不能保存文件」——文件格式是第 3 支柱的事，语法是第 4 支柱的事，它们本就不会同时到。

## 我的结论：什么时候该切 BSN？

不给绝对答案，只说我自己的情况。

我现在在 main 分支开新原型，BSN 已经是我写 UI 的默认方式。原因很庸俗：**我只是烦写 20 行代码做一个按钮**。`bsn!` 让我把视觉结构、交互事件、复用逻辑都写在同一个地方，脑子不用在「命令式代码」和「声明式意图」之间来回翻译。

但我的正式项目还在 0.18，没切。因为那个项目需要 GLTF 加载和场景保存，BSN 0.19 子集满足不了。我不急，反正旧系统改名叫 `bevy_world_serialization` 了，API 没变，稳得很。

所以我的建议是：

- **纯 UI / 2D 原型、个人 jam 项目** → 上 main，BSN 已经可以爽了。
- **需要编辑器、资产管线、MOD 支持、GLTF 加载** → 等 0.20，或者旧系统继续用着。
- **已经在 0.18 且对 Bundle 还能忍** → 没必要为了 BSN 硬升级，Required Components 已经解决了一半痛点。

最后一句：反正 `bevy_world_serialization` 跑不掉，先用着不亏。等 0.20 的 `.bsn` 格式和编辑器基础设施[^11]到了，再慢慢迁也不迟。

---

## 参考来源

[^1]: Bevy 0.19 Milestone #40, GitHub. https://github.com/bevyengine/bevy/milestone/40
[^2]: BSN 官方示例 `bsn.rs`, Bevy Engine. https://github.com/bevyengine/bevy/blob/main/examples/scene/bsn.rs
[^3]: Next Generation Scene/UI System (Discussion #14437), Bevy Engine. https://github.com/bevyengine/bevy/discussions/14437
[^4]: PR #24008 Scene Components, Bevy Engine. https://github.com/bevyengine/bevy/pull/24008
[^5]: Bevy 0.19 Migration Guide — Scene Rename, Bevy Engine. https://github.com/bevyengine/bevy/blob/main/_release-content/migration-guides/bevy_scene_rename.md
[^6]: Bevy 0.20 Milestone #43, GitHub. https://github.com/bevyengine/bevy/milestone/43
[^7]: BSN 代码生成与 debug symbol 讨论 (Discussion #24021), Bevy Engine. https://github.com/bevyengine/bevy/discussions/24021
[^8]: BSN macro 不支持负数常量 (Issue #24050), Bevy Engine. https://github.com/bevyengine/bevy/issues/24050
[^9]: Bevy 0.17 发布公告, bevy.org. https://bevy.org/news/bevy-0-17/
[^10]: Bevy 模板系统演进研究报告, 用户 wiki. `~/wiki/raw/bevy-template-evolution.md`
[^11]: BSN editor infrastructure (Issue #23637), Bevy Engine. https://github.com/bevyengine/bevy/issues/23637

---

## 待补截图清单（TODO）

| 序号 | 位置 | 类型 | 说明 | 状态 |
|------|------|------|------|------|
| 1 | 文章顶部 | AI 生成封面图 | FAL flux-pro/v1.1-ultra 生成，2752×1536，已存为 `assets/blog-images/bsn-cover.png` | ✅ 已补 |
| 2 | H2「我的 Bundle 恶梦」与 H2「bsn! 宏」之间 | 代码对比截图 | 纯文本 mock：上下分屏对比 Bundle 20 行 vs BSN 7 行，窗框样式代码块 | ✅ 已补 |
