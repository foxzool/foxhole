---
Status: ✅
tags:
  - output/blog
Links:
  - "[[Bevy MOC]]"
Created: 2025-11-21T15:51:03
BevyVersion:
  - "0.18"
share:
Collection: "[[黄金矿工]]"
---
# Bevy 复刻黄金矿工｜Stage 2：游戏机制

> Stage 2 已完成！本文档记录了游戏核心机制的完整实现，包括抓钩系统、关卡配置、碰撞检测、实体动画、爆炸机制、特效系统等。

本阶段聚焦于让游戏真正「可玩」：

- 实现钩子的摆动、发射、抓取、回缩完整逻辑
- 使用 YAML 配置关卡和实体属性
- 碰撞检测与物理（质量影响拉回速度）
- 可移动实体（地鼠）的巡逻与动画系统
- TNT 爆炸与连锁反应机制
- 道具效果与奖励计算系统
- 关卡目标、计时器与通关判定
- **通用特效系统（FX）**
- **商店店主 NPC 与表情系统**
- **大金砖闪光特效**

---

## 一、游戏场景

### 1.1 游戏背景

游戏关卡的背景由顶部区域 `bg_top.png` 和关卡主体 `bg_level_[ABCDE].png` 组成。根据关卡编号动态选择背景类型：

```rust
/// src/demo/level.rs

pub fn spawn_background(
    mut commands: Commands,
    image_assets: Res<ImageAssets>,
    stats: Res<crate::screens::stats::LevelStats>,
) {
    // 根据关卡编号映射到背景类型
    // 关卡 1-2 使用 LevelA, 3-4 使用 LevelB, 5-6 使用 LevelC, 7-8 使用 LevelD, 9+ 使用 LevelE
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

fn bg_top(image_assets: &Res<ImageAssets>) -> impl Bundle {
    (
        Name::new("Top Background"),
        Transform::from_translation(love_to_bevy_coords(0.0, 0.0).extend(-1.0)),
        Anchor::TOP_LEFT,
        Sprite::from_image(image_assets.get_image("LevelCommonTop").unwrap()),
    )
}

fn bg_level(image_assets: &Res<ImageAssets>, bg_type: &str) -> impl Bundle {
    (
        Name::new(format!("{bg_type} Background")),
        Transform::from_translation(love_to_bevy_coords(0.0, 40.0).extend(-1.0)),
        Anchor::TOP_LEFT,
        Sprite::from_image(image_assets.get_image(bg_type).unwrap()),
    )
}
```

背景图片的锚点设置为 `TOP_LEFT`，与 Love2D 原版的左上角坐标系保持一致。

### 1.2 矿工与钩子

**矿工动画**使用精灵图 `miner_sheet.png`，包含 8 帧动画，每帧 32×40 像素：

```rust
/// src/demo/player.rs

// miner_sheet.png 布局: 8 帧横排，每帧 32x40 像素
let layout = TextureAtlasLayout::from_grid(UVec2::new(32, 40), 8, 1, None, None);

commands.spawn((
    Name::new("Player"),
    PlayerMarker,
    player_animation,
    Sprite::from_atlas_image(
        player_assets.miner.clone(),
        TextureAtlas {
            layout: texture_atlas_layout,
            index: 0,
        },
    ),
    Transform::from_translation(love_to_bevy_coords(165.0, 39.0).extend(0.0)),
    Anchor::BOTTOM_CENTER,
));
```

矿工动画状态机包含 5 种状态：
- `Idle`：待机（帧 0）
- `Grab`：抓取中（帧 2）
- `GrabBack`：回收中（帧 0,1,2 循环）
- `UseDynamite`：使用炸药（帧 3,4,5 循环）
- `Strengthen`：力量增强（帧 6,7,6,7 循环）

**钩子系统**是游戏的核心机制：

