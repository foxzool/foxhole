---
Status: 🟩
tags:
  - output/blog
Links:
  - "[[Bevy MOC|Bevy MOC]]"
Created: 2024-11-12T15:59:56
share: true
BevyVersion:
  - "0.15"
Collection: "[[拼图游戏]]"
Finished: 2024-11-12
---
## UI事件
昨天的UI无法点击暂时通过给上层Node添加`PickingBehavior::IGNORE,`来解决。
现在我们给UI加上点击实现， 实现方式很简单，在生成的地方，再加一个Observe用来发生事件
```rust
p.spawn((  
    UiImage::new(asset_server.load("icons/lamp.png")),  
    Node {  
        height: Val::Px(40.),  
        margin: UiRect::axes(Val::Px(0.), Val::Px(5.)),  
        ..default()  
    },  
    IdeaButton,  
))  
.observe(  
    |_trigger: Trigger<Pointer<Click>>, mut commands: Commands| {  
        commands.send_event(TogglePuzzleHint);  
    },  
);
```

## 全屏/取消全屏
在点击时， 将window的模式设置为全屏
```rust
.observe(  
    |_trigger: Trigger<Pointer<Click>>, mut window: Single<&mut Window>| {  
        window.mode = WindowMode::Fullscreen(MonitorSelection::Current);  
    },  
);
```
按下ESC取消全屏
```rust
fn exit_fullscreen_on_esc(mut window: Single<&mut Window>, input: Res<ButtonInput<KeyCode>>) {  
    if !window.focused {  
        return;  
    }  
  
    if input.just_pressed(KeyCode::Escape) {  
        window.mode = WindowMode::Windowed;  
    }  
}
```

