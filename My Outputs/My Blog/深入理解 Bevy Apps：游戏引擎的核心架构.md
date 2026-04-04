---
Status: 🌲
tags:
  - output/blog
Links:
  - "[[Bevy MOC]]"
Created: 2025-08-29T13:36:13
BevyVersion:
  - "0.16"
share: true
---
# 深入理解 Bevy Apps：游戏引擎的核心架构

## 引言

Bevy 是一个用 Rust 编写的现代化、数据驱动的游戏引擎。在 Bevy 的架构中，`App` 是整个游戏应用的核心，它负责管理游戏的主循环、调度系统（Systems）、配置插件（Plugins）以及处理游戏的各种状态。本文将深入探讨 Bevy Apps 的各个方面，帮助你全面理解这个强大的游戏引擎核心。

## 什么是 Bevy App？

`App` 是 Bevy 提供的 API，让我们能够控制游戏的主循环。通过 `App` 结构体，我们可以调度系统、配置游戏逻辑的方方面面。它采用建造者模式（Builder Pattern），让我们能够以声明式的方式构建游戏逻辑。

```rust
fn main() {
    App::new()
        .add_systems(Startup, setup_everything)
        .add_systems(Update, move_player)
        .run();
}
```

每个配置调用（如 `add_systems`）都会返回 App 实例本身，这种链式调用让我们能够优雅地声明游戏的所有配置。最终，调用 `run()` 启动游戏的主循环，通常会创建一个窗口并在屏幕上渲染组件。

## 游戏循环的工作原理

游戏的每一帧都通过 `run` 函数调用 `update` 方法来推进。Bevy 通过我们配置的 `Schedule` 知道何时运行哪些系统。默认情况下，Bevy 会为我们添加 `MainSchedule`。

### 基本的 App 定义

最简单的 App 定义如下：

```rust
fn main() {
    App::new()
        .add_systems(Update, hello_world_system)
        .run();
}

fn hello_world_system() {
    println!("hello world");
}
```

然而，这个简单的例子只会运行一次就退出。为了创建一个真正的游戏循环，我们需要添加 `DefaultPlugins`：

```rust
fn main() {
    App::new()
        .add_plugins(DefaultPlugins)
        .add_systems(Update, hello_world_system)
        .run();
}
```

`DefaultPlugins` 包含了游戏所需的核心插件集合，包括窗口渲染、输入处理等必要功能，并将运行函数改为无限循环。

## 插件系统（Plugins）

Bevy 采用了高度模块化的架构，允许你将游戏组织成封装的功能单元——插件。插件本质上是修改 `App` 的函数。

### 创建简单插件

最简单的插件就是一个接受 `&mut App` 参数的函数：

```rust
fn my_plugin(app: &mut App) {
    app.add_systems(Update, some_plugin_system);
}

fn main() {
    App::new()
        .add_plugins(DefaultPlugins)
        .add_plugins(my_plugin)
        .run();
}
```

### 实现 Plugin Trait

对于更复杂的插件，可以创建结构体并实现 `Plugin` trait：

```rust
pub struct CameraPlugin;

impl Plugin for CameraPlugin {
    fn build(&self, app: &mut App) {
        app.add_systems(Startup, initialize_camera);
    }
}

fn initialize_camera(mut commands: Commands) {
    commands.spawn(Camera2d);
}
```

### 插件配置

如果插件需要配置，可以为结构体添加字段：

```rust
pub struct CameraPlugin {
    debug: bool,
}

impl Plugin for CameraPlugin {
    fn build(&self, app: &mut App) {
        app.add_systems(Startup, initialize_camera);
        
        if self.debug {
            // 添加调试功能
        }
    }
}

fn main() {
    App::new()
        .add_plugins(CameraPlugin { debug: true })
        .run();
}
```

### 插件组（PluginGroup）

对于复杂的插件集合，可以使用 `PluginGroup` trait 将相关插件组合在一起：