```rust
/// src/demo/hook.rs

#[derive(Component)]
pub struct Hook {
    pub length: f32,           // 钩子伸出长度
    pub angle: f32,            // 当前角度
    pub rotate_right: bool,    // 旋转方向
    pub is_grabing: bool,      // 是否正在伸出抓取
    pub is_backing: bool,      // 是否正在回缩
    pub is_showing_bonus: bool, // 是否显示奖励
    pub grabed_entity: Option<Entity>, // 抓取的实体
    pub bonus_timer: f32,      // 奖励显示计时器
    pub current_bonus: i32,    // 当前奖励金额
    pub show_strength: bool,   // 是否显示力量增强
}

// 钩子配置常量
const HOOK_MIN_ANGLE: f32 = -75.0;    // 最小角度
const HOOK_MAX_ANGLE: f32 = 75.0;     // 最大角度
const HOOK_ROTATE_SPEED: f32 = 65.0;  // 旋转速度 (度/秒)
const HOOK_MAX_LENGTH: f32 = 230.0;   // 最大伸出长度
const HOOK_GRAB_SPEED: f32 = 100.0;   // 抓取速度 (像素/秒)
const HOOK_COLLISION_RADIUS: f32 = 6.0; // 碰撞半径
const HOOK_COLLISION_OFFSET: f32 = 13.0; // 碰撞圆心偏移

// 动画帧索引
const HOOK_ANIM_IDLE: usize = 0;
const HOOK_ANIM_GRAB_NORMAL: usize = 1;
const HOOK_ANIM_GRAB_MINI: usize = 2;
```

钩子的图片锚点设置为 `TOP_CENTER`，这样旋转时会以图片顶部中心为轴心，符合物理直觉。

---

## 二、关卡配置系统

### 2.1 YAML 配置

原 Love2D 项目的配置使用 Lua 代码即配置的方式，本项目将其改为 YAML 格式，更清晰易维护：

```yaml
# assets/config/entities.yaml
MiniGold:
    type: Basic
    mass: 2
    bonus: 50
    bonusType: Normal

NormalGold:
    type: Basic
    mass: 3.5
    bonus: 100
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

### 2.2 Rust 配置结构

使用 `bevy_common_assets` crate 加载 YAML 配置：

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

/// 实体描述符
#[derive(Debug, Clone, Component, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EntityDescriptor {
    #[serde(rename = "type")]
    pub entity_type: EntityType,  // Basic, RandomEffect, MoveAround, Explosive
    pub mass: Option<f32>,        // 质量（影响拉回速度）
    pub bonus: Option<i32>,       // 基础分值
    pub bonus_type: Option<String>, // 分值类型（High, Normal, Low）对应音效
    pub speed: Option<f32>,       // 移动速度（仅 MoveAround）
    pub move_range: Option<f32>,  // 巡逻范围（仅 MoveAround）
    pub extra_effect_chances: Option<f32>, // 额外效果概率
    pub collision_radius: Option<f32>, // 碰撞半径（可选）
}

/// 实体行为类型
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum EntityType {
    Basic,        // 基础物体：位置固定
    RandomEffect, // 随机效果：动态计算质量和得分
    MoveAround,   // 巡逻物体：左右移动
    Explosive,    // 爆炸物：碰撞后爆炸
}
```

### 2.3 配置加载

```rust
/// Cargo.toml
bevy_common_assets = { version = "0.14", features = ["yaml"]}

/// src/config.rs
use bevy_common_assets::yaml::YamlAssetPlugin;

app.add_plugins((
    YamlAssetPlugin::<LevelsConfig>::new(&["config/levels.yaml"]),
    YamlAssetPlugin::<EntitiesConfig>::new(&["config/entities.yaml"])
));
```

---

## 三、碰撞检测与抓取

### 3.1 圆形碰撞检测

钩子使用圆形碰撞判定，碰撞圆心位于钩子末端 + 偏移量：

```rust
/// src/demo/hook.rs

fn update_hook(/* ... */) {
    // 碰撞检测圆心位置 (钩子末端 + 偏移)
    let collision_pos = base_pos + dir * (hook.length + HOOK_COLLISION_OFFSET);

    // 碰撞判定：当两圆心距离小于半径之和时发生碰撞
    for (entity, entity_transform) in q_entities.iter() {
        let entity_pos = entity_transform.translation().truncate();
        let entity_radius = descriptor.collision_radius.unwrap_or(HOOK_COLLISION_RADIUS);

        if collision_pos.distance(entity_pos) < (HOOK_COLLISION_RADIUS + entity_radius) {
            hook.grabed_entity = Some(entity);
            
            // 根据实体大小切换动画帧
            let is_tiny = descriptor.mass.unwrap_or(1.0) < 2.0;
            if let Some(atlas) = &mut sprite.texture_atlas {
                atlas.index = if is_tiny { HOOK_ANIM_GRAB_MINI } else { HOOK_ANIM_GRAB_NORMAL };
            }
            break;
        }
    }
}
```

