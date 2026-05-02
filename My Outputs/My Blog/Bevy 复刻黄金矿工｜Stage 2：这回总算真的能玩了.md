---
Status: 🟩
tags:
  - output/blog
Links:
  - "[[Bevy MOC]]"
Created: 2025-11-21T15:51:03
BevyVersion:
  - "0.18"
share: true
Collection: "[[黄金矿工]]"
title: Bevy 复刻黄金矿工｜Stage 2：这回总算真的能玩了
digest: Stage 2 让黄金矿工真正能玩：钩子系统、碰撞抓取、地鼠 AI、TNT 爆炸、FX 特效、YAML 配关卡与商店，支持键鼠手柄。
cover: https://v3b.fal.media/files/b/0a986cb2/TfCpXYGzym0-qTyDKf-YO_cef9a1c56d1145eba0a6029623cebc41.jpg
---
Stage 1 搭了个「壳」——菜单、坐标系、工程结构那些基础设施。Stage 2 就干一件事：让游戏真正能玩。

钩子摆动、发射、抓取、回缩，YAML 配关卡，碰撞检测，地鼠 AI，TNT 爆炸链，FX 特效，商店系统，键盘+手柄支持。代码为主，主要给自己备查。

---

## 一、游戏场景

![image.png](https://assets.zool.me/2026/04/eac4d063da7f3379edf4ae3f253857ba.png)

### 1.1 背景

背景分两层：`bg_top.png`（顶部通用 UI 区域）和 `bg_level_[A-E].png`（关卡主体）。根据关卡号动态选择：

```rust
/// src/demo/level.rs
pub fn spawn_background(
    mut commands: Commands,
    image_assets: Res<ImageAssets>,
    stats: Res<crate::screens::stats::LevelStats>,
) {
    let level_num: u32 = stats.real_level_str.chars().skip(1)
        .take_while(|c| c.is_ascii_digit()).collect::<String>().parse().unwrap_or(1);

    let bg_type = match level_num {
        1..=2 => "LevelA",
        3..=4 => "LevelB",
        5..=6 => "LevelC",
        7..=8 => "LevelD",
        _ => "LevelE",
    };

    commands.spawn((
        Name::new("LevelBackground"),
        Transform::default(),
        Visibility::default(),
        DespawnOnExit(Screen::Gameplay),
        children![bg_top(&image_assets), bg_level(&image_assets, bg_type),],
    ));
}
```

5 种背景对应不同地质层，关卡越往后地下风格越重。

背景图片锚点统一用 `TOP_LEFT`，跟 Love2D 原版保持一致的左上角坐标系，省得换算。

### 1.2 矿工和钩子

矿工用的 `miner_sheet.png`，8 帧横排，每帧 32×40：

```rust
/// src/demo/player.rs
let layout = TextureAtlasLayout::from_grid(UVec2::new(32, 40), 8, 1, None, None);

commands.spawn((
    Name::new("Player"),
    PlayerMarker,
    player_animation,
    Sprite::from_atlas_image(
        player_assets.miner.clone(),
        TextureAtlas { layout: texture_atlas_layout, index: 0 },
    ),
    Transform::from_translation(love_to_bevy_coords(165.0, 39.0).extend(0.0)),
    Anchor::BOTTOM_CENTER,
));
```

矿工动画拆成 5 个状态：

| 状态 | 帧范围 | 说明 |
|------|--------|------|
| `Idle` | 帧 0 | 待机 |
| `Grab` | 帧 2 | 抓取中 |
| `GrabBack` | 帧 0,1,2 循环 | 回收中 |
| `UseDynamite` | 帧 3,4,5 循环 | 使用炸药 |
| `Strengthen` | 帧 6,7,6,7 循环 | 力量增强 |

钩子结构：

```rust
/// src/demo/hook.rs
#[derive(Component)]
pub struct Hook {
    pub length: f32,           // 钩子伸出长度
    pub angle: f32,            // 当前角度
    pub rotate_right: bool,    // 旋转方向
    pub is_grabbing: bool,      // 是否正在伸出抓取
    pub is_backing: bool,      // 是否正在回缩
    pub is_showing_bonus: bool, // 是否显示奖励
    pub grabed_entity: Option<Entity>, // 抓取的实体
    pub bonus_timer: f32,      // 奖励显示计时器
    pub strength_timer: f32,   // 力量图标显示计时器
    pub current_bonus: i32,    // 当前奖励金额
    pub show_strength: bool,   // 是否显示力量增强图标
}
```

关键常量：

```rust
const HOOK_MIN_ANGLE: f32 = -75.0;    // 最小角度
const HOOK_MAX_ANGLE: f32 = 75.0;     // 最大角度
const HOOK_ROTATE_SPEED: f32 = 65.0;  // 旋转速度（度/秒）
const HOOK_MAX_LENGTH: f32 = 230.0;   // 最大伸出长度
const HOOK_GRAB_SPEED: f32 = 100.0;   // 抓取速度（像素/秒）
const HOOK_COLLISION_RADIUS: f32 = 6.0; // 碰撞半径
const HOOK_COLLISION_OFFSET: f32 = 13.0; // 碰撞圆心偏移
```

钩子图片锚点设 `TOP_CENTER`，旋转时绕顶部中心点转。

---

## 二、关卡配置

Stage 1 关卡数据硬编码在 Rust 里，Stage 2 全抽成 YAML，改数值不用动代码。

### 2.1 YAML 结构

```yaml
# assets/config/entities.yaml
MiniGold:
    type: Basic
    mass: 2
    bonus: 50
    bonusType: Normal

BigGold:
    type: Basic
    mass: 7
    bonus: 500
    bonusType: High

Diamond:
    type: Basic
    mass: 1.5
    bonus: 600
    bonusType: High

Mole:
    type: MoveAround
    mass: 1.5
    bonus: 2
    speed: 1
    moveRange: 135
    bonusType: Low

QuestionBag:
    type: RandomEffect
    randomMassMin: 1
    randomMassMax: 9
    bonusBase: 50
    randomBonusRatioMin: 1
    randomBonusRatioMax: 16
    extraEffectChances: 0.2

TNT:
    type: Explosive
    destroyedType: TNT_Destroyed
    isDestroyedTiny: true
    mass: 1
    bonus: 2
    bonusType: Low
```

```yaml
# assets/config/levels.yaml
LDEBUG:
    type: LevelA
    entities:
        - type: MiniGold
          pos: {x: 80, y: 80}
        - type: NormalGold
          pos: {x: 105, y: 150}
        - type: Mole
          pos: {x: 200, y: 150}
          dir: Left
```

实体分四种，`Basic`、`MoveAround`、`RandomEffect`、`Explosive`，看名字就懂干嘛的。

### 2.2 Rust 反序列化

```rust
/// src/config.rs
#[derive(Debug, Clone, Serialize, Deserialize, bevy::asset::Asset, bevy::reflect::TypePath)]
pub struct EntitiesConfig {
    #[serde(flatten)]
    pub entities: HashMap<String, EntityDescriptor>,
}

#[derive(Debug, Clone, Serialize, Deserialize, bevy::asset::Asset, bevy::reflect::TypePath)]
pub struct LevelsConfig {
    #[serde(flatten)]
    pub levels: HashMap<String, LevelDescriptor>,
}

#[derive(Debug, Clone, Component, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EntityDescriptor {
    #[serde(rename = "type")]
    pub entity_type: EntityType,
    pub mass: Option<f32>,
    pub bonus: Option<i32>,
    pub bonus_type: Option<String>,
    pub speed: Option<f32>,
    pub move_range: Option<f32>,
    pub extra_effect_chances: Option<f32>,
    pub collision_radius: Option<f32>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum EntityType {
    Basic,
    RandomEffect,
    MoveAround,
    Explosive,
}
```

实际代码里这个描述符还挂了 `random_mass_min`、`random_mass_max`、`bonus_base`、`random_bonus_ratio_min`、`random_bonus_ratio_max`、`destroyed_type`、`is_destroyed_tiny` 这些字段，QuestionBag 和 TNT 都走同一个结构。

### 2.3 加载 YAML

用 `bevy_common_assets` 直接读：

```rust
/// Cargo.toml
bevy_common_assets = { version = "0.15", features = ["yaml"]}

/// src/config.rs
app.add_plugins((
    YamlAssetPlugin::<LevelsConfig>::new(&["config/levels.yaml"]),
    YamlAssetPlugin::<EntitiesConfig>::new(&["config/entities.yaml"])
));
```

以后调数值改 YAML 就行，不用碰 Rust。

---

## 三、碰撞检测

### 3.1 钩子碰撞判定

钩子用圆形判定，碰撞圆心在钩子末端再偏一段距离：

```rust
/// src/demo/hook.rs
fn update_hook(/* ... */) {
    let collision_pos = base_pos + dir * (hook.length + HOOK_COLLISION_OFFSET);

    for (entity, entity_transform) in q_entities.iter() {
        let entity_pos = entity_transform.translation().truncate();
        let entity_radius = descriptor.collision_radius.unwrap_or(HOOK_COLLISION_RADIUS);

        if collision_pos.distance(entity_pos) < (HOOK_COLLISION_RADIUS + entity_radius) {
            hook.grabed_entity = Some(entity);

            let is_tiny = descriptor.mass.unwrap_or(1.0) < 2.0;
            if let Some(atlas) = &mut sprite.texture_atlas {
                atlas.index = if is_tiny { HOOK_ANIM_GRAB_MINI } else { HOOK_ANIM_GRAB_NORMAL };
            }
            break;
        }
    }
}
```

两圆心距离 < 半径之和，就算命中。

### 3.2 拉回速度

拉回速度按质量算：

```rust
/// src/demo/hook.rs
let mut speed = HOOK_GRAB_SPEED;
if let Some(entity) = hook.grabed_entity
    && let Ok(descriptor) = q_descriptors.get(entity)
{
    let mut mass = descriptor.mass.unwrap_or(1.0);

    // 力量饮料效果：质量 ÷ 1.5
    if player.has_strength_drink {
        mass /= 1.5;
    }

    let strength = player.strength as f32;
    speed = HOOK_GRAB_SPEED * strength / mass;
}

hook.length -= time.delta_secs() * speed;
```

质量越大，拉得越慢。大的值钱但拉起来慢；小的轻快但难勾。力量饮料一开，整体舒服不少。

---

## 四、实体系统

### 4.1 实体动画

可移动实体（地鼠）有 Idle 和 Move 两套帧：

```rust
/// src/demo/entity.rs
#[derive(Component)]
pub struct EntityAnimation {
    pub timer: Timer,
    pub current_frame: usize,
    pub state: EntityAnimationState,
    pub idle_frames: Vec<usize>,
    pub move_frames: Vec<usize>,
}

impl EntityAnimation {
    pub fn new(frame_duration: f32, idle_frames: Vec<usize>, move_frames: Vec<usize>) -> Self {
        Self {
            timer: Timer::from_seconds(frame_duration, TimerMode::Repeating),
            current_frame: 0,
            state: EntityAnimationState::Move,
            idle_frames,
            move_frames,
        }
    }
}
```

### 4.2 地鼠巡逻

地鼠在范围内左右走，走一段停一下：

```rust
/// src/demo/entity.rs
#[derive(Component)]
pub struct PatrolState {
    pub is_moving: bool,
    pub direction: f32,       // 1.0 向右，-1.0 向左
    pub destination_x: f32,
    pub idle_timer: Timer,
    pub move_range: f32,
}

fn patrol_movement_system(/* ... */) {
    if state.is_moving {
        let speed = descriptor.speed.unwrap_or(1.0) * 60.0;
        let delta = speed * state.direction * time.delta_secs();
        transform.translation.x += delta;

        let reached = if state.direction > 0.0 {
            transform.translation.x >= state.destination_x
        } else {
            transform.translation.x <= state.destination_x
        };

        if reached {
            state.is_moving = false;
            state.idle_timer.reset();
            state.direction *= -1.0;
        }
    } else {
        state.idle_timer.tick(time.delta());
        if state.idle_timer.is_finished() {
            state.is_moving = true;
        }
    }
}
```

到边界就停，停完掉头再走。逻辑简单，但地鼠不再像贴图平移。

### 4.3 生成时按类型挂载组件

```rust
/// src/demo/level.rs
fn spawn_entity_sprite(/* ... */) {
    if entity_desc.entity_type == EntityType::MoveAround {
        let layout = TextureAtlasLayout::from_grid(UVec2::new(18, 13), 7, 1, None, None);
        commands.entity(entity).insert((
            EntityAnimation::new(0.15, vec![0], vec![0, 1, 2, 3, 4, 5, 6]),
        ));
    } else if entity_desc.entity_type == EntityType::Explosive {
        commands.entity(entity).insert(ExplosiveState::default());
    } else {
        commands.entity(entity).insert(Sprite::from_image(img_handle));
    }
}
```

---

## 五、FX 特效系统

### 5.1 通用组件

FX 没按效果拆组件，直接搓了个通用的：

```rust
/// src/demo/fx.rs
#[derive(Component, Clone, Debug)]
pub struct FXAnimation {
    timer: Timer,
    frame_count: usize,
    current_frame: usize,
    playback: FXPlayback,
    placement: FXPlacement,
    z_layer: f32,
}

impl FXAnimation {
    pub fn new(
        frame_count: usize,
        frame_duration: f32,
        playback: FXPlayback,
        placement: FXPlacement,
    ) -> Self {
        // ...
    }

    pub fn with_z_layer(mut self, z_layer: f32) -> Self {
        self.z_layer = z_layer;
        self
    }
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum FXPlayback {
    Loop,  // 循环播放
    Once,  // 播放一次后销毁
}

#[derive(Clone, Copy, Debug)]
pub enum FXPlacement {
    Fixed(Vec2),                          // 固定位置
    Follow { entity: Entity, offset: Vec2 }, // 跟随实体
}
```

`Loop` + `Follow` 拿来做大金砖闪光，`Once` + `Fixed` 拿来做爆炸。一个组件覆盖两种需求，后面不用东补一块西补一块。

### 5.2 大金砖闪光

钩到 BigGold 时挂个循环闪光：

```rust
/// src/demo/hook.rs
if entity_id == "BigGold"
    && let Some(fx_image) = image_assets.get_image("BigGoldFX")
{
    let layout = TextureAtlasLayout::from_grid(UVec2::new(16, 16), 3, 3, None, None);
    let atlas_layout = texture_atlas_layouts.add(layout);

    commands.spawn((
        Name::new("BigGoldSparkle"),
        FXAnimation::new(
            9, 0.2,
            FXPlayback::Loop,
            FXPlacement::Follow { entity, offset: Vec2::ZERO },
        ),
        Sprite::from_atlas_image(fx_image, TextureAtlas { layout: atlas_layout, index: 0 }),
        Anchor::CENTER,
        DespawnOnExit(Screen::Gameplay),
    ));
}
```

金砖被拖回来时，闪光跟着跑。

### 5.3 爆炸特效

两种规格：

| 特效 | 帧尺寸 | 帧数 | 用途 |
|------|--------|------|------|
| 标准爆炸 | 16×16 | 12 帧 | 炸药销毁 |
| 大型爆炸 | 35×35 | 8 帧 | TNT 连锁爆炸 |

```rust
/// src/demo/explosive.rs
pub fn spawn_standard_explosion_fx(
    commands: &mut Commands,
    image_assets: &ImageAssets,
    texture_atlas_layouts: &mut Assets<TextureAtlasLayout>,
    center: Vec2,
) {
    if let Some(fx_image) = image_assets.get_image("ExplosiveFX") {
        let layout = TextureAtlasLayout::from_grid(UVec2::new(16, 16), 4, 3, None, None);
        let atlas_layout = texture_atlas_layouts.add(layout);

        commands.spawn((
            Name::new("StandardExplosionFX"),
            FXAnimation::new(12, 0.2, FXPlayback::Once, FXPlacement::Fixed(center)),
            Sprite::from_atlas_image(fx_image, TextureAtlas { layout: atlas_layout, index: 0 }),
            Transform::from_translation(center.extend(10.0)),
            Anchor::CENTER,
            DespawnOnExit(Screen::Gameplay),
        ));
    }
}
```

---

## 六、TNT 爆炸

### 6.1 爆炸状态

钩到 TNT 就炸，状态很简单：

```rust
/// src/demo/explosive.rs
const EXPLOSION_RADIUS: f32 = 35.0 / 2.0;

#[derive(Component, Default)]
pub struct ExplosiveState {
    pub is_exploding: bool,
    pub damage_dealt: bool,
    pub cleanup_timer: Option<Timer>,  // 爆炸后延迟清理
}

#[derive(Component)]
pub struct ExplosionFX {
    pub center: Vec2,
}
```

### 6.2 连锁反应

TNT 会引爆旁边的 TNT：

```rust
/// src/demo/explosive.rs
fn explosion_damage_system(/* ... */) {
    let explosion_centers: Vec<Vec2> = q_fx.iter().map(|fx| fx.center).collect();

    // 销毁范围内的普通实体
    for (entity, transform, descriptor) in q_entities.iter() {
        let entity_pos = transform.translation().truncate();
        let entity_radius = descriptor.collision_radius.unwrap_or(6.0);

        for center in &explosion_centers {
            if center.distance(entity_pos) < (EXPLOSION_RADIUS + entity_radius) {
                commands.entity(entity).despawn();
                break;
            }
        }
    }

    // 连锁反应：引爆范围内的其他 TNT
    for (entity, mut state, transform, _) in q_explosives.iter_mut() {
        if state.is_exploding { continue; }

        let entity_pos = transform.translation().truncate();
        for center in &explosion_centers {
            if center.distance(entity_pos) < (EXPLOSION_RADIUS + 6.0) {
                state.is_exploding = true;
                break;
            }
        }
    }
}
```

链式反应逐帧传播——这帧 A 爆了下帧 B 爆，TNT 一排排炸过去。

### 6.3 收尾清理

爆炸播完也不是立刻删，还得检查钩子是不是还挂着它：

```rust
/// src/demo/explosive.rs
fn explosion_cleanup_system(
    mut commands: Commands,
    time: Res<Time>,
    mut q_explosives: Query<(Entity, &mut ExplosiveState)>,
    q_hooks: Query<&Hook>,
) {
    for (entity, mut state) in q_explosives.iter_mut() {
        let Some(timer) = &mut state.cleanup_timer else { continue };

        timer.tick(time.delta());
        if !timer.is_finished() { continue; }

        // 检查钩子是否还抓着
        let is_grabbed = q_hooks.iter().any(|hook| hook.grabed_entity == Some(entity));
        if !is_grabbed {
            commands.entity(entity).despawn();
        }
    }
}
```

---

## 七、奖励计算

### 7.1 玩家数据

玩家数据用 Resource 存，跨关卡不掉：

```rust
/// src/demo/player.rs
#[derive(Resource)]
pub struct PlayerResource {
    pub money: i32,
    pub goal: i32,
    pub goal_add_on: i32,
    pub strength: f32,          // 基础力量倍率
    pub dynamite_count: i32,
    pub has_strength_drink: bool,
    pub has_lucky_clover: bool,
    pub has_rock_collectors_book: bool,
    pub has_gem_polish: bool,
    pub is_using_dynamite: bool,
    pub using_dynamite_timer: f32,
}
```

### 7.2 基础分 + 道具叠加

先按配置拿基础分：

```rust
/// src/demo/hook.rs
let mut bonus = descriptor.bonus.unwrap_or(0);
let sound_id = descriptor.bonus_type.as_deref().unwrap_or("Normal");
```

道具结算：

```rust
/// src/demo/hook.rs
// 石头收藏书：岩石价值 ×3
if player.has_rock_collectors_book
    && matches!(entity_id, "MiniRock" | "NormalRock" | "BigRock")
{
    bonus *= 3;
}

// 宝石抛光剂：钻石价值 ×1.5，带钻石的地鼠也算
if player.has_gem_polish {
    if entity_id == "Diamond" {
        bonus = (bonus as f32 * 1.5) as i32;
    } else if entity_id == "MoleWithDiamond" {
        let mole_bonus = 2;
        bonus = (((bonus - mole_bonus) as f32) * 1.5 + mole_bonus as f32) as i32;
    }
}

// 幸运草：翻倍额外效果概率
let mut chances = descriptor.extra_effect_chances.unwrap_or(0.0);
if player.has_lucky_clover {
    chances *= 2.0;
}

// 触发额外效果
if chances > 0.0 && rand::random::<f32>() < chances {
    if rand::random::<f32>() < 0.2 {
        player.dynamite_count = (player.dynamite_count + 1).min(12);  // +1 炸药，上限 12
    } else {
        // 力量增长公式：strength = min(6.0, strength * 1.5 + 1.0)
        player.strength = (player.strength * 1.5 + 1.0).min(6.0);
        hook.show_strength = true;
        hook.strength_timer = STRENGTH_DISPLAY_DURATION;

        // 播放动画 + 显示 Strength! 图标
        player_anim.update_state(PlayerAnimationState::Strengthen);
        // ... spawn Strength! 图标
    }
}
```

道具一掺进来，每局味道都不一样。有时候算得明白，有时候纯看脸。

---

## 八、输入控制

### 8.1 键盘 + 手柄

键盘手柄都能打：

```rust
/// src/demo/hook.rs
fn handle_hook_input(/* ... */) {
    let mut fire = input.just_pressed(KeyCode::ArrowDown)
        || input.just_pressed(KeyCode::KeyJ)
        || input.just_pressed(KeyCode::KeyK);
    let mut use_dynamite = input.just_pressed(KeyCode::ArrowUp)
        || input.just_pressed(KeyCode::KeyU)
        || input.just_pressed(KeyCode::KeyI);
    let mut skip = input.just_pressed(KeyCode::Space);

    for gamepad in &gamepads {
        if gamepad.just_pressed(GamepadButton::DPadDown)
            || gamepad.just_pressed(GamepadButton::South)
            || gamepad.just_pressed(GamepadButton::East)
        {
            fire = true;
        }
        if gamepad.just_pressed(GamepadButton::DPadUp)
            || gamepad.just_pressed(GamepadButton::West)
            || gamepad.just_pressed(GamepadButton::North)
        {
            use_dynamite = true;
        }
        if gamepad.just_pressed(GamepadButton::Select) {
            skip = true;
        }
    }
}
```

### 8.2 炸药使用

钩子回缩时抓着东西可以按上键炸掉：

```rust
/// src/demo/hook.rs
if use_dynamite
    && hook.is_backing
    && hook.grabed_entity.is_some()
    && player.dynamite_count > 0
    && !player.is_using_dynamite
{
    player.dynamite_count -= 1;
    player.is_using_dynamite = true;
    player.using_dynamite_timer = 0.39;

    anim.update_state(PlayerAnimationState::UseDynamite);

    spawn_standard_explosion_fx(
        &mut commands, &image_assets, texture_atlas_layouts.as_mut(), center,
    );

    if let Some(entity) = hook.grabed_entity {
        commands.entity(entity).despawn();
        hook.grabed_entity = None;
    }
}
```

最常见的用法：钩到大石头，嫌慢，直接炸。

---

## 九、商店

![image.png](https://assets.zool.me/2026/04/9e58a0a4618d080e93d22ef60d1b9c34.png)

### 9.1 商品配置

5 种道具，价格随关卡涨还带随机：

```rust
/// src/screens/shop.rs
pub enum PropType {
    Dynamite,
    StrengthDrink,
    LuckyClover,
    RockCollectorsBook,
    GemPolish,
}

impl PropType {
    fn description(&self) -> &'static str {
        match self {
            PropType::Dynamite => "Destroy grabbed entity",
            PropType::StrengthDrink => "Pull faster next level",
            PropType::LuckyClover => "2x luck on bags",
            PropType::RockCollectorsBook => "3x rock value",
            PropType::GemPolish => "1.5x diamond value",
        }
    }

    fn get_price(&self, level: u32) -> u32 {
        let mut rng = rand::thread_rng();
        match self {
            PropType::Dynamite => rng.gen_range(1..=300) + 1 + level * 2,
            PropType::StrengthDrink => rng.gen_range(100..=400),
            PropType::LuckyClover => rng.gen_range(1..=(level * 50).max(1)) + 1 + level * 2,
            PropType::RockCollectorsBook => rng.gen_range(1..=150) + 1,
            PropType::GemPolish => rng.gen_range(201..=(level * 100 + 201)),
        }
    }
}
```

商品不是 5 个全刷，随机出，最少保底一个。

### 9.2 店主 NPC

店老板不只是站桩，买不买东西他脸色都不一样：

```rust
/// src/screens/shop.rs
commands.spawn((
    Name::new("Shopkeeper"),
    Sprite::from_atlas_image(
        image_assets.get_image("Shopkeeper").unwrap(),
        TextureAtlas { layout: shopkeeper_layout_handle, index: 0 },
    ),
    Transform::from_translation(love_to_bevy_coords(220.0, 100.0).extend(1.0)),
    ShopkeeperSprite,
));
```

切脸逻辑：

```rust
/// src/screens/shop.rs
if shop_state.is_finish_shopping {
    if let Ok(mut sprite) = q_shopkeeper.single_mut() {
        if let Some(atlas) = sprite.texture_atlas.as_mut() {
            if !shop_state.player_bought {
                atlas.index = 1;  // Sad :(
            } else {
                atlas.index = 0;  // Idle ^_^
            }
        }
    }
}
```

买了东西店主开心说 "Thank you! Good luck!"，啥都不买就给你看 ":("

就这么点小动作，商店一下就不木了。

没钱的时候老板会直接怼你一句："You don't seem to have any money :("

---

## 十、关卡统计

### 10.1 统计 Resource

```rust
/// src/screens/stats.rs
#[derive(Resource, Debug, Clone)]
pub struct LevelStats {
    pub money: u32,
    pub money_view: u32,       // HUD 显示用，拿来做数字滚动动画
    pub goal: u32,
    pub goal_addon: u32,
    pub level: u32,
    pub timer: f32,
    pub is_first_init: bool,
    pub real_level_str: String,
}

impl LevelStats {
    pub fn update_goal(&mut self) {
        if self.level > 1 && self.level <= 9 {
            self.goal_addon += 270;
        }
        self.goal += self.goal_addon;
    }

    pub fn reach_goal(&self) -> bool {
        self.money >= self.goal
    }

    pub fn calculate_real_level(&mut self) {
        let real_level = if self.level <= 3 {
            self.level
        } else {
            ((self.level - 3) % 7) + 3
        };
        let variant = rand::random::<u32>() % 3 + 1;
        self.real_level_str = format!("L{real_level}_{variant}");
    }
}
```

`money_view` 专门拿来做 HUD 金额滚动，不然每次加钱都直接跳字，看着有点硬。`is_first_init` 给首关过场用。

关卡前 3 关线性往上，后面按 7 关一轮循环，再随机挑个变体，不至于每轮都长一个样。

### 10.2 HUD 布局

这排 HUD 直接拿 `Text2d` 画，金额显示走 `money_view`：先把真实值记到 `money`，再慢慢滚到界面上。

```rust
/// src/demo/level.rs
fn setup_ui(/* ... */) {
    commands
        .spawn((
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

    commands.spawn((
        Text2d::new("Time: "),
        game_style.clone(),
        TextColor(COLOR_DEEP_ORANGE),
        Transform::from_translation(love_to_bevy_coords(260.0, 15.0).extend(10.0)),
        Anchor::TOP_LEFT,
    ));

    commands.spawn((
        Text2d::new("Level: "),
        game_style.clone(),
        TextColor(COLOR_DEEP_ORANGE),
        Transform::from_translation(love_to_bevy_coords(250.0, 25.0).extend(10.0)),
        Anchor::TOP_LEFT,
    ));
}
```

---

## 十一、Stage 2 完成效果

做到这儿，这游戏就算真能玩了：

- 钩子：摆动发射抓取回缩全套
- YAML 配置关卡和实体
- 圆形碰撞 + 质量影响速度
- 地鼠巡逻 AI
- TNT 爆炸链
- FX 特效系统
- 大金砖闪光
- 店主 NPC（会变脸）
- 道具系统
- 关卡目标/计时/通关判定
- 炸药
- 键盘 + 手柄

Stage 2 搞定。

---

## 十二、下一阶段：Stage 3

Stage 3 打算做：

- 音频（BGM、音效、语音）
- 存档
- 屏幕流转（Loading → Menu → Gameplay → Shop → Game Over）
- 关卡过渡动画

这些做完，游戏体验就完整了。Stage 2 搭的玩法、实体、商店是后面所有东西的底子。
