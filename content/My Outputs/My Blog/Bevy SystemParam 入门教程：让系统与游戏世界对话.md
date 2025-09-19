---
Status: 🌲
tags:
  - output/blog
Links:
  - "[[Bevy MOC|Bevy MOC]]"
Created: 2025-07-10T15:25:44
BevyVersion:
  - "0.16"
share: true
---
# Bevy SystemParam 入门教程：让系统与游戏世界对话

## 第一章：什么是 Bevy 的系统参数？

### 从一个简单的例子开始

想象你正在制作一个游戏，游戏中有很多角色需要移动。在 Bevy 中，你会这样写一个移动系统：

```rust
fn move_players(
    time: Res<Time>,
    mut query: Query<&mut Transform, With<Player>>
) {
    for mut transform in &mut query {
        transform.translation.x += 100.0 * time.delta_seconds();
    }
}
```

看到函数参数了吗？`time` 和 `query` 就是**系统参数**。它们是你的系统函数向 Bevy 游戏世界"要东西"的方式。

### 为什么这很特别？

在普通的 Rust 程序中，调用函数时你需要手动传递参数：

```rust
// 普通 Rust
let result = calculate(5, 10);  // 你负责提供 5 和 10
```

但在 Bevy 中，情况不同：

```rust
// Bevy 系统
fn my_system(time: Res<Time>) {  // 你只需要声明需要什么
    // Bevy 会自动提供 Time 资源给你！
}
```

**这就是系统参数的魔力**：你只需要在函数签名中声明需要什么数据，Bevy 就会在运行时自动提供给你。

### 系统参数背后的原理

当你将一个系统添加到 Bevy 应用中时，Bevy 会：

1. **解析函数签名**：查看你的函数需要哪些参数类型
2. **分析数据访问**：确定每个参数是读取还是修改数据
3. **构建依赖图**：找出哪些系统可以安全地并行运行
4. **自动注入数据**：在运行时将正确的数据传递给你的函数

```rust
// 这两个系统可以并行运行，因为它们访问不同的组件
fn move_players(mut query: Query<&mut Transform, With<Player>>) { }
fn move_enemies(mut query: Query<&mut Transform, With<Enemy>>) { }

// 这两个系统也可以并行，因为都是只读访问
fn render_players(query: Query<&Transform, With<Player>>) { }
fn render_enemies(query: Query<&Transform, With<Enemy>>) { }
```

### ECS 基础回顾

在深入学习系统参数之前，让我们快速回顾 Bevy ECS 的三个核心概念：

- **实体 (Entity)**：游戏世界中的"东西"，只是一个唯一的 ID
- **组件 (Component)**：附加到实体上的数据，如位置、生命值、速度等
- **系统 (System)**：处理组件数据的函数，实现游戏逻辑

系统参数就是连接系统和 ECS 世界的桥梁！

## 第二章：开始使用基础系统参数

让我们从最常用的几个系统参数开始学习。

### 2.1 Query - 查询游戏中的实体

`Query` 是你最常用的工具，用来查找和操作游戏中的实体。

```rust
#[derive(Component)]
struct Health(f32);

#[derive(Component)]
struct Player;

// 查询所有拥有 Health 组件的实体
fn check_health(query: Query<&Health>) {
    for health in &query {
        println!("生命值: {}", health.0);
    }
}

// 只查询玩家的生命值
fn check_player_health(query: Query<&Health, With<Player>>) {
    for health in &query {
        println!("玩家生命值: {}", health.0);
    }
}
```

**Query 的两个部分**：

- 第一部分：你想要获取什么数据（如 `&Health`）
- 第二部分：过滤条件（如 `With<Player>`）

#### Query 的数据访问模式