### 3.2 质量影响拉回速度

钩子的回缩速度根据抓取物体的质量动态计算：

```rust
/// src/demo/hook.rs

// 回缩逻辑
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

质量越大的物体，拉回速度越慢，增加了游戏的策略性。

---

## 四、实体系统

### 4.1 实体动画

可移动实体（如地鼠）具有待机和移动两套动画：

```rust
/// src/demo/entity.rs

/// 实体动画组件
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

### 4.2 巡逻系统

地鼠等可移动实体在指定范围内左右巡逻：

```rust
/// src/demo/entity.rs

#[derive(Component)]
pub struct PatrolState {
    pub is_moving: bool,       // 是否正在移动
    pub direction: f32,        // 移动方向（1.0 向右，-1.0 向左）
    pub destination_x: f32,    // 目标位置 X 坐标
    pub idle_timer: Timer,     // 闲置计时器
    pub move_range: f32,       // 移动范围
}

fn patrol_movement_system(/* ... */) {
    if state.is_moving {
        // 计算移动速度
        let speed = descriptor.speed.unwrap_or(1.0) * 60.0;
        let delta = speed * state.direction * time.delta_secs();
        transform.translation.x += delta;

        // 检查是否到达目标位置
        let reached = if state.direction > 0.0 {
            transform.translation.x >= state.destination_x
        } else {
            transform.translation.x <= state.destination_x
        };

        if reached {
            // 到达目标，开始闲置
            state.is_moving = false;
            state.idle_timer.reset();
            state.direction *= -1.0; // 反转方向
        }
    } else {
        // 闲置状态
        state.idle_timer.tick(time.delta());
        if state.idle_timer.is_finished() {
            state.is_moving = true;
        }
    }
}
```

### 4.3 实体生成

根据实体类型应用不同的精灵图和组件：

```rust
/// src/demo/level.rs

fn spawn_entity_sprite(/* ... */) {
    if entity_desc.entity_type == EntityType::MoveAround {
        // 地鼠：使用纹理图集动画
        let layout = TextureAtlasLayout::from_grid(UVec2::new(18, 13), 7, 1, None, None);
        commands.entity(entity).insert((
            EntityAnimation::new(0.15, vec![0], vec![0, 1, 2, 3, 4, 5, 6]),
        ));
    } else if entity_desc.entity_type == EntityType::Explosive {
        // TNT：添加爆炸状态组件
        commands.entity(entity).insert(ExplosiveState::default());
    } else {
        // 基础物体：静态图片
        commands.entity(entity).insert(Sprite::from_image(img_handle));
    }
}
```

---

## 五、特效系统（FX）

### 5.1 通用 FX 动画组件

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

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum FXPlayback {
    Loop,   // 循环播放
    Once,   // 播放一次后销毁
}

#[derive(Clone, Copy, Debug)]
pub enum FXPlacement {
    Fixed(Vec2),           // 固定位置
    Follow { entity: Entity, offset: Vec2 }, // 跟随实体
}
```

### 5.2 大金砖闪光特效

当钩子抓取到 BigGold 时触发闪光特效：

```rust
/// src/demo/hook.rs

// BigGold 闪光特效：被抓取时触发
if entity_id == "BigGold"
    && let Some(fx_image) = image_assets.get_image("BigGoldFX")
{
    let layout = TextureAtlasLayout::from_grid(UVec2::new(16, 16), 3, 3, None, None);
    let atlas_layout = texture_atlas_layouts.add(layout);

    commands.spawn((
        Name::new("BigGoldSparkle"),
        FXAnimation::new(
            9,                      // 9帧
            0.2,                    // 每帧0.2秒
            FXPlayback::Loop,       // 循环播放
            FXPlacement::Follow {   // 跟随 BigGold
                entity,
                offset: Vec2::ZERO,
            },
        ),
        Sprite::from_atlas_image(fx_image, TextureAtlas { layout: atlas_layout, index: 0 }),
        Anchor::CENTER,
        DespawnOnExit(Screen::Gameplay),
    ));
}
```

### 5.3 爆炸特效

支持两种爆炸特效：
- **标准爆炸**：16×16 像素，12帧，用于炸药
- **大型爆炸**：35×35 像素，8帧，用于 TNT

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

## 六、爆炸系统（TNT）

### 6.1 爆炸触发

当钩子碰撞 TNT 时触发爆炸，产生范围伤害和连锁反应：

```rust
/// src/demo/explosive.rs

