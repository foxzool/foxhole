---
Status: 🌲
tags:
  - output/blog
Links:
  - "[[Bevy MOC]]"
Created: 2025-09-19T16:34:50
BevyVersion:
  - "0.16"
share: true
---
# Bevy 游戏引擎调试技巧全面指南

对于 Bevy 游戏引擎的初学者来说，掌握各种调试方法是提升开发效率的关键。本文将系统介绍 Bevy 0.16 中的多种调试手段，帮助您快速定位问题并优化性能。

## 一、日志记录：基础调试利器

### 1.1 日志系统简介

Bevy 通过 `bevy::log` 模块重新导出了 Rust 生态中的 `log` crate，并集成了 `tracing` 库作为底层实现。这意味着你可以直接使用标准的日志宏，而 Bevy 会自动处理日志的格式化和输出。

```rust
use bevy::prelude::*;

// 这些宏来自 bevy::log，是对 Rust log crate 的封装
fn example_system() {
    // 五个级别从详细到简略
    trace!("最详细的跟踪信息，用于追踪代码执行路径");
    debug!("调试信息：x = {}", x);
    info!("重要信息：游戏开始");
    warn!("警告：资源加载缓慢");
    error!("错误：文件未找到");
}
```

**为什么使用这些宏而不是 `println!`？**

- 日志宏会自动添加时间戳、模块名、行号等元信息
- 可以通过配置统一控制输出级别
- 在发布版本中可以完全关闭低级别日志，不影响性能

### 1.2 配置日志级别

Bevy 默认只显示 `info!` 及以上级别的日志。调试时你会发现 `debug!` 和 `trace!` 的输出"消失"了，需要手动调整级别：

**方法一：代码配置（推荐）**

```rust
use bevy::log::{LogPlugin, Level};

fn main() {
    App::new()
        .add_plugins(DefaultPlugins.set(LogPlugin {
            level: Level::DEBUG,  // 全局默认级别
            filter: "info,wgpu_core=warn,my_game=debug".into(),  // 细粒度控制
            ..default()
        }))
        .run();
}

// filter 字符串解释：
// - "info": 默认显示 info 级别
// - "wgpu_core=warn": wgpu_core 模块只显示 warn 以上（屏蔽其噪音）
// - "my_game=debug": 你的游戏模块显示 debug 级别
```

**方法二：环境变量**

```bash
# Linux/Mac
RUST_LOG="warn,my_game=debug" cargo run

# Windows PowerShell
$env:RUST_LOG="warn,my_game=debug"; cargo run

# Windows CMD
set RUST_LOG=warn,my_game=debug && cargo run
```

### 1.3 一次性日志

在每帧都会执行的系统中，普通日志会疯狂刷屏。Bevy 提供了特殊的宏：

```rust
use bevy::log::{debug_once, trace_once};  // 这些 *_once! 宏也来自 bevy::log

fn movement_system() {
    // 这条日志只会在第一次执行时输出
    debug_once!("Movement system initialized");
    
    // 后续每帧执行都不会再输出
    // 内部实现使用了 std::sync::Once
}

fn collision_system() {
    // 所有 *_once! 宏都和普通日志宏一样来自 bevy::log
    // 包括：trace_once!, debug_once!, info_once!, warn_once!, error_once!
    trace_once!("Collision detection started");
}
```

**提示**：这些 `*_once!` 宏和普通日志宏一样来自 `bevy::log`，使用方式完全相同，只是添加了"只执行一次"的保证。

### 1.4 开发与发布版本区分

```rust
fn main() {
    let mut app = App::new();
    
    // 只在 debug 构建时启用详细日志
    #[cfg(debug_assertions)]
    app.add_plugins(DefaultPlugins.set(LogPlugin {
        level: Level::DEBUG,
        filter: "debug,wgpu_core=warn".into(),
        ..default()
    }));
    
    // release 构建使用默认配置（只显示 info 以上）
    #[cfg(not(debug_assertions))]
    app.add_plugins(DefaultPlugins);
    
    app.run();
}
```

## 二、断点调试：深入代码执行

### 2.1 VS Code 配置

首先安装调试扩展：

- **Linux/Mac**: 推荐 CodeLLDB 扩展
- **Windows**: 可以使用 CodeLLDB 或 C/C++ 扩展