```rust
pub struct GamePlugins;

impl PluginGroup for GamePlugins {
    fn build(self) -> PluginGroupBuilder {
        PluginGroupBuilder::start::<Self>()
            .add(CameraPlugin::default())
            .add(PhysicsPlugin::default())
            .add(LogicPlugin)
    }
}
```

使用插件组时，还可以灵活地配置或禁用特定插件：

```rust
fn main() {
    App::new()
        .add_plugins(DefaultPlugins)
        .add_plugins(
            GamePlugins
                .build()
                .disable::<PhysicsPlugin>()
        )
        .run();
}
```

## 调度系统（Schedules）

`Schedule` 是系统的集合，包含元数据和负责运行它们的执行器。Bevy 有三个主要的调度：

1. **Main** - 包含所有游戏逻辑
2. **Extract** - 将数据从主世界移动到渲染世界
3. **Render** - 渲染所有内容

### 主要的调度标签

在 Main 调度中，有以下几个重要的调度标签：

- **Startup 相关**：
    
    - `PreStartup` - 启动前
    - `Startup` - 启动时运行一次
    - `PostStartup` - 启动后
- **每帧运行**：
    
    - `First` - 帧的开始
    - `PreUpdate` - 更新前
    - `StateTransition` - 状态转换
    - `RunFixedMainLoop` - 固定时间步循环
    - `Update` - 主更新循环
    - `PostUpdate` - 更新后
    - `Last` - 帧的结束

启动时的执行顺序：

```
PreStartup -> Startup -> PostStartup
```

正常游戏循环的执行顺序：

```
First -> PreUpdate -> StateTransition -> RunFixedMainLoop -> Update -> PostUpdate -> Last
```

### 固定时间步更新

`RunFixedMainLoop` 实现了独立于帧率的固定时间步更新。它只在经过一定时间后才运行 `FixedMain` 调度：

```rust
#[derive(Resource)]
struct FixedTimestepState {
    accumulator: f64,
    step: f64,
}

fn fixed_timestep_system(world: &mut World) {
    world.resource_scope(|world, mut state: Mut<FixedTimestepState>| {
        let time = world.resource::<Time>();
        state.accumulator += time.delta_secs_f64();
        
        while state.accumulator >= state.step {
            world.run_schedule(FixedUpdate);
            state.accumulator -= state.step;
        }
    });
}
```

## App 状态管理

Bevy Apps 可以作为有限状态机（FSM）运行，允许游戏在不同状态之间转换。

### 创建 App 状态

状态是实现了 `States` trait 的枚举或结构体：

```rust
#[derive(Debug, Clone, Eq, PartialEq, Hash, Default, States)]
enum AppState {
    #[default]
    MainMenu,
    InGame,
    Paused,
}

fn main() {
    App::new()
        .init_state::<AppState>()
        .add_systems(OnEnter(AppState::MainMenu), spawn_menu)
        .add_systems(Update, play_game.run_if(in_state(AppState::InGame)))
        .run();
}
```

### 状态转换

通过 `NextState` 资源来触发状态转换：

```rust
fn pause_game(
    mut next_state: ResMut<NextState<AppState>>,
    input: Res<ButtonInput<KeyCode>>,
) {
    if input.just_pressed(KeyCode::Escape) {
        next_state.set(AppState::Paused);
    }
}
```

当状态转换时，会依次运行 `OnExit(PreviousState)` 和 `OnEnter(NewState)` 调度。

## 自定义运行器

你可以通过配置来自定义 App 的运行器函数：

```rust
// 运行一次
fn main() {
    App::new()
        .add_plugins(DefaultPlugins.set(ScheduleRunnerPlugin::run_once()))
        .run();
}

// 以 60 FPS 运行
fn main() {
    App::new()
        .add_plugins(
            DefaultPlugins.set(
                ScheduleRunnerPlugin::run_loop(
                    Duration::from_secs_f64(1.0 / 60.0)
                )
            )
        )
        .run();
}
```