const EXPLOSION_RADIUS: f32 = 35.0 / 2.0; // 爆炸半径

/// TNT 爆炸状态组件
#[derive(Component, Default)]
pub struct ExplosiveState {
    pub is_exploding: bool,
    pub damage_dealt: bool,
}

/// 爆炸特效组件
#[derive(Component)]
pub struct ExplosionFX {
    pub center: Vec2, // 爆炸中心位置
}
```

### 6.2 范围伤害与连锁反应

爆炸会销毁范围内的普通实体，并触发其他 TNT 的连锁爆炸：

```rust
/// src/demo/explosive.rs

fn explosion_damage_system(/* ... */) {
    // 收集所有活跃的爆炸中心
    let explosion_centers: Vec<Vec2> = q_fx.iter().map(|fx| fx.center).collect();

    // 检测范围内的普通实体并销毁
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

    // 连锁反应：检测范围内的其他 TNT
    for (entity, mut state, _) in q_explosives.iter_mut() {
        if state.is_exploding { continue; }
        
        // 如果 TNT 在爆炸范围内，触发连锁爆炸
        for center in &explosion_centers {
            if center.distance(entity_pos) < (EXPLOSION_RADIUS + 6.0) {
                state.is_exploding = true;
                break;
            }
        }
    }
}
```

---

## 七、奖励计算系统

### 7.1 基础奖励

抓取实体后，根据实体配置计算基础奖励：

```rust
/// src/demo/hook.rs

let mut bonus = descriptor.bonus.unwrap_or(0);
let sound_id = descriptor.bonus_type.as_deref().unwrap_or("Normal");
```

### 7.2 道具效果

多种道具会影响最终奖励计算：

```rust
/// src/demo/hook.rs

// 石头收藏书效果：岩石价值 ×3
if player.has_rock_collectors_book 
    && matches!(entity_id, "MiniRock" | "NormalRock" | "BigRock")
{
    bonus *= 3;
}

// 宝石抛光剂效果：钻石价值 ×1.5
if player.has_gem_polish && entity_id == "Diamond" {
    bonus = (bonus as f32 * 1.5) as i32;
}

// 幸运草效果：翻倍 extra_effect_chances
let mut chances = descriptor.extra_effect_chances.unwrap_or(0.0);
if player.has_lucky_clover {
    chances *= 2.0;
}

// 处理特殊效果概率
if chances > 0.0 && rand::random::<f32>() < chances {
    // 20% 概率增加炸药，80% 概率增加玩家力量
    if rand::random::<f32>() < 0.2 {
        player.dynamite_count += 1;
    } else {
        player.strength = (player.strength + 1).min(6);
        hook.show_strength = true;
    }
}
```

---

## 八、输入控制

### 8.1 键盘与手柄

支持键盘和手柄双输入方式：

```rust
/// src/demo/hook.rs

fn handle_hook_input(/* ... */) {
    // 键盘输入
    let mut fire = input.just_pressed(KeyCode::ArrowDown)
        || input.just_pressed(KeyCode::KeyJ)
        || input.just_pressed(KeyCode::KeyK);
    let mut use_dynamite = input.just_pressed(KeyCode::ArrowUp)
        || input.just_pressed(KeyCode::KeyU)
        || input.just_pressed(KeyCode::KeyI);
    let mut skip = input.just_pressed(KeyCode::Space);

    // 手柄输入
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

在钩子回缩且抓到物体时，可以按上方向键使用炸药销毁物体：

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

    // 切换玩家动画
    anim.update_state(PlayerAnimationState::UseDynamite);

    // 在钩子位置产生爆炸特效
    spawn_standard_explosion_fx(&mut commands, &image_assets, texture_atlas_layouts.as_mut(), center);

    // 销毁被抓取的物品
    if let Some(entity) = hook.grabed_entity {
        commands.entity(entity).despawn();
        hook.grabed_entity = None;
    }
}
```

---

## 九、商店系统

### 9.1 商店界面

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
    fn get_price(&self, level: u32) -> u32 {
        let mut rng = rand::rng();
        match self {
            PropType::Dynamite => rng.random_range(1..=300) + 1 + level * 2,
            PropType::StrengthDrink => rng.random_range(100..=400),
            PropType::LuckyClover => rng.random_range(1..=(level * 50).max(1)) + 1 + level * 2,
            PropType::RockCollectorsBook => rng.random_range(1..=150) + 1,
            PropType::GemPolish => rng.random_range(201..=(level * 100 + 201)),
        }
    }
}
```