```rust
// 只读访问
fn read_positions(query: Query<&Transform>) { }

// 可变访问
fn modify_positions(mut query: Query<&mut Transform>) { }

// 访问多个组件
fn complex_query(query: Query<(&Transform, &Health, &Name)>) {
    for (transform, health, name) in &query {
        println!("{} 在 {:?} 位置，生命值 {}", 
                 name.0, transform.translation, health.0);
    }
}

// 可选组件 - 实体可能有也可能没有
fn optional_query(query: Query<(&Transform, Option<&Health>)>) {
    for (transform, maybe_health) in &query {
        if let Some(health) = maybe_health {
            println!("有生命值: {}", health.0);
        } else {
            println!("这个实体没有生命值组件");
        }
    }
}
```

#### Query 的过滤器

过滤器让你能精确控制查询哪些实体：

```rust
// With: 必须有某个组件
fn with_player(query: Query<&Transform, With<Player>>) { }

// Without: 必须没有某个组件
fn non_players(query: Query<&Transform, Without<Player>>) { }

// 组合过滤器
fn alive_enemies(query: Query<&Transform, (With<Enemy>, Without<Dead>)>) { }

// Or: 满足其中一个条件即可
fn players_or_enemies(query: Query<&Transform, Or<(With<Player>, With<Enemy>)>>) { }

// Changed: 组件在这一帧被修改过
fn track_health_changes(query: Query<&Health, Changed<Health>>) {
    for health in &query {
        println!("生命值变化了！当前: {}", health.0);
    }
}
```

### 2.2 Res 和 ResMut - 访问全局资源

资源是游戏中的全局数据，比如游戏设置、计分板等。

```rust
#[derive(Resource)]
struct GameScore {
    points: u32,
}

#[derive(Resource)]
struct GameSettings {
    difficulty: f32,
    sound_volume: f32,
}

// 只读访问
fn display_score(score: Res<GameScore>) {
    println!("当前分数: {}", score.points);
}

// 可写访问
fn add_points(mut score: ResMut<GameScore>) {
    score.points += 10;
}

// 同时访问多个资源
fn update_game(
    time: Res<Time>,
    settings: Res<GameSettings>,
    mut score: ResMut<GameScore>,
) {
    // 根据难度和时间增加分数
    let points_per_second = 10.0 * settings.difficulty;
    score.points += (points_per_second * time.delta_seconds()) as u32;
}
```

**记住**：

- `Res<T>` = 只能读取
- `ResMut<T>` = 可以修改

#### 资源的生命周期

```rust
// 在 App 中插入资源
fn main() {
    App::new()
        .insert_resource(GameScore { points: 0 })
        .insert_resource(GameSettings { 
            difficulty: 1.0, 
            sound_volume: 0.8 
        })
        .add_systems(Update, (display_score, add_points))
        .run();
}

// 资源可以在任何系统中访问
fn any_system(score: Res<GameScore>) {
    // score 在整个游戏运行期间都存在
}
```

### 2.3 Commands - 修改游戏世界

`Commands` 让你能够创建或删除实体、添加或移除组件。

```rust
fn spawn_enemies(mut commands: Commands) {
    // 生成一个敌人
    commands.spawn((
        Enemy,
        Health(100.0),
        Transform::default(),
    ));
    
    // 生成多个敌人
    for i in 0..10 {
        commands.spawn((
            Enemy,
            Health(50.0 + i as f32 * 10.0),
            Transform::from_xyz(i as f32 * 100.0, 0.0, 0.0),
        ));
    }
}

fn cleanup_dead_enemies(
    mut commands: Commands,
    query: Query<(Entity, &Health), With<Enemy>>
) {
    for (entity, health) in &query {
        if health.0 <= 0.0 {
            commands.entity(entity).despawn();
        }
    }
}
```

#### Commands 的延迟执行

**重要提示**：Commands 的操作不会立即执行，而是在系统运行完后才生效。