甚至可以提供完全自定义的运行器函数：

```rust
fn my_runner(mut app: App) -> AppExit {
    println!("Type stuff into the console");
    for line in std::io::stdin().lines() {
        {
            let mut input = app.world_mut().resource_mut::<Input>();
            input.0 = line.unwrap();
        }
        app.update();
    }
    AppExit::Success
}

fn main() {
    App::new()
        .set_runner(my_runner)
        .run();
}
```

## 子应用（Sub-Apps）

Apps 可以包含子应用，每个子应用有自己独立的 `Schedule` 和 `World`：

```rust
#[derive(AppLabel, Clone, Copy, Hash, PartialEq, Eq, Debug)]
struct MySubApp;

let mut app = App::new();
app.insert_sub_app(MySubApp, SubApp::new());
```

子应用主要用于需要保持状态独立的进程，如流水线渲染。它们在主应用之后顺序运行，而不是并行运行。

## 多线程支持

Bevy 默认在多个线程上运行系统。调度器会努力在系统的查询集不相交时并行运行它们。可以通过配置 `TaskPoolPlugin` 来控制线程池：

```rust
fn main() {
    App::new()
        .add_plugins(DefaultPlugins.set(TaskPoolPlugin {
            task_pool_options: TaskPoolOptions::with_num_threads(4),
        }))
        .run();
}
```

## 无头模式运行

如果你想在不创建窗口或使用渲染系统的情况下运行应用，可以使用 `MinimalPlugins`：

```rust
App::new()
    .add_plugins(MinimalPlugins)
    .add_systems(Update, hello_world_system)
    .run();
```

这对于编写和运行包含游戏插件但不需要在屏幕上显示的测试非常有用。

如果你需要大部分系统功能但不想渲染到屏幕，可以配置 `DefaultPlugins`：

```rust
use bevy::render::{
    settings::{RenderCreation, WgpuSettings},
    RenderPlugin,
};

fn main() {
    App::new()
        .add_plugins(DefaultPlugins.set(RenderPlugin {
            synchronous_pipeline_compilation: true,
            render_creation: RenderCreation::Automatic(WgpuSettings {
                backends: None,
                ..default()
            }),
        }))
        .run();
}
```

## ECS 架构的优势

Bevy 基于 Entity-Component-System (ECS) 架构，这带来了几个关键优势：

1. **可扩展性**：能够高效处理数百万个实体
2. **并行性**：系统可以自动并行运行，充分利用多核处理器
3. **模块化**：功能可以轻松添加或移除
4. **类型安全**：Rust 的类型系统保证了编译时的安全性
5. **性能优化**：数据局部性和缓存友好的内存布局

## 最佳实践

1. **保持插件的独立性**：每个插件应该封装一个完整的功能单元
2. **使用状态管理游戏流程**：利用 App 状态来管理菜单、游戏进行、暂停等
3. **合理组织系统**：使用适当的调度标签来确保系统以正确的顺序运行
4. **配置化插件**：为插件提供配置选项，增加灵活性
5. **测试友好**：使用 `MinimalPlugins` 编写不需要渲染的单元测试

## 结语

Bevy 的 App 系统提供了一个强大而灵活的框架来构建游戏应用。通过理解 App 的核心概念——插件系统、调度机制、状态管理等，你可以构建出结构清晰、性能优异的游戏。

Bevy 的模块化设计理念让你能够只使用需要的功能，替换不喜欢的部分，真正实现了"简单但无限灵活"的设计目标。无论你是游戏开发新手还是经验丰富的开发者，Bevy Apps 都能为你提供合适的抽象层次和控制力度。

随着 Bevy 的持续发展，App 系统也在不断演进，为开发者提供更多功能和更好的开发体验。掌握 Bevy Apps 的核心概念，将为你的 Rust 游戏开发之旅打下坚实的基础。