### 9.2 店主 NPC

商店添加了店主 NPC，会根据玩家购物行为切换表情：

```rust
/// src/screens/shop.rs

// 店主 (220, 100)
commands.spawn((
    Name::new("Shopkeeper"),
    Sprite::from_atlas_image(
        image_assets.get_image("Shopkeeper").unwrap(),
        TextureAtlas {
            layout: shopkeeper_layout_handle,
            index: 0, // 0 = Idle, 1 = Sad
        },
    ),
    Transform::from_translation(love_to_bevy_coords(220.0, 100.0).extend(1.0)),
    ShopkeeperSprite,
));
```

店主表情切换逻辑：

```rust
/// src/screens/shop.rs

if shop_state.is_finish_shopping {
    if let Ok(mut sprite) = q_shopkeeper.single_mut() {
        if let Some(atlas) = sprite.texture_atlas.as_mut() {
            if !shop_state.player_bought {
                atlas.index = 1; // Sad state
            } else {
                atlas.index = 0; // Idle state
            }
        }
    }
}
```

- **购买后**：店主显示 Idle 表情（帧 0），对话显示 "Thank you! Good luck!"
- **未购买**：店主显示 Sad 表情（帧 1），对话显示 "  :("

---

## 十、关卡统计系统

### 10.1 统计结构

```rust
/// src/screens/stats.rs

#[derive(Resource, Debug, Clone)]
pub struct LevelStats {
    pub money: u32,           // 当前金钱
    pub goal: u32,            // 目标金额
    pub goal_addon: u32,      // 每关增加的目标幅度
    pub level: u32,           // 关卡编号
    pub timer: f32,           // 剩余时间
    pub real_level_str: String, // 实际关卡配置ID (如 "L1_1")
}

impl LevelStats {
    /// 计算下一关目标金额
    pub fn update_goal(&mut self) {
        if self.level > 1 && self.level <= 9 {
            self.goal_addon += 270;
        }
        self.goal += self.goal_addon;
    }

    pub fn reach_goal(&self) -> bool {
        self.money >= self.goal
    }

    /// 计算实际关卡配置
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

### 10.2 UI 显示

关卡界面显示金钱、目标、时间和关卡编号：

```rust
/// src/demo/level.rs

fn setup_ui(/* ... */) {
    // Money HUD
    commands.spawn((
        Text2d::new("Money"),
        TextColor(COLOR_DEEP_ORANGE),
        Transform::from_translation(love_to_bevy_coords(10.0, 10.0).extend(10.0)),
    )).with_children(|parent| {
        parent.spawn((
            TextSpan::new(format!(" ${}", stats.money)),
            TextColor(COLOR_GREEN),
            MoneyText,
        ));
    });

    // Goal HUD
    commands.spawn((
        Text2d::new(" Goal"),
        TextColor(COLOR_DEEP_ORANGE),
        Transform::from_translation(love_to_bevy_coords(10.0, 28.0).extend(10.0)),
    ));

    // Time HUD
    commands.spawn((
        Text2d::new("Time: "),
        TextColor(COLOR_DEEP_ORANGE),
        Transform::from_translation(love_to_bevy_coords(260.0, 10.0).extend(10.0)),
    ));

    // Level HUD
    commands.spawn((
        Text2d::new("Level: "),
        TextColor(COLOR_DEEP_ORANGE),
        Transform::from_translation(love_to_bevy_coords(260.0, 25.0).extend(10.0)),
    ));
}
```

---

## 十、Stage 2 完成效果

当钩子碰撞 TNT 时触发爆炸，产生范围伤害和连锁反应：

```rust
/// src/demo/explosive.rs

const EXPLOSION_RADIUS: f32 = 35.0 / 2.0; // 爆炸半径

/// TNT 爆炸状态组件
#[derive(Component, Default)]
pub struct ExplosiveState {
    pub is_exploding: bool,
    pub damage_dealt: bool,
}

/// 爆炸特效组件
#[derive(Component)]
pub struct ExplosionFX {
    pub timer: Timer,
    pub current_frame: usize,
    pub center: Vec2, // 爆炸中心位置
}
```

### 6.2 范围伤害与连锁反应

爆炸会销毁范围内的普通实体，并触发其他 TNT 的连锁爆炸：

```rust
/// src/demo/explosive.rs