```rust
fn spawn_and_modify(mut commands: Commands) {
    // 生成实体
    let entity = commands.spawn(Enemy).id();
    
    // 这不会立即工作！实体还没有真正创建
    // commands.entity(entity).insert(Health(100.0)); // 错误！
}

// 正确的做法：一次性添加所有组件
fn spawn_correctly(mut commands: Commands) {
    commands.spawn((
        Enemy,
        Health(100.0),
        Transform::default(),
    ));
}
```

#### Commands 的高级用法

```rust
// 使用 Commands 修改现有实体
fn upgrade_player(
    mut commands: Commands,
    player_query: Query<Entity, With<Player>>
) {
    for entity in &player_query {
        // 添加新组件
        commands.entity(entity).insert(Shield(50.0));
        
        // 移除组件
        commands.entity(entity).remove::<Poison>();
    }
}

// 批量操作
fn spawn_wave(mut commands: Commands) {
    commands.spawn_batch((0..100).map(|i| {
        (
            Enemy,
            Health(100.0),
            Transform::from_xyz(i as f32 * 10.0, 0.0, 0.0),
        )
    }));
}
```

## 第三章：事件系统 - 让系统之间通信

### 3.1 发送和接收事件

事件是系统之间传递消息的方式。与直接调用函数不同，事件系统允许发送者和接收者完全解耦。

```rust
#[derive(Event)]
struct CollisionEvent {
    entity_a: Entity,
    entity_b: Entity,
}

// 发送事件的系统
fn detect_collisions(mut collision_events: EventWriter<CollisionEvent>) {
    // 检测到碰撞时
    collision_events.send(CollisionEvent {
        entity_a: entity1,
        entity_b: entity2,
    });
}

// 接收事件的系统
fn handle_collisions(mut collision_events: EventReader<CollisionEvent>) {
    for event in collision_events.read() {
        println!("碰撞发生: {:?} 撞到了 {:?}", event.entity_a, event.entity_b);
    }
}
```

#### 事件的生命周期

事件在 Bevy 中有特殊的生命周期：

```rust
// 事件会在两帧后自动清除
fn event_lifetime_demo(
    mut writer: EventWriter<MyEvent>,
    mut reader: EventReader<MyEvent>,
    mut frame_count: Local<u32>,
) {
    *frame_count += 1;
    
    if *frame_count == 1 {
        writer.send(MyEvent);
        println!("第1帧：发送事件");
    }
    
    // 事件可以在当前帧和下一帧读取
    for event in reader.read() {
        println!("第{}帧：读取到事件", frame_count);
    }
}
```

#### 复杂事件处理

```rust
#[derive(Event)]
struct DamageEvent {
    target: Entity,
    amount: f32,
    damage_type: DamageType,
}

#[derive(Debug)]
enum DamageType {
    Physical,
    Fire,
    Ice,
}

fn apply_damage(
    mut damage_events: EventReader<DamageEvent>,
    mut health_query: Query<&mut Health>,
) {
    for event in damage_events.read() {
        if let Ok(mut health) = health_query.get_mut(event.target) {
            let actual_damage = match event.damage_type {
                DamageType::Physical => event.amount,
                DamageType::Fire => event.amount * 1.5,
                DamageType::Ice => event.amount * 0.8,
            };
            health.0 -= actual_damage;
            println!("造成 {} 点 {:?} 伤害", actual_damage, event.damage_type);
        }
    }
}
```

### 3.2 Local - 系统的私有存储

有时你需要在系统运行之间保存一些数据：

```rust
fn enemy_spawner(
    mut commands: Commands,
    time: Res<Time>,
    mut spawn_timer: Local<f32>,  // 这个值会在每次调用之间保持
) {
    *spawn_timer += time.delta_seconds();
    
    if *spawn_timer > 2.0 {  // 每2秒生成一个敌人
        commands.spawn(Enemy);
        *spawn_timer = 0.0;
    }
}
```

#### Local 的多种用途

