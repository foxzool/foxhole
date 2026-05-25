---
title: "Bevy 0.16 状态管理初学者指南"
Status: 🟩
tags:
  - note
  - output/blog
Links:
  - "[[Bevy MOC]]"
Created: 2025-06-17
BevyVersion: "0.16"
share: true
Finished: 2025-06-17
---
Bevy 的状态管理系统提供了一种强大的方式来控制系统何时运行，实现游戏不同阶段（如菜单、游戏玩法和暂停屏幕）之间的清晰分离。**状态充当应用程序级的有限状态机，决定系统执行流程**，使其成为组织复杂游戏逻辑和确保整个应用程序生命周期中适当资源管理的关键。

理解 Bevy 的状态系统至关重要，因为它与 ECS 调度器深度集成，让你能够构建响应迅速、组织良好的游戏，其中不同的系统基于游戏的当前阶段激活和停用。自 Bevy 0.12 以来，该系统已显著简化，并在 **Bevy 0.16** 中达到成熟稳定状态，新增了 StateScoped 组件等强大功能，使状态管理更加直观和高效。

## Bevy ECS 中的状态是什么

Bevy 中的状态是**基于枚举的有限状态机**，在应用程序级别控制系统执行。与属于特定实体的组件不同，状态是影响每帧运行哪些系统的全局资源。它们通过提供运行条件来工作，这些条件根据当前应用程序状态启用或禁用整个系统组。

状态系统通过专门的运行条件和转换调度与 Bevy 的调度器集成。当你定义一个状态时，Bevy 会自动创建必要的基础设施来跟踪状态变化、管理转换，并为设置和清理操作提供钩子。**状态特别强大，因为它们可以完全消除不必要的系统执行**，通过确保每个应用程序阶段只运行相关系统来提高性能。

状态与常规资源的不同之处在于它们具有特殊的生命周期管理——当转换发生时触发特定的调度（`OnEnter`、`OnExit`）并提供内置的运行条件（`in_state`）。这使它们非常适合管理主要的应用程序阶段，如游戏状态、菜单系统和暂停功能，在这些地方你需要对系统执行时机进行精确控制。

## 使用 State trait 定义状态

创建状态需要派生 `States` trait 和几个支持的 trait。**最重要的要求是 `Default` 实现**，它定义了应用程序启动时的初始状态：

```rust
use bevy::prelude::*;

#[derive(States, Default, Debug, Clone, Eq, PartialEq, Hash)]
enum GameState {
    #[default]  // 这将是初始状态
    MainMenu,
    Loading,
    InGame,
    Paused,
    GameOver,
}
```

所需的派生具有特定用途：`States` 提供核心状态功能，`Default` 设置初始状态，`Debug` 启用日志和调试，`Clone` 允许状态被复制，`Eq + PartialEq + Hash` 使状态能够在 Bevy 调度器所需的集合和比较中使用。

你可以为不同的关注点创建多个独立的状态类型。例如，你可能有用于应用程序流（`AppState`）和游戏机制（`PausedState`）的单独状态：

```rust
#[derive(States, Default, Debug, Clone, Eq, PartialEq, Hash)]
enum AppState {
    #[default]
    Menu,
    InGame,
    Settings,
}

#[derive(States, Default, Debug, Clone, Eq, PartialEq, Hash)]
enum PausedState {
    #[default]
    Running,
    Paused,
}
```

**Bevy 0.16 使用 `init_state::<T>()`** 而不是较旧的 `add_state()` 方法。这个简化的 API 自动使用你的枚举的 `Default` 实现来设置初始状态：

```rust
fn main() {
    App::new()
        .add_plugins(DefaultPlugins)
        .init_state::<GameState>()      // 使用 Default 作为初始状态
        .init_state::<PausedState>()    // 支持多个状态
        .run();
}
```

## 在系统中通过运行条件使用状态

使用状态的最常见方式是通过**控制系统何时执行的运行条件**。`in_state()` 函数创建一个运行条件，只允许系统在特定状态下运行：