fn explosion_damage_system(/* ... */) {
    // 收集所有活跃的爆炸中心
    let explosion_centers: Vec<Vec2> = q_fx.iter().map(|fx| fx.center).collect();

    // 检测范围内的普通实体并销毁
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

    // 连锁反应：检测范围内的其他 TNT
    for (entity, mut state, _) in q_explosives.iter_mut() {
        if state.is_exploding { continue; }
        
        // 如果 TNT 在爆炸范围内，触发连锁爆炸
        for center in &explosion_centers {
            if center.distance(entity_pos) < (EXPLOSION_RADIUS + 6.0) {
                state.is_exploding = true;
                break;
            }
        }
    }
}
```

---

## 六、奖励计算系统

### 6.1 基础奖励

抓取实体后，根据实体配置计算基础奖励：

```rust
/// src/demo/hook.rs

let mut bonus = descriptor.bonus.unwrap_or(0);
let sound_id = descriptor.bonus_type.as_deref().unwrap_or("Normal");
```

### 6.2 道具效果

多种道具会影响最终奖励计算：

```rust
/// src/demo/hook.rs

// 石头收藏书效果：岩石价值 ×3
if player.has_rock_collectors_book 
    && matches!(entity_id, "MiniRock" | "NormalRock" | "BigRock")
{
    bonus *= 3;
}

// 宝石抛光剂效果：钻石价值 ×1.5
if player.has_gem_polish && entity_id == "Diamond" {
    bonus = (bonus as f32 * 1.5) as i32;
}

// 幸运草效果：翻倍 extra_effect_chances
let mut chances = descriptor.extra_effect_chances.unwrap_or(0.0);
if player.has_lucky_clover {
    chances *= 2.0;
}

// 处理特殊效果概率
if chances > 0.0 && rand::random::<f32>() < chances {
    // 20% 概率增加炸药，80% 概率增加玩家力量
    if rand::random::<f32>() < 0.2 {
        player.dynamite_count += 1;
    } else {
        player.strength = (player.strength + 1).min(6);
        hook.show_strength = true;
    }
}
```

---

## 七、输入控制

### 7.1 键盘与手柄

支持键盘和手柄双输入方式：

```rust
/// src/demo/hook.rs

fn handle_hook_input(/* ... */) {
    // 键盘输入
    let mut fire = input.just_pressed(KeyCode::ArrowDown)
        || input.just_pressed(KeyCode::KeyJ)
        || input.just_pressed(KeyCode::KeyK);
    let mut use_dynamite = input.just_pressed(KeyCode::ArrowUp)
        || input.just_pressed(KeyCode::KeyU)
        || input.just_pressed(KeyCode::KeyI);
    let mut skip = input.just_pressed(KeyCode::Space);

    // 手柄输入
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

### 7.2 炸药使用

在钩子回缩且抓到物体时，可以按上方向键使用炸药销毁物体：

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

    // 切换玩家动画
    anim.update_state(PlayerAnimationState::UseDynamite);

    // 在钩子位置产生爆炸特效
    spawn_explosion_fx(transform.translation.truncate());

    // 销毁被抓取的物品
    if let Some(entity) = hook.grabed_entity {
        commands.entity(entity).despawn();
        hook.grabed_entity = None;
    }
}
```

---

## 八、商店系统

### 8.1 商店界面

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
    fn get_price(&self, level: u32) -> u32 {
        let mut rng = rand::rng();
        match self {
            PropType::Dynamite => rng.random_range(1..=300) + 1 + level * 2,
            PropType::StrengthDrink => rng.random_range(100..=400),
            PropType::LuckyClover => rng.random_range(1..=(level * 50).max(1)) + 1 + level * 2,
            PropType::RockCollectorsBook => rng.random_range(1..=150) + 1,
            PropType::GemPolish => rng.random_range(201..=(level * 100 + 201)),
        }
    }
}
```

### 8.2 店主 NPC

商店添加了店主 NPC，会根据玩家购物行为切换表情：

```rust
/// src/screens/shop.rs

// 店主 (220, 100)
commands.spawn((
    Name::new("Shopkeeper"),
    Sprite::from_atlas_image(
        image_assets.get_image("Shopkeeper").unwrap(),
        TextureAtlas {
            layout: shopkeeper_layout_handle,
            index: 0, // 0 = Idle, 1 = Sad
        },
    ),
    Transform::from_translation(love_to_bevy_coords(220.0, 100.0).extend(1.0)),
    ShopkeeperSprite,
));
```