```rust
// 用于计数
fn count_frames(mut frame_count: Local<u32>) {
    *frame_count += 1;
    if *frame_count % 60 == 0 {
        println!("已经过了 {} 秒", *frame_count / 60);
    }
}

// 用于缓存复杂计算
fn expensive_calculation(
    query: Query<&Transform>,
    mut cached_result: Local<Option<Vec3>>,
) {
    if cached_result.is_none() {
        // 只在第一次运行时计算
        let sum = query.iter()
            .map(|t| t.translation)
            .fold(Vec3::ZERO, |acc, pos| acc + pos);
        *cached_result = Some(sum / query.iter().count() as f32);
    }
    
    let average_position = cached_result.unwrap();
    // 使用缓存的结果...
}

// 用于状态机
#[derive(Default)]
enum GameState {
    #[default]
    Menu,
    Playing,
    Paused,
}

fn game_state_machine(
    mut state: Local<GameState>,
    keyboard: Res<ButtonInput<KeyCode>>,
) {
    match *state {
        GameState::Menu => {
            if keyboard.just_pressed(KeyCode::Space) {
                *state = GameState::Playing;
                println!("开始游戏！");
            }
        }
        GameState::Playing => {
            if keyboard.just_pressed(KeyCode::Escape) {
                *state = GameState::Paused;
                println!("游戏暂停");
            }
        }
        GameState::Paused => {
            if keyboard.just_pressed(KeyCode::Escape) {
                *state = GameState::Playing;
                println!("继续游戏");
            }
        }
    }
}
```

### 3.3 Trigger 和观察者模式

Trigger 是 Bevy 中较新的特性，用于创建响应式系统：

```rust
#[derive(Event)]
struct PlayerLevelUp {
    new_level: u32,
}

// 观察者系统 - 当事件触发时立即执行
fn on_level_up(trigger: Trigger<PlayerLevelUp>) {
    println!("恭喜！升到{}级！", trigger.event().new_level);
    // 播放音效、显示特效等
}

// 在应用中注册观察者
fn setup_observers(app: &mut App) {
    app.add_observer(on_level_up);
}
```

观察者与普通事件的区别：

- **普通事件**：在下一帧的事件处理阶段被处理
- **观察者**：在事件触发时立即同步执行

## 第四章：组合参数 - 让代码更整洁

### 4.1 当参数太多时怎么办？

当系统需要很多参数时，可以创建自定义的系统参数：

```rust
// 不好的做法：参数太多
fn complex_system(
    time: Res<Time>,
    score: ResMut<GameScore>,
    player_query: Query<&mut Transform, With<Player>>,
    enemy_query: Query<&Transform, With<Enemy>>,
    mut commands: Commands,
    mut damage_events: EventWriter<DamageEvent>,
    mut sound_events: EventWriter<SoundEvent>,
) {
    // 系统逻辑...
}

// 好的做法：使用自定义参数
#[derive(SystemParam)]
struct GameSystemParams<'w, 's> {
    time: Res<'w, Time>,
    score: ResMut<'w, GameScore>,
    player_query: Query<'w, 's, &'static mut Transform, With<Player>>,
    enemy_query: Query<'w, 's, &'static Transform, With<Enemy>>,
    commands: Commands<'w, 's>,
}

// 甚至可以分组事件
#[derive(SystemParam)]
struct GameEvents<'w> {
    damage: EventWriter<'w, DamageEvent>,
    sound: EventWriter<'w, SoundEvent>,
    particle: EventWriter<'w, ParticleEvent>,
}

fn clean_system(
    mut params: GameSystemParams,
    mut events: GameEvents,
) {
    // 现在代码更清晰了！
    if params.time.delta_seconds() > 0.0 {
        events.sound.send(SoundEvent::Tick);
    }
}
```

#### 为自定义参数添加方法