```rust
fn main() {
    App::new()
        .add_plugins(DefaultPlugins)
        .init_state::<GameState>()
        
        // 只在特定状态下运行的系统
        .add_systems(Update, (
            menu_system.run_if(in_state(GameState::MainMenu)),
            gameplay_system.run_if(in_state(GameState::InGame)),
            pause_system.run_if(in_state(GameState::Paused)),
        ))
        
        .run();
}

fn menu_system(/* 参数 */) {
    // 这只在 GameState 为 MainMenu 时运行
    println!("运行菜单逻辑");
}

fn gameplay_system(/* 参数 */) {
    // 这只在 GameState 为 InGame 时运行
    println!("运行游戏玩法逻辑");
}
```

你可以组合多个状态条件以实现复杂逻辑。系统可以同时依赖多个状态：

```rust
.add_systems(Update, (
    // 只在两个条件都为真时运行
    active_gameplay_system
        .run_if(in_state(AppState::InGame))
        .run_if(in_state(PausedState::Running)),
    
    // 在游戏中运行，无论暂停状态如何
    ui_system.run_if(in_state(AppState::InGame)),
))
```

**为了更好的组织，使用系统集**来分组具有共享状态条件的相关系统：

```rust
#[derive(SystemSet, Debug, Hash, PartialEq, Eq, Clone)]
enum GameSystemSet {
    Input,
    Logic,
    Rendering,
}

fn main() {
    App::new()
        .add_plugins(DefaultPlugins)
        .init_state::<GameState>()
        
        // 配置带有状态条件的系统集
        .configure_sets(Update, (
            GameSystemSet::Input
                .run_if(in_state(GameState::InGame))
                .run_if(in_state(PausedState::Running)),
            GameSystemSet::Logic
                .after(GameSystemSet::Input)
                .run_if(in_state(GameState::InGame))
                .run_if(in_state(PausedState::Running)),
            GameSystemSet::Rendering
                .after(GameSystemSet::Logic)
                .run_if(in_state(GameState::InGame)),
        ))
        
        // 将系统添加到集合中
        .add_systems(Update, (
            (player_input, ui_input).in_set(GameSystemSet::Input),
            (player_movement, enemy_ai).in_set(GameSystemSet::Logic),
            (update_sprites, update_ui).in_set(GameSystemSet::Rendering),
        ))
        
        .run();
}
```

## 通过 OnEnter、OnExit 和 OnUpdate 进行状态转换

Bevy 提供了在状态转换期间运行的特殊调度，允许你在状态改变时精确地执行设置和清理操作。**这些转换调度是基于状态的应用程序中适当资源管理的关键**。

### OnEnter 系统

`OnEnter` 系统在进入特定状态时只运行一次。它们非常适合初始化、生成实体、加载资源和设置特定状态的数据：

```rust
fn main() {
    App::new()
        .add_plugins(DefaultPlugins)
        .init_state::<GameState>()
        
        // 进入状态时运行一次的设置系统
        .add_systems(OnEnter(GameState::MainMenu), (
            setup_menu_ui,
            play_menu_music,
            setup_menu_camera,
        ))
        .add_systems(OnEnter(GameState::InGame), (
            spawn_player,
            spawn_enemies,
            setup_game_camera,
            start_game_timer,
        ))
        
        .run();
}

fn setup_menu_ui(mut commands: Commands) {
    println!("设置菜单 UI");
    commands.spawn((
        Button,
        Node {
            width: Val::Px(200.0),
            height: Val::Px(50.0),
            justify_content: JustifyContent::Center,
            align_items: AlignItems::Center,
            ..default()
        },
        BackgroundColor(Color::srgb(0.15, 0.15, 0.15)),
    ));
}

fn spawn_player(mut commands: Commands) {
    println!("生成玩家");
    commands.spawn((
        Player,
        Transform::from_translation(Vec3::new(0.0, 0.0, 0.0)),
        Visibility::default(),
    ));
}
```

### OnExit 系统

`OnExit` 系统在离开特定状态时只运行一次。它们对于清理、保存数据和资源管理至关重要：

```rust
.add_systems(OnExit(GameState::MainMenu), (
    cleanup_menu_ui,  
    stop_menu_music,
))
.add_systems(OnExit(GameState::InGame), (
    save_game_state,
    cleanup_game_entities,
))

fn cleanup_menu_ui(mut commands: Commands, query: Query<Entity, With<Button>>) {
    println!("清理菜单 UI");
    for entity in &query {
        commands.entity(entity).despawn();
    }
}

fn save_game_state(query: Query<&Transform, With<Player>>) {
    println!("保存游戏状态");
    for transform in &query {
        println!("玩家位置: {:?}", transform.translation);
        // 保存到文件或资源
    }
}
```

