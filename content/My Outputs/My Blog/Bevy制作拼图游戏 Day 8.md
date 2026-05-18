---
title: Bevy制作拼图游戏 Day 8
Status: 🟩
tags:
  - output/blog
Links:
  - "[[Bevy MOC]]"
Created: 2024-11-21
BevyVersion:
  - "0.15"
share: true
Collection: "[[拼图游戏]]"
Finished: 2024-11-21
---
## 游戏状态
拆分一下单独的游戏状态，
``` rust
#[derive(Clone, Copy, Default, Eq, PartialEq, Debug, Hash, States)]  
pub enum GameState {  
    #[default]  
    Idle,  
    Setup,  
    Generating,  
    Play,  
    Pause,  
    Finish,  
}
```

## 生成拼图块
一块块生成，并且计数显示在UI上，所有块生成完后， 进入Play状态

``` rust
app.add_systems(  
    PostUpdate,  
    (handle_tasks, count_spawned_piece).run_if(in_state(GameState::Generating)),  
);

fn count_spawned_piece(  
    mut text: Single<&mut Text, With<PieceCount>>,  
    generator: Res<JigsawPuzzleGenerator>,  
    mut game_state: ResMut<NextState<GameState>>,  
    q_pieces: Query<Entity, With<ColorImage>>,  
) {  
    let loaded_pieces = q_pieces.iter().count();  
    text.0 = format!("{}/{}", loaded_pieces, generator.pieces_count());  
    if loaded_pieces == generator.pieces_count() {  
        game_state.set(GameState::Play)  
    }  
}
```

![](https://assets.zool.me/2024/11/4e00fcfcee39705cc89e66be734a13d3.png)

## 游戏计时
先定义一个秒表和它的显示方式
``` rust
#[derive(Resource, Deref, DerefMut, Debug)]  
pub struct GameTimer(pub Stopwatch);  
  
impl std::fmt::Display for GameTimer {  
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {  
        let elapsed = self.elapsed();  
        let seconds = elapsed.as_secs();  
        let minutes = seconds / 60;  
        let hours = minutes / 60;  
        write!(  
            f,  
            "{}",  
            format!("{:02}:{:02}:{:02}", hours, minutes % 60, seconds % 60)  
        )  
    }  
}
```

秒表(Stopwatch)需要用tick来驱动, 当我们在Play状态时， 调用system来计时和显示。在其他状态时，自动停止计时。
``` rust
.add_systems(  
    Update,  
    (  
        update_game_time
    )  
        .run_if(in_state(GameState::Play)),  
)

fn update_game_time(  
    mut game_timer: ResMut<GameTimer>,  
    time: Res<Time>,  
    mut text: Single<&mut Text, With<TimerText>>,  
) {  
    game_timer.tick(time.delta());  
    text.0 = game_timer.to_string();  
}
```
## 游戏暂停
暂停时，显示暂停界面UI， 点击界面和按ESC都可以返回Play状态
``` rust
// pause logic  
app.add_systems(OnEnter(GameState::Pause), setup_pause_ui)  
    .add_systems(OnExit(GameState::Pause), despawn_screen::<OnPauseScreen>)  
    .add_systems(Update, back_to_game.run_if(in_state(GameState::Pause)));
```
![](https://assets.zool.me/2024/11/c12ae81b4034a2490b2828d4ead5ab31.png)

## 游戏结算
同样， 拼图完成/放弃时，显示结算页面，显示计时成绩，可以返回菜单页，或者重新开始一局。
``` rust
// finish  
app.add_systems(  
    OnEnter(GameState::Finish),  
    (despawn_screen::<OnPlayScreen>, setup_finish_ui),  
)  
.add_systems(OnExit(GameState::Finish), despawn_screen::<OnFinishScreen>);
```

![](https://assets.zool.me/2024/11/869f0ce306a7e190d26538efed87e695.png)

## 游戏页面
![](https://assets.zool.me/2024/11/8bdb6f3cf2765bd995f35423efd78181.png)