```rust
#[derive(SystemParam)]
struct PlayerController<'w, 's> {
    player_query: Query<'w, 's, (&'static mut Transform, &'static Health), With<Player>>,
    input: Res<'w, ButtonInput<KeyCode>>,
    time: Res<'w, Time>,
}

impl<'w, 's> PlayerController<'w, 's> {
    fn move_player(&mut self, speed: f32) {
        let movement = self.get_movement_vector() * speed * self.time.delta_seconds();
        
        for (mut transform, _) in &mut self.player_query {
            transform.translation += movement;
        }
    }
    
    fn get_movement_vector(&self) -> Vec3 {
        let mut movement = Vec3::ZERO;
        
        if self.input.pressed(KeyCode::KeyW) { movement.z -= 1.0; }
        if self.input.pressed(KeyCode::KeyS) { movement.z += 1.0; }
        if self.input.pressed(KeyCode::KeyA) { movement.x -= 1.0; }
        if self.input.pressed(KeyCode::KeyD) { movement.x += 1.0; }
        
        movement.normalize_or_zero()
    }
    
    fn is_player_alive(&self) -> bool {
        self.player_query.iter().any(|(_, health)| health.0 > 0.0)
    }
}

// 使用起来非常简洁
fn player_movement_system(mut controller: PlayerController) {
    if controller.is_player_alive() {
        controller.move_player(5.0);
    }
}
```

### 4.2 解决查询冲突

有时两个查询可能会冲突：

```rust
// 这会出错！两个查询都想修改 Health
fn bad_system(
    mut player_health: Query<&mut Health, With<Player>>,
    mut enemy_health: Query<&mut Health, With<Enemy>>,
) {
    // Bevy 不知道是否有实体同时是 Player 和 Enemy
}

// 使用 ParamSet 解决
fn good_system(
    mut set: ParamSet<(
        Query<&mut Health, With<Player>>,
        Query<&mut Health, With<Enemy>>,
    )>,
) {
    // 先处理玩家
    for mut health in set.p0().iter_mut() {
        health.0 = 100.0;
    }
    
    // 再处理敌人
    for mut health in set.p1().iter_mut() {
        health.0 = 50.0;
    }
}
```

#### ParamSet 的高级用法

```rust
// 处理复杂的查询冲突
fn complex_param_set(
    mut set: ParamSet<(
        Query<(&Transform, &mut Health), With<Player>>,
        Query<(&Transform, &mut Health), With<Enemy>>,
        Query<&mut Health>,  // 访问所有 Health
    )>,
) {
    // 第一步：记录玩家位置
    let player_positions: Vec<Vec3> = set.p0()
        .iter()
        .map(|(transform, _)| transform.translation)
        .collect();
    
    // 第二步：检查敌人是否靠近玩家
    let mut enemies_to_damage = Vec::new();
    for (transform, health) in set.p1().iter() {
        for player_pos in &player_positions {
            if transform.translation.distance(*player_pos) < 50.0 {
                enemies_to_damage.push((transform.translation, health.0));
            }
        }
    }
    
    // 第三步：应用伤害到所有实体
    for mut health in set.p2().iter_mut() {
        // 基于之前收集的信息修改 health
    }
}
```

### 4.3 自定义 QueryData

当查询变得复杂时，可以创建自定义的查询数据结构：

```rust
#[derive(QueryData)]
#[query_data(mutable)]  // 允许可变访问
struct CharacterData {
    entity: Entity,
    health: &'static mut Health,
    transform: &'static mut Transform,
    name: &'static Name,
}

// 现在查询更加清晰
fn process_characters(mut query: Query<CharacterData>) {
    for mut character in &mut query {
        if character.health.0 < 50.0 {
            println!("{} 需要治疗！", character.name.0);
        }
        
        // 直接访问字段，而不是元组
        character.transform.translation.y += 1.0;
    }
}

// 甚至可以嵌套 QueryData
#[derive(QueryData)]
struct CombatData {
    health: &'static Health,
    damage: Option<&'static Damage>,
    armor: Option<&'static Armor>,
}

#[derive(QueryData)]
struct FullCharacterData {
    basic: CharacterData,
    combat: CombatData,
}
```