然后创建 `.vscode/launch.json` 文件：

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "lldb",
            "request": "launch",
            "name": "Debug Bevy Game",
            "cargo": {
                "args": ["build"],
                "filter": {
                    "name": "your_game_name",
                    "kind": "bin"
                }
            },
            "args": [],
            "cwd": "${workspaceFolder}",
            "env": {
                // 关键！告诉 Bevy 在哪里找 assets 文件夹
                "CARGO_MANIFEST_DIR": "${workspaceFolder}"
            }
        }
    ]
}
```

**为什么需要设置 `CARGO_MANIFEST_DIR`？**

- Bevy 默认在 `CARGO_MANIFEST_DIR/assets` 寻找资源
- 调试器可能在 `target/debug` 目录运行，导致找不到 assets
- 设置这个环境变量确保资源能正确加载

### 2.2 调试技巧

- **设置断点**：点击代码行号左侧出现红点
- **条件断点**：右键断点，设置条件如 `health < 50`
- **快捷键**：
    - F5: 继续运行到下一个断点
    - F10: 单步跳过（不进入函数内部）
    - F11: 单步进入（进入函数内部）
    - Shift+F11: 单步跳出（从当前函数返回）

**ECS 系统调试注意事项**：

```rust
fn debug_example_system(
    query: Query<(&Transform, &Health)>,
    time: Res<Time>,
) {
    // 在这里设置断点
    // 可以查看 query 的迭代器内容
    for (transform, health) in &query {
        // 断点在循环内，可以逐个查看实体数据
        let position = transform.translation;
        // 使用调试器的"监视"功能观察 position 的变化
    }
}
```

## 三、性能分析：找出瓶颈

### 3.1 Tracy 实时分析

Tracy 是一个强大的实时性能分析器，可以显示每帧的详细耗时。

**步骤 1：启用 Tracy 支持**

```toml
# Cargo.toml
[dependencies]
bevy = { version = "0.16", features = ["trace", "trace_tracy"] }

# 注意：必须使用 debug 构建才能看到完整跟踪信息
# cargo build --release 会优化掉很多跟踪点
```

**步骤 2：下载并运行 Tracy**

1. 从 [GitHub](https://github.com/wolfpld/tracy/releases) 下载 Tracy 0.11.1
2. 运行 Tracy 客户端，点击 "Connect" 开始监听
3. 启动你的 Bevy 游戏（debug 模式）
4. Tracy 会自动连接（首次可能需要等待 3-5 秒）

**步骤 3：分析性能数据**

- 查看每个系统的执行时间
- 识别帧率下降的原因
- 分析 CPU 多核利用率

### 3.2 Chrome Trace（离线分析）

如果不想安装 Tracy，可以使用 Chrome 内置的分析器：

```toml
# Cargo.toml
[dependencies]
bevy = { version = "0.16", features = ["trace", "trace_chrome"] }
```

```rust
fn main() {
    // 游戏运行后会在项目根目录生成 trace-*.json 文件
    App::new()
        .add_plugins(DefaultPlugins)
        .run();
}
```

**查看分析结果**：

1. 打开 Chrome 浏览器
2. 访问 `chrome://tracing`
3. 点击 Load 按钮，选择生成的 json 文件
4. 使用 WASD 键导航时间轴

### 3.3 帧时间诊断

最简单的性能监控方式：

```rust
use bevy::diagnostic::{
    FrameTimeDiagnosticsPlugin,
    LogDiagnosticsPlugin,
};

fn main() {
    App::new()
        .add_plugins((
            DefaultPlugins,
            FrameTimeDiagnosticsPlugin,
            LogDiagnosticsPlugin::default(),  // 注意：每秒采样打印一次，不会刷屏
        ))
        .run();
}

// 控制台会每秒显示一次（不是每帧）：
// fps: 59.9 (min: 58.2, max: 60.1)
// frame_time: 16.7ms (min: 16.6ms, max: 17.2ms)
```

**提示**：`LogDiagnosticsPlugin` 默认每秒打印一次统计信息，而不是每帧都打印，所以不用担心日志刷屏问题。

## 四、ECS 状态调试

