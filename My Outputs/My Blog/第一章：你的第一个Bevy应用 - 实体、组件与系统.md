---
title: "第一章：你的第一个Bevy应用 - 实体、组件与系统"
Status: 🟩
tags:
  - output/blog
Links:
  - "[[Bevy MOC]]"
Created: 2025-06-20
Finished: 2025-06-20
BevyVersion: "0.16"
share: true
Collection: "[[数据驱动游戏开发的初学者指南]]"
---
### 🎯 本章目标

学完这一章，你将能够：

- 创建一个简单的Bevy应用
- 理解什么是实体、组件和系统
- 编写你的第一个游戏逻辑

### 🚀 从最简单的开始

让我们先创建一个能运行的Bevy程序：

rust

```rust
use bevy::prelude::*;

fn main() {
    App::new()
        .add_plugins(DefaultPlugins)
        .run();
}
```

**运行这段代码**，你会看到一个空白窗口。恭喜！你已经有了一个基础的游戏引擎在运行。

### 💡 理解这段代码

- `App::new()` - 创建游戏应用
- `.add_plugins(DefaultPlugins)` - 添加窗口、渲染、音频等基础功能
- `.run()` - 启动游戏循环

**类比**：就像搭积木，我们先有了基础板，现在要往上面放各种积木块。

### 📦 组件：描述"是什么"

组件就是数据，描述游戏中物体的属性。让我们创建一些简单的组件：

rust

```rust
// 标记组件 - 表示"这是一个学生"
#[derive(Component)]
struct Student;

// 数据组件 - 存储学生的姓名
#[derive(Component)]
struct Name(String);

// 数据组件 - 存储学生的年级
#[derive(Component)]
struct Grade(u8);
```

**生活类比**：

- `Student` 像是学生证，表明身份
- `Name` 像是姓名标签
- `Grade` 像是年级胸章

### 🏗️ 实体：组合各种组件

实体就是一个ID，用来把不同的组件组合在一起：

rust

```rust
fn setup_students(mut commands: Commands) {
    // 创建第一个学生实体
    commands.spawn((
        Student,
        Name("张小明".to_string()),
        Grade(3),
    ));
    
    // 创建第二个学生实体
    commands.spawn((
        Student,
        Name("李华".to_string()),
        Grade(2),
    ));
    
    // 创建第三个学生实体
    commands.spawn((
        Student,
        Name("王小红".to_string()),
        Grade(1),
    ));
}
```

**实体的本质**：实体本身什么都不是，它只是一个"容器"，真正的数据都在组件里。

### ⚙️ 系统：定义"做什么"

系统是函数，定义了游戏的逻辑：

rust

```rust
// 这个系统会打印所有学生的信息
fn print_students(query: Query<(&Name, &Grade), With<Student>>) {
    println!("=== 学生名单 ===");
    for (name, grade) in &query {
        println!("姓名: {}, 年级: {}年级", name.0, grade.0);
    }
}
```

**系统的神奇之处**：

- 你不需要手动调用这个函数
- #bevy会自动找到所有符合条件的实体
- `Query<(&Name, &Grade), With<Student>>` 的意思是："给我所有同时拥有Name、Grade组件，并且标记为Student的实体"

### 🔧 组装完整的应用

rust

```rust
use bevy::prelude::*;

fn main() {
    App::new()
        .add_plugins(DefaultPlugins)
        // 启动时运行一次setup_students
        .add_systems(Startup, setup_students)
        // 每帧都运行print_students（我们稍后会优化这个）
        .add_systems(Update, print_students_once)
        .run();
}

#[derive(Component)]
struct Student;

#[derive(Component)]
struct Name(String);

#[derive(Component)]
struct Grade(u8);

fn setup_students(mut commands: Commands) {
    commands.spawn((Student, Name("张小明".to_string()), Grade(3)));
    commands.spawn((Student, Name("李华".to_string()), Grade(2)));
    commands.spawn((Student, Name("王小红".to_string()), Grade(1)));
}

// 使用Local来确保只打印一次
fn print_students_once(
    query: Query<(&Name, &Grade), With<Student>>,
    mut printed: Local<bool>
) {
    if *printed {
        return; // 如果已经打印过了，就退出
    }
    
    println!("=== 学生名单 ===");
    for (name, grade) in &query {
        println!("姓名: {}, 年级: {}年级", name.0, grade.0);
    }
    
    *printed = true; // 标记为已打印
}
```

### 🎉 运行结果

运行这个程序，你会在控制台看到：

```
=== 学生名单 ===
姓名: 张小明, 年级: 3年级
姓名: 李华, 年级: 2年级
姓名: 王小红, 年级: 1年级
```

### 🤔 检查理解

在继续下一章之前，请确保你理解：

1. **组件是什么？** 数据/属性
2. **实体是什么？** 组件的容器/组合
3. **系统是什么？** 处理数据的逻辑/函数
4. **Query是什么？** 查找符合条件实体的工具

### 💪 练习挑战

试着修改代码：

1. 添加一个新的组件 `Age(u8)` 表示年龄
2. 给学生实体添加年龄信息
3. 修改打印系统，同时显示年龄

### 下一步

在下一章，我们将学习更高级的组件组织方式和资源管理。你已经掌握了ECS的核心概念！