### 使用运行条件的 OnUpdate 等效

虽然没有明确的 `OnUpdate` 调度，但具有 `run_if(in_state())` 条件的系统有效地实现了这一目的，在特定状态下每帧运行：

```rust
.add_systems(Update, (
    // 这些在相应状态下每帧运行
    handle_menu_input.run_if(in_state(GameState::MainMenu)),
    (
        player_movement,
        enemy_ai,
        handle_game_input,
    ).run_if(in_state(GameState::InGame)),
    handle_pause_input.run_if(in_state(GameState::Paused)),
))
```

## 通过 NextState 触发状态转换

状态转换通过 `NextState<T>` 资源触发，它为下一帧排队状态更改。**永远不要直接修改 `State<T>` 资源** - 总是使用 `NextState<T>` 来确保正确的转换处理：

```rust
fn handle_menu_input(
    mut next_state: ResMut<NextState<GameState>>,
    input: Res<ButtonInput<KeyCode>>,
) {
    if input.just_pressed(KeyCode::Enter) {
        next_state.set(GameState::InGame);  // 排队转换
    }
}

fn handle_game_input(
    mut next_state: ResMut<NextState<GameState>>,
    input: Res<ButtonInput<KeyCode>>,
) {
    if input.just_pressed(KeyCode::Escape) {
        next_state.set(GameState::Paused);
    }
}

fn check_game_over(
    mut next_state: ResMut<NextState<GameState>>,
    query: Query<&Health, With<Player>>,
) {
    for health in &query {
        if health.current <= 0 {
            next_state.set(GameState::GameOver);
        }
    }
}
```

**状态转换发生在 `StateTransition` 调度期间**，它在 `PreUpdate` 之后但在 `Update` 之前运行。这意味着在一帧期间排队的转换在下一帧的 `Update` 系统运行之前生效。你可以在单帧中排队多个状态更改 - 只有最终值重要。

要同时管理多个状态，在同一系统中更新它们以确保一致性：

```rust
fn start_multiplayer_game(
    mut next_app: ResMut<NextState<AppState>>,
    mut next_mode: ResMut<NextState<GameMode>>,
) {
    next_app.set(AppState::InGame);
    next_mode.set(GameMode::Multiplayer);
}
```

## 完整实用示例：游戏状态

## 完整实用示例：Bevy 0.16 游戏状态

这是一个完整的可运行示例，演示了 Bevy 0.16 中典型的游戏状态设置，包括 MainMenu、InGame、Paused 和 GameOver 状态，以及新的 StateScoped 组件功能：