### 4.1 打印组件状态

```rust
use bevy::prelude::*;

#[derive(Component, Debug)]
struct Health(f32);

#[derive(Component, Debug)]
struct Player;

fn debug_health_system(
    query: Query<(Entity, &Health), With<Player>>
) {
    for (entity, health) in &query {
        // dbg! 宏会打印值和代码位置
        dbg!(entity, health);
        
        // 输出类似：
        // [src/main.rs:15] entity = Entity(0v0)
        // [src/main.rs:15] health = Health(100.0)
    }
}
```

### 4.2 使用 dbg! 宏的技巧

```rust
fn physics_system(mut query: Query<&mut Transform>) {
    for mut transform in &mut query {
        // dbg! 返回传入的值，所以可以在表达式中使用
        transform.translation.x += dbg!(1.0);  // 打印并返回 1.0
        
        // 多个值一起调试
        dbg!(&transform.translation, &transform.rotation);
    }
}
```

## 五、Inspector 插件：可视化调试神器

### 5.1 什么是 Inspector？

Inspector 插件在游戏窗口中创建一个 GUI 面板，让你能实时查看和修改 ECS 世界的状态，就像 Unity 的 Inspector 窗口。

### 5.2 安装配置

```toml
# Cargo.toml
[dependencies]
bevy = "0.16"
bevy-inspector-egui = "0.29"
```

```rust
use bevy::prelude::*;
use bevy_inspector_egui::quick::WorldInspectorPlugin;

fn main() {
    App::new()
        .add_plugins((
            DefaultPlugins,
            WorldInspectorPlugin::default(),
        ))
        .run();
}
```

### 5.3 让自定义组件可检查

Inspector 使用 Bevy 的反射系统（Reflection）在运行时获取类型信息。要让自定义组件可见，需要：

```rust
use bevy::prelude::*;
use bevy::reflect::Reflect;

// 1. 派生 Reflect trait
// 2. 添加 reflect(Component) 属性
#[derive(Component, Reflect, Default)]
#[reflect(Component)]  // 告诉反射系统这是一个组件
struct Player {
    health: f32,
    speed: f32,
    name: String,
}

fn main() {
    App::new()
        .add_plugins((
            DefaultPlugins,
            WorldInspectorPlugin::default(),
        ))
        // 3. 必须注册类型！否则 Inspector 看不到
        .register_type::<Player>()
        .add_systems(Startup, setup)
        .run();
}

fn setup(mut commands: Commands) {
    commands.spawn((
        Player {
            health: 100.0,
            speed: 5.0,
            name: "Hero".to_string(),
        },
        TransformBundle::default(),
    ));
}
```

**为什么需要这三步？**

1. `Reflect` trait 让 Bevy 能在运行时访问结构体字段
2. `#[reflect(Component)]` 标记这是一个 ECS 组件
3. `register_type` 把类型信息注册到类型注册表中

### 5.4 条件编译 Inspector

生产版本不应包含 Inspector：

```rust
fn main() {
    let mut app = App::new();
    app.add_plugins(DefaultPlugins);
    
    // 只在 debug 构建时添加 Inspector
    #[cfg(debug_assertions)]
    {
        use bevy_inspector_egui::quick::WorldInspectorPlugin;
        app.add_plugins(WorldInspectorPlugin::default());
        app.register_type::<Player>();
        app.register_type::<Enemy>();
    }
    
    app.add_systems(Startup, setup)
       .run();
}
```

## 六、渲染调试

### 6.1 RenderDoc 使用

RenderDoc 可以捕获并分析单帧的所有渲染调用：

