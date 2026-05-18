---
title: Bevy 0.15版速览
Status: 🟩
tags:
  - note
  - output/blog
Links:
  - "[[Bevy MOC]]"
Created: 2024-11-28
BevyVersion: "0.15"
share: true
Finished: 2024-11-28
---
Bevy 0.15 版已经正式发布。

几个主要特性:

- **所需组件**
- **实体选择/拾取**
- **动画：通用实体动画、动画遮罩、加法混合、动画事件**
- **曲线：Curve 特性、循环样条、常用缓动函数、颜色渐变曲线**
- **反射：函数反射、唯一反射、远程类型反射**
- **Bevy 远程协议 (BRP)**
- **基于垂直的环境光遮蔽 (VBAO)**
- **色差**
- **体积雾改进：雾体积。支持点光源和聚光灯。**
- **改进的文本渲染：Cosmic Text**
- **将游戏手柄作为实体**
- **UI 盒阴影**

其中关于渲染和反射这一块我不太熟，就其他的几个主要特性挑几个快速讲一讲：

## 实体选择/拾取
bevy整合了`bevy_mod_picking`的功能到`bevy_picking`插件，并且针对UI, Sprite和Mesh提供了默认的拾取后端插件。同时提供了冒泡观察者模式，从实体一级一级向父级传递事件。
```rust
// UI text that prints a message when clicked:
commands
    .spawn(Text::new("Click Me!"))
    .observe(on_click_print_hello);

// A cube that spins when dragged:
commands
    .spawn((
        Mesh3d(meshes.add(Cuboid::default())),
        MeshMaterial3d(materials.add(Color::WHITE)),
    ))
    .observe(on_drag_spin);
}

fn on_click_print_hello(click: Trigger<Pointer<Click>>) {
    println!("{} was clicked!", click.entity());
}

fn on_drag_spin(drag: Trigger<Pointer<Drag>>, mut transforms: Query<&mut Transform>) {
    let mut transform = transforms.get_mut(drag.entity()).unwrap();
    transform.rotate_y(drag.delta.x * 0.02);
}
```

## 所需组件
Bevy ecs 一开始0.1版本开始， 创建Component的时候， 就是推荐使用`Bundle`
```rust
#[derive(Bundle)]
struct PlayerBundle {
    player: Player,
    team: Team,
    sprite: Sprite,
    transform: Transform,
    global_transform: GlobalTransform,
    visibility: Visibility,
    inherited_visibility: InheritedVisibility,
    view_visibility: ViewVisibility,
}
```
创建一个`Player` 时就插入一个`PlayerBundle`
```rust
commands.spawn(PlayerBundle {
    player: Player { 
        name: "hello".into(),
        ..default()
    },
    team: Team::Blue,
    ..default()
});
```

这里的问题是， 我们用`Player`时就要了解`PlayerBundle`的整个结构，要填入默认值。
新的所需组件功能是这样定义的
```rust
#[derive(Component, Default)]
#[require(Team, Sprite)]
struct Player {
    name: String,
}

commands.spawn((
    Player {
        name: "hello".into(),
        ..default()
    },
    Team::Blue,
))

```
代码里加入了一行`#[require(Team, Sprite)]` , 提示系统我们需要`Team`和`Sprite`组件，而`Sprite`组件会自动在加载`Transform`和`Visibility`。同样,`Transform`自动加载`GlobalTransform`，`Visibility`自动加载`InheritedVisibility`和`ViewVisibility`

代码精简和易读了很多。

## Bevy 远程协议 (BRP)
基于`hyper`在对外提供了http接口，可以对系统内的组件进行增删查改。
``` rust
let req = BrpRequest {  
    jsonrpc: String::from("2.0"),  
    method: String::from(BRP_QUERY_METHOD),  
    id: Some(ureq::json!(1)),  
    params: Some(  
        serde_json::to_value(BrpQueryParams {  
            data: BrpQuery {  
                components: args.components,  
                option: Vec::default(),  
                has: Vec::default(),  
            },  
            filter: BrpQueryFilter::default(),  
        })  
        .expect("Unable to convert query parameters to a valid JSON value"),  
    ),  
};
```
查询结果json
``` json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": [
    {
      "components": {
        "bevy_transform::components::transform::Transform": {
          "rotation": [
            -0.7071067690849304,
            0.0,
            0.0,
            0.7071067690849304
          ],
          "scale": [
            1.0,
            1.0,
            1.0
          ],
          "translation": [
            0.0,
            0.0,
            0.0
          ]
        }
      },
      "entity": 4294967313
    },
    {
      "components": {
        "bevy_transform::components::transform::Transform": {
          "rotation": [
            0.0,
            0.0,
            0.0,
            1.0
          ],
          "scale": [
            1.0,
            1.0,
            1.0
          ],
          "translation": [
            0.0,
            0.7810186743736267,
            0.0
          ]
        }
      },
      "entity": 4294967314
    },
    {
      "components": {
        "bevy_transform::components::transform::Transform": {
          "rotation": [
            0.0,
            0.0,
            0.0,
            1.0
          ],
          "scale": [
            1.0,
            1.0,
            1.0
          ],
          "translation": [
            4.0,
            8.0,
            4.0
          ]
        }
      },
      "entity": 4294967315
    },
    {
      "components": {
        "bevy_transform::components::transform::Transform": {
          "rotation": [
            -0.22055435180664065,
            -0.13167093694210052,
            -0.03006339818239212,
            0.9659786224365234
          ],
          "scale": [
            1.0,
            1.0,
            1.0
          ],
          "translation": [
            -2.5,
            4.5,
            9.0
          ]
        }
      },
      "entity": 4294967316
    }
  ]
}

```

## 动画
emmm...   总算有动画组件了， 但还是挺复杂的， 没有编辑器之前，调试有点烦。

## 保留渲染世界
Bevy 的世界分为Main World和Render World,  渲染画面前要将相关数据从主世界同步到渲染世界。
在Bevy之前的版本里， 渲染世界是一个即时模式，每一帧渲染前清空渲染世界，从头开始渲染。
即时模式有一定的性能开销， 从0.15开始，Bevy 将开始 保留渲染世界，不再清除每一帧。主世界通过`SyncToRenderWorld`将实体同步到渲染世界。

## UI 盒阴影
一个新的组件`BoxShadow`,  添加到任何一个`Node`实体下
```rust
#[derive(Component)]
pub struct BoxShadow {
    /// The shadow's color
    pub color: Color,
    /// Horizontal offset
    pub x_offset: Val,
    /// Vertical offset
    pub y_offset: Val,
    /// How much the shadow should spread outward.
    ///
    /// Negative values will make the shadow shrink inwards.
    /// Percentage values are based on the width of the UI node.
    pub spread_radius: Val,
    /// Blurriness of the shadow
    pub blur_radius: Val,
}
```
效果如下
![](https://assets.zool.me/2024/11/f06e0034513ddeed8ee945a1c032241d.png)

## 未来展望
0.14至0.15版本间， Bevy基金会申请加入了美国501(c)非营利组织, 目前Cart正在全力开发下一代UI架构(BSN)，   Alice 也已经全职开发Bevy。

这次0.15更新中的选择/拾取，远程协议，所需组件都是开发编辑器的基石之一，编辑器上线还会远吗？