## 第五章：高级话题 - 独占系统

有时你需要完全控制整个游戏世界：

```rust
fn load_game_save(world: &mut World) {
    // 清空当前世界
    world.clear_entities();
    
    // 加载存档数据...
    // 这种操作需要独占访问
}
```

独占系统很强大，但要谨慎使用，因为它们会暂停所有其他系统的并行执行。

### 5.1 何时使用独占系统

独占系统适用于以下场景：

```rust
// 场景1：需要立即看到修改结果
fn spawn_and_configure(world: &mut World) {
    // 创建实体
    let entity = world.spawn((
        Enemy,
        Health(100.0),
    )).id();
    
    // 立即可以查询和修改！
    let mut health = world.get_mut::<Health>(entity).unwrap();
    health.0 = 150.0;
}

// 场景2：批量操作
fn reset_level(world: &mut World) {
    // 删除所有敌人
    let enemies: Vec<Entity> = world
        .query_filtered::<Entity, With<Enemy>>()
        .iter(world)
        .collect();
    
    for entity in enemies {
        world.despawn(entity);
    }
    
    // 立即生成新的敌人
    for i in 0..10 {
        world.spawn((
            Enemy,
            Health(100.0),
            Transform::from_xyz(i as f32 * 100.0, 0.0, 0.0),
        ));
    }
}

// 场景3：复杂的初始化逻辑
fn initialize_game_world(world: &mut World) {
    // 创建游戏管理器
    let manager = world.spawn(GameManager::default()).id();
    
    // 创建玩家并关联到管理器
    let player = world.spawn((
        Player,
        Health(100.0),
        ManagedBy(manager),
    )).id();
    
    // 更新管理器以引用玩家
    world.get_mut::<GameManager>(manager).unwrap().player = Some(player);
}
```

### 5.2 在独占系统中使用 SystemState 

虽然独占系统可以直接访问 World，但有时使用熟悉的系统参数 API 更方便：

```rust
use bevy::ecs::system::SystemState;

fn exclusive_with_system_state(world: &mut World) {
    // 创建一个 SystemState 来使用常规系统参数
    let mut system_state: SystemState<(
        Query<&mut Health, With<Player>>,
        Res<Time>,
    )> = SystemState::new(world);
    
    // 获取参数
    let (mut health_query, time) = system_state.get_mut(world);
    
    // 像在普通系统中一样使用
    for mut health in &mut health_query {
        health.0 += 10.0 * time.delta_seconds();
    }
    
    // 必须在访问 world 之前调用 apply
    system_state.apply(world);
}

// 使用 Local 缓存 SystemState
fn cached_system_state(
    world: &mut World,
    state: &mut Local<Option<SystemState<Query<&mut Transform>>>>,
) {
    // 懒初始化
    let system_state = state.get_or_insert_with(|| {
        SystemState::new(world)
    });
    
    let mut query = system_state.get_mut(world);
    for mut transform in &mut query {
        transform.rotate_y(0.01);
    }
    
    system_state.apply(world);
}
```

### 5.3 独占系统的最佳实践

```rust
// 好的实践：明确的初始化阶段
fn setup_game(world: &mut World) {
    // 在游戏开始时运行一次
    world.insert_resource(GameSettings::default());
    world.insert_resource(PlayerStats::default());
    
    // 生成初始实体
    spawn_player(world);
    spawn_initial_enemies(world);
}

// 避免：频繁使用独占系统
fn bad_practice(world: &mut World) {
    // 不要在每帧都这样做！
    let count = world.query::<&Enemy>().iter(world).count();
    if count < 10 {
        world.spawn(Enemy);
    }
}

// 更好的做法：使用常规系统
fn good_practice(
    mut commands: Commands,
    enemy_query: Query<Entity, With<Enemy>>,
) {
    let count = enemy_query.iter().count();
    if count < 10 {
        commands.spawn(Enemy);
    }
}
```