```rust
use bevy::prelude::*;

#[derive(States, Default, Debug, Clone, Eq, PartialEq, Hash)]
enum GameState {
    #[default]
    MainMenu,
    InGame,
    Paused,
    GameOver,
}

#[derive(Resource)]
struct GameTimer(Timer);

#[derive(Resource)]
struct Score(u32);

#[derive(Component)]
struct Player;

#[derive(Component)]
struct Health {
    current: i32,
    max: i32,
}

fn main() {
    App::new()
        .add_plugins(DefaultPlugins)
        .init_state::<GameState>()
        .enable_state_scoped_entities::<GameState>()  // 启用 StateScoped 功能
        .insert_resource(Score(0))
        
        // 设置系统 (OnEnter)
        .add_systems(OnEnter(GameState::MainMenu), setup_main_menu)
        .add_systems(OnEnter(GameState::InGame), setup_game)
        .add_systems(OnEnter(GameState::Paused), setup_pause_screen)
        .add_systems(OnEnter(GameState::GameOver), setup_game_over)
        
        // 清理系统 (OnExit) - StateScoped 实体会自动清理
        .add_systems(OnExit(GameState::MainMenu), cleanup_menu)
        .add_systems(OnExit(GameState::InGame), cleanup_game)
        .add_systems(OnExit(GameState::Paused), cleanup_pause)
        .add_systems(OnExit(GameState::GameOver), cleanup_game_over)
        
        // 更新系统 (在状态中每帧运行)
        .add_systems(Update, (
            menu_input.run_if(in_state(GameState::MainMenu)),
            (
                player_movement,
                update_game_timer,
                check_game_over,
                handle_pause_toggle,
            ).run_if(in_state(GameState::InGame)),
            pause_input.run_if(in_state(GameState::Paused)),
            game_over_input.run_if(in_state(GameState::GameOver)),
        ))
        
        .run();
}

// 设置系统
fn setup_main_menu(mut commands: Commands) {
    println!("=== 主菜单 ===");
    println!("按 ENTER 开始游戏");
    
    // StateScoped 实体会在离开主菜单时自动清理
    commands.spawn((
        StateScoped(GameState::MainMenu),
        Node {
            width: Val::Px(200.0),
            height: Val::Px(50.0),
            justify_content: JustifyContent::Center,
            align_items: AlignItems::Center,
            ..default()
        },
        BackgroundColor(Color::srgb(0.15, 0.15, 0.15)),
    ));
}

fn setup_game(mut commands: Commands) {
    println!("=== 游戏开始 ===");
    
    // 生成玩家 - 使用 StateScoped 自动清理
    commands.spawn((
        StateScoped(GameState::InGame),
        Player,
        Health { current: 100, max: 100 },
        Transform::from_translation(Vec3::new(0.0, 0.0, 0.0)),
    ));
    
    // 启动游戏计时器
    commands.insert_resource(GameTimer(Timer::from_seconds(30.0, TimerMode::Once)));
    
    println!("玩家已生成！使用 WASD 移动，ESC 暂停");
}

fn setup_pause_screen(mut commands: Commands) {
    println!("=== 游戏暂停 ===");
    println!("按 ESC 继续，Q 退出到菜单");
    
    // 暂停界面 UI
    commands.spawn((
        StateScoped(GameState::Paused),
        Node {
            width: Val::Percent(100.0),
            height: Val::Percent(100.0),
            justify_content: JustifyContent::Center,
            align_items: AlignItems::Center,
            ..default()
        },
        BackgroundColor(Color::srgba(0.0, 0.0, 0.0, 0.8)),
    ));
}

fn setup_game_over(score: Res<Score>) {
    println!("=== 游戏结束 ===");
    println!("最终得分: {}", score.0);
    println!("按 R 重新开始，Q 退出到菜单");
}

// 清理系统 - 大部分清理现在由 StateScoped 自动处理
fn cleanup_menu(mut commands: Commands) {
    println!("清理菜单 - StateScoped 实体自动销毁");
}

fn cleanup_game(mut commands: Commands) {
    println!("清理游戏 - StateScoped 实体自动销毁");
    // 只需要清理非 StateScoped 的资源
    commands.remove_resource::<GameTimer>();
}

fn cleanup_pause(mut commands: Commands) {
    println!("清理暂停屏幕 - StateScoped 实体自动销毁");
}

fn cleanup_game_over(mut commands: Commands) {
    println!("清理游戏结束屏幕");
}

// 输入和更新系统
fn menu_input(
    mut next_state: ResMut<NextState<GameState>>,
    input: Res<ButtonInput<KeyCode>>,
) {
    if input.just_pressed(KeyCode::Enter) {
        next_state.set(GameState::InGame);
    }
}

fn player_movement(
    mut query: Query<&mut Transform, With<Player>>,
    input: Res<ButtonInput<KeyCode>>,
    time: Res<Time>,
) {
    for mut transform in &mut query {
        let mut direction = Vec3::ZERO;
        
        if input.pressed(KeyCode::KeyW) { direction.y += 1.0; }
        if input.pressed(KeyCode::KeyS) { direction.y -= 1.0; }
        if input.pressed(KeyCode::KeyA) { direction.x -= 1.0; }
        if input.pressed(KeyCode::KeyD) { direction.x += 1.0; }
        
        transform.translation += direction * 100.0 * time.delta_secs();
        
        if direction != Vec3::ZERO {
            println!("玩家位置: {:?}", transform.translation);
        }
    }
}

fn update_game_timer(
    mut timer: ResMut<GameTimer>,
    time: Res<Time>,
    mut next_state: ResMut<NextState<GameState>>,
    mut score: ResMut<Score>,
) {
    if timer.0.tick(time.delta()).finished() {
        score.0 += 100; // 生存奖励
        next_state.set(GameState::GameOver);
    }
}

fn check_game_over(
    mut next_state: ResMut<NextState<GameState>>,
    query: Query<&Health, With<Player>>,
) {
    for health in &query {
        if health.current <= 0 {
            next_state.set(GameState::GameOver);
        }
    }
}

fn handle_pause_toggle(
    mut next_state: ResMut<NextState<GameState>>,
    input: Res<ButtonInput<KeyCode>>,
) {
    if input.just_pressed(KeyCode::Escape) {
        next_state.set(GameState::Paused);
    }
}

fn pause_input(
    mut next_state: ResMut<NextState<GameState>>,
    input: Res<ButtonInput<KeyCode>>,
) {
    if input.just_pressed(KeyCode::Escape) {
        next_state.set(GameState::InGame);
    }
    if input.just_pressed(KeyCode::KeyQ) {
        next_state.set(GameState::MainMenu);
    }
}

fn game_over_input(
    mut next_state: ResMut<NextState<GameState>>,
    input: Res<ButtonInput<KeyCode>>,
    mut score: ResMut<Score>,
) {
    if input.just_pressed(KeyCode::KeyR) {
        score.0 = 0;  // 重置得分
        next_state.set(GameState::InGame);
    }
    if input.just_pressed(KeyCode::KeyQ) {
        next_state.set(GameState::MainMenu);
    }
}
```