1. **安装 RenderDoc**：从 [官网](https://renderdoc.org/) 下载
2. **启动方式**：
    - 方式 A：在 RenderDoc 中设置可执行文件路径，点击 Launch
    - 方式 B：先运行游戏，再用 RenderDoc 的 "Inject into Process" 功能
3. **捕获帧**：游戏中按 F12（或 Print Screen）
4. **分析内容**：
    - 每个 Draw Call 的详情
    - 顶点/索引缓冲区数据
    - 着色器和 Uniform 变量
    - 纹理和渲染目标

### 6.2 Vulkan 验证层

Bevy 通过 wgpu 在 debug 构建下自动尝试启用 Vulkan 验证层，帮助检测渲染错误：

```bash
# 如果看到这个警告：
# WARN wgpu_hal::vulkan::instance: Unable to find layer: VK_LAYER_KHRONOS_validation

# 解决方法：安装 Vulkan SDK
# - Windows/Mac: 从 https://vulkan.lunarg.com/ 下载
# - Ubuntu: sudo apt install vulkan-validation-layers
# - Arch: sudo pacman -S vulkan-validation-layers
```

启用验证层后，渲染错误会在控制台显示详细信息：

- 资源使用错误
- 管线状态问题
- 同步错误

## 七、Web 平台调试

### 7.1 构建和运行 WASM 版本

```bash
# 1. 安装 WebAssembly 目标
rustup target add wasm32-unknown-unknown

# 2. 安装 wasm-server-runner
# 这是一个 cargo runner，会自动启动 HTTP 服务器并打开浏览器
cargo install wasm-server-runner

# 3. 运行（会自动编译、启动服务器、打开浏览器）
cargo run --target wasm32-unknown-unknown
```

**wasm-server-runner 的作用**：

- 启动本地 HTTP 服务器（WASM 不能用 file:// 协议）
- 设置正确的 MIME 类型
- 自动在默认浏览器中打开游戏

### 7.2 浏览器调试技巧

1. **打开开发者工具**：按 F12
2. **查看日志**：
    - Bevy 的所有日志会出现在 Console 标签页
    - `info!`、`warn!`、`error!` 对应浏览器的 console.log/warn/error
3. **查看 panic**：
    - Bevy 自动启用 `console_error_panic_hook`
    - Rust panic 会显示完整的堆栈跟踪
4. **性能分析**：
    - 使用 Performance 标签页记录和分析
    - 可以看到每帧的耗时分布

```rust
// Web 平台特定的调试代码
#[cfg(target_arch = "wasm32")]
fn web_debug_system() {
    // 使用 web_sys 调用浏览器 API
    web_sys::console::log_1(&"Custom web debug message".into());
}
```

## 八、实用调试技巧

### 8.1 调试断言

```rust
fn update_health(health: &mut Health) {
    health.0 -= 10.0;
    
    // debug_assert! 只在 debug 构建时检查
    // release 构建会完全移除这行代码
    debug_assert!(
        health.0 >= 0.0, 
        "Health cannot be negative! Current value: {}", 
        health.0
    );
    
    // assert! 在所有构建中都会检查
    assert!(health.0 <= 100.0, "Health exceeded maximum!");
}
```

### 8.2 调试资源和开关

```rust
// 定义调试开关资源
#[derive(Resource, Default)]
struct DebugSettings {
    show_fps: bool,
    show_colliders: bool,
    god_mode: bool,
}

// 切换调试模式的系统
fn toggle_debug_system(
    keys: Res<ButtonInput<KeyCode>>,
    mut debug: ResMut<DebugSettings>,
) {
    if keys.just_pressed(KeyCode::F1) {
        debug.show_fps = !debug.show_fps;
        info!("FPS display: {}", if debug.show_fps { "ON" } else { "OFF" });
    }
    
    if keys.just_pressed(KeyCode::F2) {
        debug.show_colliders = !debug.show_colliders;
    }
    
    if keys.just_pressed(KeyCode::F3) {
        debug.god_mode = !debug.god_mode;
        warn!("God mode: {}", if debug.god_mode { "ACTIVATED" } else { "DEACTIVATED" });
    }
}

fn main() {
    App::new()
        .add_plugins(DefaultPlugins)
        .init_resource::<DebugSettings>()  // 初始化调试设置
        .add_systems(Update, toggle_debug_system)
        .run();
}
```

### 8.3 使用 Feature 标志

```toml
# Cargo.toml
[features]
default = []
debug_ui = []
dev_tools = ["debug_ui", "bevy-inspector-egui"]
```

**重要提示**：Cargo 的 feature 是**编译时**选择，不是运行时切换。启用 feature 会包含相关代码，不启用则完全不编译这部分代码。

```rust
// 只在启用 debug_ui feature 时编译
#[cfg(feature = "debug_ui")]
mod debug_ui {
    use bevy::prelude::*;
    
    pub fn setup_debug_overlay(mut commands: Commands) {
        // 创建调试 UI
    }
}

fn main() {
    let mut app = App::new();
    
    #[cfg(feature = "debug_ui")]
    app.add_systems(Startup, debug_ui::setup_debug_overlay);
    
    app.run();
}

// 编译命令：
// cargo run --features debug_ui  # 包含调试功能
// cargo build --release          # 不包含调试功能（除非默认启用）
```

## 九、调试工作流程建议

### 9.1 问题定位流程

1. **重现问题**
    
    - 记录触发步骤
    - 尝试简化重现条件
2. **日志探查**
    
    ```rust
    debug!("Before problem occurs: state = {:?}", state);
    // 问题代码
    debug!("After problem: state = {:?}", state);
    ```
    
3. **Inspector 观察**
    
    - 运行时查看相关实体和组件
    - 实时修改值测试假设
4. **断点深入**
    
    - 在可疑位置设置断点
    - 单步执行观察变量变化
5. **性能分析**（如果是性能问题）
    
    - Tracy 找出慢系统
    - 优化热点代码

### 9.2 常见问题速查

**实体不显示？**

```rust
fn debug_visibility(
    query: Query<(Entity, &Visibility, &Transform, Option<&Handle<Mesh>>)>
) {
    for (entity, vis, transform, mesh) in &query {
        info!("Entity {:?}: visible={:?}, pos={:?}, has_mesh={}", 
              entity, vis, transform.translation, mesh.is_some());
    }
}
```

**资源加载失败？**

```rust
use bevy::asset::LoadState;

fn check_assets(
    assets: Res<AssetServer>,
    textures: Query<&Handle<Image>>,
) {
    for handle in &textures {
        // 注意：LoadState 只在 asset server 知道该 handle 时返回 Some
        // 如果 handle 从未被加载过，会返回 None
        match assets.get_load_state(handle) {
            Some(LoadState::Loaded) => { /* 加载成功 */ }
            Some(LoadState::Failed(e)) => error!("Asset failed: {}", e),
            Some(LoadState::Loading) => info!("Still loading..."),
            None => warn!("Unknown handle - was it ever loaded?"),
        }
    }
}
```

**提示**：`get_load_state` 返回 `Option<LoadState>`。只有当 AssetServer 知道这个 handle（曾经加载过）时才返回 `Some`，否则返回 `None`。

**系统没有运行？**

```rust
// 添加运行条件调试
app.add_systems(
    Update, 
    my_system.run_if(|debug: Res<DebugSettings>| {
        let should_run = debug.enabled;
        if !should_run {
            trace_once!("System skipped: debug disabled");
        }
        should_run
    })
);
```

## 十、总结

调试是游戏开发的重要技能，Bevy 提供了完整的调试工具链：

|工具|用途|使用场景|
|---|---|---|
|日志系统|追踪代码执行|了解程序流程|
|断点调试|深入分析逻辑|复杂 bug 定位|
|Inspector|实时查看/修改状态|调整参数、检查组件|
|Tracy/Trace|性能分析|优化瓶颈|
|RenderDoc|渲染调试|图形问题诊断|

**最佳实践**：

1. 开发时启用所有调试工具
2. 使用条件编译控制调试代码
3. 发布前彻底移除调试功能（通过 feature 和条件编译）
4. 建立自己的调试工作流程

记住：

- Feature 标志是编译时决定，不是运行时
- `*_once!` 宏避免日志刷屏
- `LogDiagnosticsPlugin` 每秒打印一次，不会每帧刷屏
- `get_load_state` 只对已知的 handle 返回 `Some`

好的调试习惯能大幅提升开发效率。随着经验积累，你会逐渐形成适合自己的调试方法论。

## 参考资源

- [Bevy 官方文档](https://bevyengine.org/)
- [Bevy Cheat Book](https://bevy-cheatbook.github.io/)
- [bevy-inspector-egui GitHub](https://github.com/jakobhellermann/bevy-inspector-egui)
- [Tracy Profiler](https://github.com/wolfpld/tracy)
- [RenderDoc](https://renderdoc.org/)

祝您在 Bevy 游戏开发中调试顺利，创造出精彩的游戏！