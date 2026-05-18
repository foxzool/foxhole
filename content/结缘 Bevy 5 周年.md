---
Status: 🌲
tags:
  - note
Links:
  - "[[Bevy MOC]]"
Created: 2025-08-12T17:59:34
BevyVersion:
  - "0.16"
share: true
---
# 前言
不知不觉，Bevy 已经迎来了[五周年生日](https://bevy.org/news/bevys-fifth-birthday/),  写一篇文章回顾一下我与Bevy的缘分.

# 开始于2020年

遥想2020年,  当时公司业务正在做模拟训练业务. 在后端我已经在使用actix-web提供websocket服务给前端网页,   随着业务复杂性的增加，我发现 Actix 的 Actor 模型在处理需要多方协作的复杂逻辑时，状态管理和业务编排变得愈发困难.

作为前游戏行业开发者, 一直关注着rust游戏开发. 2020年中还在关注着amethyst, 对ECS模式十分感兴趣,   但amethyst上手实在不好用, 写着写着就搁置了下来.    八月初,  手机消息推送了Bevy 0.1发布的新闻,  其中宣称Bevy ECS是最符合人体工程学设计的ECS , 这一下子吸引了我.

当年的ECS写法
``` rust
use bevy::prelude::*;

struct Velocity(f32);
struct Position(f32);

// this system spawns entities with the Position and Velocity components
fn setup(mut commands: Commands) {
    commands
        .spawn((Position(0.0), Velocity(1.0),))
        .spawn((Position(1.0), Velocity(2.0),));
}

// this system runs on each entity with a Position and Velocity component
fn movement(mut position: Mut<Position>, velocity: &Velocity) {
    position.0 += velocity.0;
}

// the app entry point. hopefully you recognize it from the examples above!
fn main() {
    App::build()
        .add_default_plugins()
        .add_startup_system(setup.system())
        .add_system(movement.system())
        .run();
}
```

很简洁明了, 而且我只需要ECS写逻辑, 不需要渲染画面.   而Bevy模块化的架构设计, 可以很容易剥离掉渲染模块. 于是，我很快就在公司的项目中引入了 Bevy ECS，并提交了第一行用 Bevy 编写的业务逻辑代码.

![第一次提交](https://assets.zool.me/2025/08/c2036a3834c09f26e68ad219d345dcb2.png)

# 公司业务(2020-2023)

这几年公司业务有模拟打靶, 驾驶训练等, 和游戏逻辑很接近,  所以我一人用bevy ecs写了很多逻辑代码, 其中最复杂的一个业务, 有点往 Command: Modern Operations 的模拟方向发展, 可惜后面停了.  这些代码部署在 Windows 和树莓派（Raspbian）环境下，表现出色，运行一直非常稳定.

随着业务的稳定,  我同时也开源了一些Bevy插件:

- [bevy_serialport](https://github.com/foxzool/bevy_serialport)  读取串口数据
- [bevy_nokhwa](https://github.com/foxzool/bevy_nokhwa)  使用nokhwa库读取外部相机画面渲染在窗口背景
- [bevy_gstreamer](https://github.com/foxzool/bevy_gstreamer) 使用gstreamer库读取外部相机画面渲染在窗口背景
- [bevy_octopus](https://github.com/foxzool/bevy_octopus) 低层级的网络库, 支持Tcp/Udp/Websocket,  这个库我主要是用来处理Udp组播收发
- [bevy_mqtt](https://github.com/foxzool/bevy_mqtt)  mqtt client 库
- [bevy_cronjob](https://github.com/foxzool/bevy_cronjob)  用 cron 表达式定义 system schedule
- [bevy_http_client](https://crates.io/crates/bevy_http_client)  http client 客户端, 支持 wasm

# 尝试游戏(2024-至今)

随着公司业务转型, 用ECS写逻辑的地方少了很多. 我在业余时间也开始了Bevy游戏的开发.

下面是完成的一些作品

- 魔方
  源码: https://github.com/foxzool/bevy_rubiks
![image.png](https://assets.zool.me/2025/08/9a8bb6c9ea9688a7697856e615f0aaca.png)

- 数独
  源码: https://github.com/foxzool/nyt_sudoku
  线上游玩: https://foxzool.github.io/nyt_sudoku/
  ![](https://assets.zool.me/2024/12/f91979f38a760de86007f81a210a9bf6.png)
  
- 拼图游戏
  源码: https://github.com/foxzool/jigsaw_puzzle
  ![image.png](https://assets.zool.me/2025/08/10facbb98b5c18443d9d8f0c640588f4.png)

- LastStop
  第一次参加 Bevy jam 的作品
  源码: https://github.com/foxzool/last-stop
  在线游玩: https://foxzool.itch.io/the-last-stop
  ![image.png](https://assets.zool.me/2025/08/b454464dc5a5225ed3450667c0ee5b67.png)
  
-  黑白棋游戏
  源码:  https://github.com/foxzool/reversi
  在线游玩: https://foxzool.itch.io/reversi

![image.png](https://assets.zool.me/2025/08/da6b15ed1b1bdcd00df90b88784ec8e9.png)

# 后记

## ECS

Bevy ecs的人体工程学一直在改进, 越用越好用.  在0.16版本以前加入缺少的Relation关系, 但 ECS 最大的问题是新手需要一个思路转换的过程, 从传统的面向对象思维（OOP）转向面向数据的设计（DOD），以及从直接的函数调用转向**基于事件和查询的松耦合系统交互**.

好处是ecs的组合性很强, 业务中的抽象出的插件真的可以很容易在其他项目里复用.

## 编辑器/调试

2025年五周年了,  Bevy 经常被问的编辑器还没有实现~,  平常游戏类型用bevy_egui调试就够了. 

界面调试慢? 即将发布的0.17即将支持代码热重载, 0.18 将推出实现性的bsn支持来界面热重载.

开发环境搭建慢? `bevy_cli` 启动! 
```
bevy new my_game --template 2d
```

## 生产力

24年steam上线了 [林间小世界(Tiny Glade)](https://store.steampowered.com/app/2198150/Tiny_Glade/) ,  它使用了Bevy ECS, 但自己写了渲染管道

![image.png](https://assets.zool.me/2025/08/6008536c2eed956fcb634611015b765e.png)

25年6月有[LongStory 2](https://store.steampowered.com/app/2427820/LongStory_2/),   Bevy实现 Inky 脚本语言可视化小说
![image.png](https://assets.zool.me/2025/08/7770a51929aa2dbc7b04a5ab3aaa2210.png)

25年第四季度还有 [Exofactory](https://store.steampowered.com/app/3615720/Exofactory/)
![image.png](https://assets.zool.me/2025/08/1a40e24ef3e3ff61ab2d8c5e86e51483.png)

对游戏没有兴趣?
[nominal](https://nominal.io/) 在用bevy做硬件调试平台
![image.png](https://assets.zool.me/2025/08/9a0f4c3cd1520c8a420de353ecd3150e.png)

可以关注下面列表看哪些bevy应用已经正式发布
https://github.com/Vrixyz/bevy_awesome_prod/

Let's Bevy!