## 第六章：最佳实践总结

### 选择正确的参数类型

1. **需要查询实体？** → 使用 `Query<T>`
2. **需要全局数据？** → 使用 `Res<T>` 或 `ResMut<T>`
3. **需要创建/删除实体？** → 使用 `Commands`
4. **需要系统间通信？** → 使用事件（`EventWriter`/`EventReader`）
5. **需要保存状态？** → 使用 `Local<T>`
6. **需要立即看到修改？** → 考虑独占系统（但尽量避免）

### 常见模式示例

```rust
// 典型的游戏系统
fn typical_game_system(
    time: Res<Time>,
    mut score: ResMut<GameScore>,
    mut player_query: Query<(&mut Transform, &Health), With<Player>>,
    mut commands: Commands,
    mut damage_events: EventReader<DamageEvent>,
) {
    // 处理伤害事件
    for event in damage_events.read() {
        // 应用伤害逻辑
        if let Ok((_, health)) = player_query.get(event.target) {
            if health.0 <= 0.0 {
                commands.entity(event.target).despawn();
                score.deaths += 1;
            }
        }
    }
    
    // 更新玩家
    for (mut transform, health) in &mut player_query {
        if health.0 > 0.0 {
            // 移动逻辑
            transform.translation.x += 100.0 * time.delta_seconds();
        }
    }
}

// 初始化系统
fn setup_system(mut commands: Commands) {
    // 创建游戏实体
    commands.spawn((
        Player,
        Health(100.0),
        Transform::default(),
        Name("玩家1".to_string()),
    ));
    
    // 创建UI摄像机
    commands.spawn(Camera2dBundle::default());
}

// 清理系统
fn cleanup_system(
    mut commands: Commands,
    entity_query: Query<Entity, With<Temporary>>,
) {
    for entity in &entity_query {
        commands.entity(entity).despawn_recursive();
    }
}
```

### 性能优化技巧

```rust
// 1. 使用变更检测减少不必要的工作
fn optimize_with_change_detection(
    query: Query<(&Transform, &Sprite), Changed<Transform>>,
) {
    // 只处理 Transform 变化的实体
    for (transform, sprite) in &query {
        // 更新渲染相关的数据
    }
}

// 2. 合理使用 ParamSet 而不是多个系统
fn combined_system(
    mut set: ParamSet<(
        Query<&mut Health, With<Player>>,
        Query<&mut Health, With<Enemy>>,
    )>,
) {
    // 在一个系统中处理相关逻辑，减少系统调度开销
}

// 3. 缓存复杂计算
fn cached_calculation(
    query: Query<&Transform, With<Enemy>>,
    mut cache: Local<Option<Vec3>>,
    mut timer: Local<Timer>,
    time: Res<Time>,
) {
    timer.tick(time.delta());
    
    // 每秒更新一次缓存
    if timer.finished() {
        let center = query.iter()
            .map(|t| t.translation)
            .fold(Vec3::ZERO, |acc, pos| acc + pos)
            / query.iter().count().max(1) as f32;
        *cache = Some(center);
    }
}
```

### 调试技巧

1. **系统参数冲突？**
    
    - 检查是否有多个参数试图同时修改相同的组件
    - 使用 `ParamSet` 解决冲突
    - 考虑拆分成多个系统
2. **Commands 没生效？**
    
    - 记住它们是延迟执行的
    - 在需要立即生效的场景使用独占系统
    - 检查实体是否在 Commands 执行前被删除
3. **事件丢失？**
    
    - 确保 EventReader 在每帧都被读取
    - 事件只保留两帧
    - 考虑使用 State 或 Resource 存储持久数据
4. **性能问题？**
    
    - 使用 Tracy 或其他性能分析工具
    - 检查是否有不必要的独占系统
    - 优化 Query 过滤器