店主表情切换逻辑：

```rust
/// src/screens/shop.rs

if shop_state.is_finish_shopping {
    if let Ok(mut sprite) = q_shopkeeper.single_mut() {
        if let Some(atlas) = sprite.texture_atlas.as_mut() {
            if !shop_state.player_bought {
                atlas.index = 1; // Sad state
            } else {
                atlas.index = 0; // Idle state
            }
        }
    }
}
```

- **购买后**：店主显示 Idle 表情（帧 0），对话显示 "Thank you! Good luck!"
- **未购买**：店主显示 Sad 表情（帧 1），对话显示 "  :("

---

## 九、关卡统计系统

### 9.1 统计结构

```rust
/// src/screens/stats.rs

#[derive(Resource, Debug, Clone)]
pub struct LevelStats {
    pub money: u32,           // 当前金钱
    pub goal: u32,            // 目标金额
    pub goal_addon: u32,      // 每关增加的目标幅度
    pub level: u32,           // 关卡编号
    pub timer: f32,           // 剩余时间
    pub real_level_str: String, // 实际关卡配置ID (如 "L1_1")
}

impl LevelStats {
    /// 计算下一关目标金额
    pub fn update_goal(&mut self) {
        if self.level > 1 && self.level <= 9 {
            self.goal_addon += 270;
        }
        self.goal += self.goal_addon;
    }

    pub fn reach_goal(&self) -> bool {
        self.money >= self.goal
    }

    /// 计算实际关卡配置
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

### 9.2 UI 显示

关卡界面显示金钱、目标、时间和关卡编号：

```rust
/// src/demo/level.rs

fn setup_ui(/* ... */) {
    // Money HUD
    commands.spawn((
        Text2d::new("Money"),
        TextColor(COLOR_DEEP_ORANGE),
        Transform::from_translation(love_to_bevy_coords(10.0, 10.0).extend(10.0)),
    )).with_children(|parent| {
        parent.spawn((
            TextSpan::new(format!(" ${}", stats.money)),
            TextColor(COLOR_GREEN),
            MoneyText,
        ));
    });

    // Goal HUD
    commands.spawn((
        Text2d::new(" Goal"),
        TextColor(COLOR_DEEP_ORANGE),
        Transform::from_translation(love_to_bevy_coords(10.0, 28.0).extend(10.0)),
    ));

    // Time HUD
    commands.spawn((
        Text2d::new("Time: "),
        TextColor(COLOR_DEEP_ORANGE),
        Transform::from_translation(love_to_bevy_coords(260.0, 10.0).extend(10.0)),
    ));

    // Level HUD
    commands.spawn((
        Text2d::new("Level: "),
        TextColor(COLOR_DEEP_ORANGE),
        Transform::from_translation(love_to_bevy_coords(260.0, 25.0).extend(10.0)),
    ));
}
```

---

## 十、Stage 2 完成效果

在完成本阶段所有工作后，游戏已经具备完整的可玩性：

- ✅ 钩子摆动、发射、抓取、回缩完整逻辑
- ✅ 基于 YAML 的关卡和实体配置系统
- ✅ 圆形碰撞检测与质量影响拉回速度
- ✅ 地鼠巡逻与动画系统
- ✅ TNT 爆炸与连锁反应
- ✅ **通用 FX 特效系统**（支持循环/单次播放、固定位置/跟随实体）
- ✅ **大金砖闪光特效**（抓取时触发，循环播放）
- ✅ **店主 NPC 系统**（Idle/Sad 双表情，根据购物行为切换）
- ✅ 道具效果（石头收藏书、宝石抛光剂、幸运草）
- ✅ 关卡目标、计时器与通关判定
- ✅ 炸药系统（可销毁抓取的物体）
- ✅ 键盘 + 手柄双输入支持

**Stage 2 已完成** ✅

---

## 十一、下一阶段预告：Stage 3

在接下来的 Stage 3 中，将完善游戏的周边系统：

- 背景音乐系统（Goal/MadeGoal 界面音乐）
- 高分榜功能完善
- 存档系统优化
- 音效音量控制
- 更多的 polish 和细节优化

届时游戏将从「可玩版本」进化为「完整版本」！
