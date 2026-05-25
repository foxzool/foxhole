---
Status: 🟩
tags:
  - output/blog
Links:
  - "[[Bevy MOC]]"
Created: 2026-05-01
BevyVersion:
  - "0.18"
share: true
Collection: "[[黄金矿工]]"
title: Bevy 复刻黄金矿工｜Stage 3：完整体验
digest: Stage 3 补齐音频、存档、画面流转、UI 主题和商店系统，让黄金矿工从能玩变成完整游戏。
cover: https://assets.zool.me/2026/05/b488e59193fe7d89257e18cab307c8b5.png
Finished: 2026-05-01
---
![image.png](https://assets.zool.me/2026/05/b488e59193fe7d89257e18cab307c8b5.png)

## 一、音频系统

### 1.1 资源加载与分类

`audio.rs` 定义了 `AudioAssets`，`FromWorld` 里一次性加载所有音频文件。按用途分成两类：音效（`SoundEffect`）和音乐（`Music`）。

```rust
/// src/audio.rs
#[derive(Resource, Asset, Clone, Reflect)]
pub struct AudioAssets {
    #[dependency]
    money: Handle<AudioSource>,
    #[dependency]
    hook_reset: Handle<AudioSource>,
    #[dependency]
    grab_start: Handle<AudioSource>,
    #[dependency]
    grab_back: Handle<AudioSource>,
    #[dependency]
    explosive: Handle<AudioSource>,
    #[dependency]
    high: Handle<AudioSource>,
    #[dependency]
    normal: Handle<AudioSource>,
    #[dependency]
    low: Handle<AudioSource>,

    #[dependency]
    goal_music: Handle<AudioSource>,
    #[dependency]
    made_goal_music: Handle<AudioSource>,
}
```

`#[dependency]` 让 Bevy 的资产系统知道这些 `Handle` 是依赖项，`asset_tracking.rs` 里的 `ResourceHandles` 会等全部加载完才继续。

`music()` 和 `sound_effect()` 两个 builder 函数分别返回带 `PlaybackSettings::LOOP` 和 `PlaybackSettings::DESPAWN` 的 bundle。后者播放完自动销毁实体，省得手动清理。

```rust
/// src/audio.rs
pub fn music(handle: Handle<AudioSource>) -> impl Bundle {
    (AudioPlayer(handle), PlaybackSettings::LOOP, Music)
}

pub fn sound_effect(handle: Handle<AudioSource>) -> impl Bundle {
    (AudioPlayer(handle), PlaybackSettings::DESPAWN, SoundEffect)
}
```

`get_audio()` 用字符串 id 匹配，方便在 hook 逻辑里按实体类型选音效。

### 1.2 音效触发点

hook.rs 里在几个关键时机 `spawn(sound_effect(audio))`：

- 发射钩子 -> `GrabStart`
- 钩子碰到东西开始回缩 -> `GrabBack`
- 奖励结算 -> 按 `bonus_type` 字段播 `High` / `Normal` / `Low`
- 空钩子回位 -> `HookReset`
- 炸药引爆 -> `Explosive`

```rust
/// src/demo/hook.rs
if fire && !hook.is_grabing && !hook.is_backing && !hook.is_showing_bonus {
    hook.is_grabing = true;
    if let Some(audio) = audio_assets.get_audio("GrabStart") {
        commands.spawn(sound_effect(audio));
    }
}
```

结算时根据 `EntityDescriptor.bonus_type` 决定音效。原版里没有这个字段，我加的，用来区分钻石、大金块和普通石头 grab 时的不同反馈。

### 1.3 过渡音乐

关卡间切换（`NextGoal`、`MadeGoal`）需要播一段短音乐，等音乐放完再切画面。

![image.png](https://assets.zool.me/2026/05/1ff4f6a259ab8a34cddff46943f6ad29.png)

`TransitionMusic` 和 `TransitionMusicStatus` 就是干这个的。

```rust
/// src/audio.rs
#[derive(Resource, Reflect, Clone, Copy, PartialEq, Eq, Default)]
pub enum TransitionMusicStatus {
    #[default]
    Idle,
    WaitingForSink,
    Playing,
    Finished,
}
```

`play_transition_music()`  spawning 一个带 `TransitionMusic` 标记的实体。`dedupe_transition_music()` 保证同时只有一个过渡音乐在跑。`sync_transition_music_status()` 每帧查 `AudioSink`，把状态从 `WaitingForSink` -> `Playing` -> `Finished` 推进。

```rust
/// src/screens/next_goal.rs
fn check_transition(
    transition_music: Res<TransitionMusicStatus>,
    mut next_screen: ResMut<NextState<Screen>>,
) {
    if transition_music.is_finished() {
        next_screen.set(Screen::Gameplay);
    }
}
```

`NextGoal` 还设了一个 5 秒备用定时器，防止音乐加载失败导致卡死。

---

## 二、存档系统

### 2.1 数据结构

`persistent.rs` 只存两项：最高分和最高关卡。结构简单，不需要复杂序列化。

```rust
/// src/screens/persistent.rs
#[derive(Resource, Debug, Clone, Serialize, Deserialize, Default)]
pub struct PersistentData {
    pub high_score: u32,
    pub high_level: u32,
}
```

### 2.2 读写逻辑

`load()` 读 `savedata.txt`，`serde_json` 反序列化。文件不存在或解析失败就返回 default。

```rust
/// src/screens/persistent.rs
pub fn load() -> Self {
    let path = Path::new(SAVE_FILE);
    if path.exists() {
        match fs::read_to_string(path) {
            Ok(content) => match serde_json::from_str::<PersistentData>(&content) {
                Ok(data) => return data,
                Err(e) => warn!("Failed to deserialize savedata.txt: {}", e),
            },
            Err(e) => warn!("Failed to read savedata.txt: {}", e),
        }
    }
    Self::default()
}
```

`save()` 用 `to_string_pretty()` 写回文件。`reset()` 删文件并返回 default。

`screens/mod.rs` 在 `Startup` 时调用 `load_persistent_data()`，把存档注入成 `Resource`。`GameOver` 画面按任意键时，如果当前分数超过存档里的最高分，就更新并 `save()`，然后切到 `NewHighScore` 画面。

---

## 三、画面流转

### 3.1 Screen 状态机

`Screen` 枚举定义了全部顶级画面。游戏流程是：

`Splash` -> `Title` -> `Loading` -> `NextGoal` -> `Gameplay` -> `MadeGoal` / `GameOver` -> `Shop` -> `NextGoal` -> ...

```rust
/// src/screens/mod.rs
#[derive(States, Copy, Clone, Eq, PartialEq, Hash, Debug, Default)]
pub enum Screen {
    #[default]
    Splash,
    Title,
    Loading,
    NextGoal,
    Gameplay,
    MadeGoal,
    Shop,
    GameOver,
    NewHighScore,
}
```

- `Splash`：1.8 秒渐显 logo，按 Escape 可跳过。
- `Title`：主菜单背景，同时激活 `Menu::Main` 子状态。
- `Loading`：等资源加载完自动进 `Gameplay`。如果资源已缓存（`resource_handles.is_all_done()`），`Title` 画面按 Start 直接跳 `NextGoal`，不会看到 Loading。
- `NextGoal`：显示下一关目标金额，过渡音乐放完自动进 `Gameplay`。
- `Gameplay`：核心玩法，计时器跑完根据是否达标切 `MadeGoal` 或 `GameOver`。
- `MadeGoal`：显示过关文字，音乐放完进 `Shop`。
- `Shop`：购买道具，按 Space 或选完商品后进 `NextGoal`。
- `GameOver`：按任意键，刷新最高分则进 `NewHighScore`，否则回 `Title`。
- `NewHighScore`：显示新纪录，按任意键回 `Title`。

### 3.2 Menu 子状态

标题画面需要菜单，但菜单和 Screen 是独立的状态机。`Menu` 枚举只有 `None`、`Main`、`HighScore` 三个状态。

```rust
/// src/menus/mod.rs
#[derive(States, Copy, Clone, Eq, PartialEq, Hash, Debug, Default)]
pub enum Menu {
    #[default]
    None,
    Main,
    HighScore,
}
```

`Title` 进入时切到 `Menu::Main`，退出时切回 `Menu::None`。`MenuSelect` 是菜单内的选项状态（StartGame / HighScore），控制箭头位置和确认行为。

```rust
/// src/menus/main.rs
fn keyboard_input(
    current_item: Res<State<MenuSelect>>,
    mut next_screen: ResMut<NextState<Screen>>,
    resource_handles: Res<ResourceHandles>,
) {
    if confirm {
        if current_item.get() == &MenuSelect::StartGame {
            if resource_handles.is_all_done() {
                next_screen.set(Screen::NextGoal);
            } else {
                next_screen.set(Screen::Loading);
            }
        } else {
            next_menu.set(Menu::HighScore)
        }
    }
}
```

### 3.3 生命周期与清理

每个 screen 模块导出 `plugin(app: &mut App)`，在 `OnEnter(Screen::X)` 时 spawning UI 实体，在 `Update` 里处理输入和逻辑。所有 UI 实体都带 `DespawnOnExit(Screen::X)`，Bevy 自动在状态退出时销毁。

```rust
/// src/screens/shop.rs
commands.spawn((
    Name::new("Shop Background"),
    Sprite::from_image(image_assets.get_image("Shop").unwrap()),
    Transform::from_translation(Vec3::new(0.0, 0.0, -1.0)),
    DespawnOnExit(Screen::Shop),
));
```

`Gameplay` 退出时还会调用 `reset_level_effects()`，把 `PlayerResource` 的关卡临时 buff 清掉（力量饮料、幸运草等只在下一关生效，不持久）。

---

## 四、UI 主题与商店

### 4.1 主题组件

`theme/` 模块抽了一套通用 UI 构建函数。`widget.rs` 提供 `ui_root()`、`header()`、`label()`、`button()`，返回 `impl Bundle`。

```rust
/// src/theme/widget.rs
pub fn ui_root(name: impl Into<Cow<'static, str>>) -> impl Bundle {
    (
        Name::new(name),
        Node {
            position_type: PositionType::Absolute,
            width: percent(100),
            height: percent(100),
            align_items: AlignItems::Center,
            justify_content: JustifyContent::Center,
            flex_direction: FlexDirection::Column,
            row_gap: px(20),
            ..default()
        },
        Pickable::IGNORE,
    )
}
```

`interaction.rs` 提供 `InteractionPalette`，自动处理按钮悬停和点击时的颜色变化，不用在每个按钮上写系统。

`palette.rs` 定义了所有颜色常量。`screens/` 和 `menus/` 里不许硬编码颜色，必须用 palette 里的值。这条规则主要靠自觉，clippy 管不了。

### 4.2 商店逻辑
![image.png](https://assets.zool.me/2026/05/6ea77ab919eb8e70dc745555cb1c99d2.png)

`shop.rs` 实现了原版商店。5 种道具：

| 道具 | 效果 |
|---|---|
| Dynamite | 炸药数量 +1，上限 12 |
| StrengthDrink | 下一关拉取速度 ×1.5 |
| LuckyClover | 神秘袋触发特殊效果概率翻倍 |
| RockCollectorsBook | 岩石价值 ×3 |
| GemPolish | 钻石价值 ×1.5 |

每关开始前有 66% 概率随机出现 1-5 种道具，价格随关卡浮动。`PropType::get_price()` 用 `rand::thread_rng().gen_range()` 生成随机区间。

```rust
/// src/screens/shop.rs
fn get_price(&self, level: u32) -> u32 {
    let mut rng = rand::thread_rng();
    match self {
        PropType::Dynamite => rng.gen_range(1..=300) + 1 + level * 2,
        PropType::StrengthDrink => rng.gen_range(100..=400),
        // ...
    }
}
```

购买后道具效果写入 `PlayerResource`。力量饮料、幸运草等是单次关卡 buff，在 `OnExit(Screen::Gameplay)` 时 `reset_level_effects()` 清空。炸药数量跨关卡保留。

商店 UI 用 `Text2d` + `Sprite` 拼的，不是 Bevy UI 节点。因为原版商店是像素风格画面，用 2D sprite 更对齐视觉。选择器位置通过更新 `Transform` 实现。

---

## 五、HUD 与关卡循环

### 5.1 游戏内 HUD

`level.rs` 的 `setup_ui()` 在 `OnEnter(Screen::Gameplay)` 时 spawning HUD 元素：金钱、目标、时间、关卡、炸药图标。都用 `Text2d` + `TextSpan` 子节点实现。

```rust
/// src/demo/level.rs
commands
    .spawn((
        DespawnOnExit(Screen::Gameplay),
        Text2d::new("Money"),
        game_style.clone(),
        TextColor(COLOR_DEEP_ORANGE),
        Transform::from_translation(love_to_bevy_coords(5.0, 5.0).extend(10.0)),
        Anchor::TOP_LEFT,
    ))
    .with_children(|parent| {
        parent.spawn((
            TextSpan::new(format!(" ${}", stats.money_view)),
            game_style.clone(),
            TextColor(COLOR_GREEN),
            MoneyText,
        ));
    });
```

`money_view` 是显示值，`money` 是实际值。`animate_money_view()` 每帧把显示值向实际值逼近，速度 150/秒，做出金币滚动效果。

炸药图标按 `PlayerResource.dynamite_count` 显示/隐藏。12 个位置硬编码在数组里，超出就不显示。

### 5.2 关卡背景切换

`spawn_background()` 根据 `real_level_str` 解析关卡编号，映射到 5 种背景：

```rust
/// src/demo/level.rs
let bg_type = match level_num {
    1..=2 => "LevelA",
    3..=4 => "LevelB",
    5..=6 => "LevelC",
    7..=8 => "LevelD",
    _ => "LevelE",
};
```

前 3 关正常递增，之后在 3-9 之间循环，每个编号配 3 个变体（`_1`、`_2`、`_3`），所以关卡配置总体是无限的。

### 5.3 目标金额计算

`LevelStats::update_goal()` 实现原版目标公式：

```rust
/// src/screens/stats.rs
pub fn update_goal(&mut self) {
    if self.level > 1 && self.level <= 9 {
        self.goal_addon += 270;
    }
    self.goal += self.goal_addon;
}
```

第 1 关目标 650，之后每关增加 270，第 10 关起增量固定。`reach_goal()` 比较简单，就是 `money >= goal`。

---

Stage 3 完成的内容：

- 音频系统：8 个音效 + 2 首过渡音乐，按事件触发
- 存档系统：JSON 存 `savedata.txt`，最高分/最高关卡持久化
- 画面流转：9 个 Screen 状态 + 3 个 Menu 子状态，完整生命周期
- UI 主题：`widget.rs` + `InteractionPalette` + `palette.rs`
- 商店系统：5 种道具，随机价格和出现概率
- HUD：金币滚动动画、炸药图标、目标/时间/关卡显示
- 关卡循环：无限关卡，背景切换，目标金额递增

Stage 3 搞定。至此黄金矿工复刻的三个核心阶段全部完成：Stage 1 搭骨架，Stage 2 能玩，Stage 3 补齐完整的游戏体验。

如果将来有兴致，还可以继续扩展——补全实体类型、美化高分榜、发布 WASM 版本。但作为学习项目，到这里已经很完整了。