## 重构随机打乱
将随机打乱分为两种， 一种是全窗口内的随机打乱， 一种是将拼图块贴着窗口边
```rust
  
#[derive(Event)]  
pub enum Shuffle {  
    Random,  
    Edge,  
}  
  
fn shuffle_pieces(  
    mut shuffle_events: EventReader<Shuffle>,  
    mut query: Query<(&Piece, &mut Transform)>,  
    window: Single<&Window>,  
    camera: Single<&OrthographicProjection, With<Camera2d>>,  
) {  
    for event in shuffle_events.read() {  
        match event {  
            Shuffle::Random => {  
                for (piece, mut transform) in &mut query.iter_mut() {  
                    let random_pos =  
                        random_position(&piece, window.resolution.size(), camera.scale);  
                    transform.translation = random_pos.extend(piece.index as f32);  
                }  
            }  
            Shuffle::Edge => {  
                for (piece, mut transform) in &mut query.iter_mut() {  
                    let edge_pos = edge_position(&piece, window.resolution.size(), camera.scale);  
                    transform.translation = edge_pos.extend(piece.index as f32);  
                }  
            }  
        }  
    }  
}
```
效果如下：
![](https://assets.zool.me/2024/11/5e83157348fc19c030dac8bd65f0bec2.png)

## 提示匹配拼图
将未合成的相邻两块拼图置为选中状态
```rust
  
#[derive(Event)]  
pub struct TogglePuzzleHint;  
  
fn handle_toggle_puzzle_hint(  
    mut event: EventReader<TogglePuzzleHint>,  
    selected_query: Query<Entity, With<Selected>>,  
    piece_query: Query<(Entity, &Piece, &MoveTogether), Without<Selected>>,  
    mut commands: Commands,  
) {  
    for _ in event.read() {  
        for entity in selected_query.iter() {  
            commands.entity(entity).remove::<Selected>();  
        }  
        let mut first_piece = None;  
        let mut first_entity = None;  
        let mut second_entity = None;  
        'f1: for (entity, piece, move_together) in piece_query.iter() {  
            if move_together.len() > 0 {  
                continue 'f1;  
            }  
            first_piece = Some(piece);  
            first_entity = Some(entity);  
            break 'f1;  
        }  
        if let Some(first_piece) = first_piece {  
            'f2: for (entity, piece, move_together) in piece_query.iter() {  
                if move_together.len() > 0 {  
                    continue 'f2;  
                }  
                if first_piece.beside(&piece) {  
                    second_entity = Some(entity);  
                    break 'f2;  
                }  
            }  
        }  
        if let (Some(first_entity), Some(second_entity)) = (first_entity, second_entity) {  
            commands.entity(first_entity).insert(Selected);  
            commands.entity(second_entity).insert(Selected);  
        }  
    }  
}
```
找出第一个`单个`的拼图， 然后找到它任意一个旁边的拼图，将他们都加入`Selected`组件

## 切换显示全部拼图和只有边缘的拼图
```rust
  
#[derive(Event)]  
pub struct ToggleEdgeHint;   
fn handle_puzzle_hint(  
    mut event: EventReader<ToggleEdgeHint>,  
    selected_query: Query<Entity, With<Selected>>,  
    mut piece_query: Query<(&Piece, &mut Visibility), Without<Selected>>,  
    mut commands: Commands,  
    mut show_all: Local<bool>,  
) {  
    for _ in event.read() {  
        for entity in selected_query.iter() {  
            commands.entity(entity).remove::<Selected>();  
        }  
        *show_all = !*show_all;  
  
        if *show_all {  
            for (_, mut visibility) in piece_query.iter_mut() {  
                *visibility = Visibility::Visible;  
            }  
        } else {  
            for (piece, mut visibility) in piece_query.iter_mut() {  
                if piece.is_edge() {  
                    *visibility = Visibility::Visible;  
                } else {  
                    *visibility = Visibility::Hidden;  
                }  
            }  
        }  
    }  
}
```

## 拆分系统
为了更好的游玩体验， 将系统状态拆分为 Menu(菜单), GamePlay(游玩)。 后续在Gameplay里还要拆分游戏状态。
```rust
/// 定义应用状态
#[derive(Clone, Copy, Default, Eq, PartialEq, Debug, Hash, States)]  
pub enum AppState {  
    #[default]  
    Splash,  
    MainMenu,  
    Gameplay,  
}
```
Menu和Gameplay部分可以参考官方项目[示例代码](https://github.com/bevyengine/bevy/blob/main/examples/games/game_menu.rs)
```rust
fn splash_setup(mut commands: Commands, asset_server: Res<AssetServer>) {  
    let font = asset_server.load("fonts/MinecraftEvenings.ttf");  
    let text_font = TextFont {  
        font: font.clone(),  
        font_size: 50.0,  
        ..default()  
    };  
    let text_justification = JustifyText::Center;  
    // Display the logo  
    commands  
        .spawn((  
            Node {  
                align_items: AlignItems::Center,  
                justify_content: JustifyContent::Center,  
                width: Val::Percent(100.0),  
                height: Val::Percent(100.0),  
                ..default()  
            },  
            OnSplashScreen,  
        ))  
        .with_children(|parent| {  
            parent.spawn((  
                UiImage::new(asset_server.load("images/puzzle.jpg")),  
                Node {  
                    width: Val::Percent(100.0),  
                    ..default()  
                },  
            ));  
  
            parent.spawn((  
                Text::new("Jigsaw Puzzle"),  
                text_font.clone(),  
                TextLayout::new_with_justify(text_justification),  
                TextColor(BLACK.into()),  
                Node {  
                    position_type: PositionType::Absolute,  
                    left: Val::Px(100.0),  
                    bottom: Val::Px(100.0),  
                    ..default()  
                },  
            ));  
        });  
  
    // Insert the timer as a resource  
    commands.insert_resource(SplashTimer(Timer::from_seconds(3.0, TimerMode::Once)));  
}
```
我们读取一张背景图片铺在窗口里，然后在左下角显示游戏名称， 注意这里文字位置用了绝对定位。
显示效果
![](https://assets.zool.me/2024/11/3b8e4f42111334e861b5fdb940e82fb5.png)