这个示例演示了 Bevy 0.16 的所有关键概念：状态定义、设置/清理系统、状态依赖的更新系统、由用户输入和游戏条件触发的状态转换，以及新的 StateScoped 自动实体清理功能。

## Bevy 0.16 状态管理最佳实践

**始终为 OnEnter 和 OnExit 系统配对**以实现适当的资源生命周期管理。在 OnEnter 系统中生成的每个实体都应该在 OnExit 系统中有相应的清理，以防止内存泄漏并确保干净的状态转换。

**使用系统集来组织相关功能**。将协同工作的系统分组，并将状态条件应用于整个集合而不是单个系统。这提高了性能并使你的代码更易于维护：

```rust
#[derive(SystemSet, Debug, Hash, PartialEq, Eq, Clone)]
enum GameplaySet {
    Input,
    Logic,
    Rendering,
}

app.configure_sets(Update, (
    GameplaySet::Input.run_if(in_state(GameState::InGame)),
    GameplaySet::Logic.after(GameplaySet::Input).run_if(in_state(GameState::InGame)),
    GameplaySet::Rendering.after(GameplaySet::Logic).run_if(in_state(GameState::InGame)),
));
```

**为独立关注点使用多个正交状态**。与其创建试图捕获每种可能组合的复杂状态枚举，不如为应用程序的不同方面创建单独的状态类型：

```rust
#[derive(States, Default, Debug, Clone, Eq, PartialEq, Hash)]
enum AppState { #[default] Menu, InGame, Settings }

#[derive(States, Default, Debug, Clone, Eq, PartialEq, Hash)]  
enum PausedState { #[default] Running, Paused }

#[derive(States, Default, Debug, Clone, Eq, PartialEq, Hash)]
enum NetworkState { #[default] Offline, Connecting, Online }
```

**使用 StateScoped 组件实现自动实体清理**（Bevy 0.16 的重要新功能）：

```rust
// 启用状态范围的实体清理
app.enable_state_scoped_entities::<GameState>();

// 具有此组件的实体在离开状态时会自动清理
commands.spawn((
    StateScoped(GameState::InGame),
    Player,
    Transform::default(),
));
```

### StateScoped 组件的优势

StateScoped 是 Bevy 0.16 中最重要的新功能之一，提供了自动的实体生命周期管理：

- **自动清理**：标记了 `StateScoped(state)` 的实体在离开该状态时自动销毁
- **递归销毁**：如果使用 bevy_hierarchy（默认启用），会递归销毁子实体
- **Observer 集成**：与 OnRemove observers 完美集成
- **减少样板代码**：不再需要手动编写清理系统

```rust
fn setup_game_entities(mut commands: Commands) {
    // 这些实体会在离开 InGame 状态时自动清理
    commands.spawn((
        StateScoped(GameState::InGame),
        Player,
        Health { current: 100, max: 100 },
        Transform::from_translation(Vec3::ZERO),
    ));
    
    commands.spawn((
        StateScoped(GameState::InGame),
        Enemy,
        Transform::from_translation(Vec3::new(10.0, 0.0, 0.0)),
    ));
}
```