### 系统参数完整参考表

下表总结了 Bevy 中所有主要的系统参数类型：

|参数类型|类别|访问类型|调度影响|主要用例|
|---|---|---|---|---|
|`Query<D, F>`|数据访问|读/写|并行|迭代和操作拥有特定组件的实体|
|`Res<T>`|全局状态|只读|并行|读取全局资源，如配置、时间|
|`ResMut<T>`|全局状态|可写|独占资源|修改全局资源，如游戏分数、设置|
|`Commands`|世界变更|可写(延迟)|并行|延迟地创建/销毁实体，添加/移除组件|
|`EventWriter<E>`|事件驱动|可写|并行|发布事件，用于系统间解耦通信|
|`EventReader<E>`|事件驱动|只读|并行|订阅并读取事件|
|`Local<T>`|系统状态|读/写|并行|在系统多次运行间维持本地状态|
|`In<T>`|系统间通信|只读|依赖前序|接收前一个"管道"系统的输出|
|`Trigger<E>`|响应式逻辑|只读|同步|在观察者中对触发的事件做出即时反应|
|`NonSend<T>`|线程不安全|只读|主线程|访问非 Send 资源|
|`NonSendMut<T>`|线程不安全|可写|主线程|可变地访问非 Send 资源|
|`&mut World`|独占访问|读/写|独占(串行)|完全、立即地访问和修改整个 World|
|`SystemState<P>`|独占访问|读/写|独占(串行)|在独占系统内模拟常规系统参数|
|`QueryState<Q>`|独占访问|读/写|独占(串行)|在独占系统内执行查询|
|`SystemName`|元数据|只读|并行|获取当前系统的名称|
|`Entities`|元数据|只读|并行|访问所有实体的元数据|
|`Components`|元数据|只读|并行|访问所有已注册组件的元数据|
|`Archetypes`|元数据|只读|并行|访问 World 中所有原型的元数据|
|`RemovedComponents<T>`|变更检测|只读|并行|获取被移除特定组件的实体列表|

### Commands vs. 独占系统对比表

|特性|Commands|&mut World (独占系统)|
|---|---|---|
|执行模型|异步/延迟执行|同步/立即执行|
|并行性|高（可以与其他系统并行）|无（阻塞所有其他系统）|
|数据可见性|延迟（下一个命令刷新点后）|立即可见|
|性能(零星变更)|优（不阻塞并行）|差（中断并行执行）|
|性能(批量变更)|中等（命令队列开销）|优（直接操作）|
|典型用例|常规游戏逻辑、响应输入|初始化、场景加载、复杂原子操作|
|使用难度|简单|较复杂|
|安全性|高（自动处理）|需要手动管理|

## 总结

Bevy 的系统参数让你能够：

- 用简单的函数签名声明需要什么数据
- 让 Bevy 自动处理数据获取和并行执行
- 专注于游戏逻辑而不是底层细节

从简单的 `Query` 和 `Res` 开始，逐步学习更高级的参数类型。记住，好的 Bevy 代码应该是清晰、声明式的——让参数类型告诉读者这个系统在做什么。

### 下一步

1. 尝试修改示例代码，看看会发生什么
2. 创建自己的组件和系统
3. 实验不同的参数组合
4. 遇到问题时，查看 [Bevy 官方文档](https://bevyengine.org/)
5. 加入 Bevy 社区，与其他开发者交流

### 推荐学习路径

1. **基础阶段**：掌握 Query、Res/ResMut、Commands
2. **进阶阶段**：学习事件系统、Local、变更检测
3. **高级阶段**：自定义 SystemParam、ParamSet、独占系统
4. **精通阶段**：性能优化、复杂架构设计

祝你在 Bevy 的学习之旅中玩得开心！记住，每个 Bevy 专家都是从第一个 `Query` 开始的。