## 避免常见初学者错误

**不要直接修改 State<T>** - 始终使用 NextState<T> 来排队状态更改。直接修改状态资源会绕过转换系统并阻止 OnEnter/OnExit 系统正确运行。

**避免创建过于复杂的状态枚举**。新开发者经常试图在单个枚举中捕获每种可能的应用程序状态，导致笨拙的状态机。相反，为不同的关注点使用多个较小的状态类型。

**不要忘记启用 StateScoped 功能**。如果你想使用 StateScoped 组件，必须在应用程序中启用它：

```rust
// 必须为每个要使用 StateScoped 的状态类型启用
app.enable_state_scoped_entities::<GameState>();
```

**不要忘记系统集配置**。系统集需要为每个调度单独配置。为 `Update` 配置的集合不会自动在 `OnEnter` 或 `OnExit` 调度中工作：

```rust
// 错误 - 这只影响 Update 调度
app.configure_sets(Update, MySet.run_if(in_state(GameState::InGame)));

// 如果需要，还需要为其他调度配置
app.configure_sets(OnEnter(GameState::InGame), MySet);
```

**小心处理事件系统交互**。当接收系统因状态条件而暂停时，发送的事件将丢失。要么使用与状态无关的事件处理器，要么实现自定义事件清理。

**注意状态转换时机**。使用 NextState<T> 排队的状态更改不会立即生效 - 它们在下一帧的 Update 系统运行之前的 StateTransition 调度期间应用。不要期望同一系统设置状态并立即看到更改。

## 与 Bevy 调度和系统集的集成

Bevy 的状态系统通过 **StateTransition 调度**与调度器深度集成，该调度在 PreUpdate 之后但在 Update 和 FixedUpdate 之前运行。这种时机确保状态更改在每帧游戏逻辑运行之前应用。

转换序列遵循特定顺序：

1. 发送 `StateTransitionEvent`
2. 运行 `OnExit(old_state)` 调度
3. 运行 `OnTransition { from: old_state, to: new_state }` 调度（很少使用）
4. 运行 `OnEnter(new_state)` 调度

**系统集与状态条件无缝配合**，允许你创建尊重状态边界的复杂执行顺序：

```rust
app.configure_sets(Update, (
    InputSet
        .run_if(in_state(GameState::InGame))
        .run_if(in_state(PausedState::Running)),
    LogicSet
        .after(InputSet)
        .run_if(in_state(GameState::InGame))
        .run_if(in_state(PausedState::Running)),
    RenderingSet
        .after(LogicSet)
        .run_if(in_state(GameState::InGame)), // 即使暂停时也运行
));
```

对于时间关键的应用程序，你可以添加额外的状态转换点：

```rust
app.add_systems(FixedUpdate, 
    apply_state_transition::<MyState>.before(MyGameplaySet)
);
```

**状态提供强大的优化机会**，通过完全消除不必要的系统执行。与基于资源或组件的运行条件不同，基于状态的运行条件在调度器级别解决，为复杂应用程序提供最大的性能优势。

理解这种集成有助于你设计在 Bevy 更广泛架构中高效工作的状态依赖系统，确保你的游戏运行顺畅，同时在不同应用程序阶段保持关注点的清晰分离。

## 结论

Bevy 0.16 的状态管理系统通过应用程序级的有限状态机为组织复杂游戏逻辑提供了坚实的基础。新的 StateScoped 组件使得实现具有自动资源生命周期管理的干净状态驱动架构比以往任何时候都更容易。

有效状态管理的关键要点包括为独立关注点使用多个正交状态，利用系统集进行组织和性能优化，善用 StateScoped 组件实现自动实体清理，以及始终为适当的清理配对 OnEnter/OnExit 系统。与 Bevy 调度器的集成确保了最佳性能，同时提供对系统执行时机的精确控制。

从基本状态定义开始简单化，随着项目的增长逐渐采用更复杂的模式，如 SubStates 和 StateScoped 实体管理。专注于清晰的状态边界、适当的转换处理和一致的资源管理，以构建可维护、高效的 Bevy 0.16 应用程序，在复杂性增长时仍能很好地扩展。