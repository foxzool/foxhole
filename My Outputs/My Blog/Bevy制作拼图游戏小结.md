---
Status: 🟩
tags:
  - output/blog
Links:
  - "[[Bevy MOC]]"
Created: 2024-11-25T17:15:12
BevyVersion:
  - "0.15"
share: true
Collection: "[[拼图游戏]]"
Finished: 2024-11-25
---
## 项目收尾
参考以下两个项目给github action添加CI和build 
* [bevy_game_template](https://github.com/NiklasEi/bevy_game_template)
* [bevy_new_2d](https://github.com/TheBevyFlock/bevy_new_2d)

## 编译wasm
关闭 AssetPlugin 的 meta_check
``` rust
DefaultPlugins  
    .set(AssetPlugin {  
        meta_check: AssetMetaCheck::Never,  
        ..default()  
    })
```

安装trunk进行调试
``` bash
rustup target add wasm32-unknown-unknown
cargo install --locked trunk
trunk serve
```

如果碰到下列报错
``` bash
time not implemented on this platform
```
说明项目里用了std的Duration和Instant,  需要替换为`bevy::utils::Duration`和`bevy::utils::Instant`

实际wasm效果不好，可能是目前还是0.15rc的问题，有图块没有渲染， 生成图块会卡。等后续0.15发布再试更新看看。

## 项目后记
[项目地址](https://github.com/foxzool/jigsaw_puzzle)

作为第一个2D练手项目，差不多花了1个月，正巧bevy 0.15的rc发布，直接用了rc作为基础版本， 使用了最新的animation系统。

拼图游戏的逻辑实际上是很简单的， 前期大部分时间是用在了拼图生成库的研究，后期大部分时间用来调试UI。

bevy 0.15开始重新调整UI系统，为后面的bsn系统做准备，也是开发编辑器的前提。没有编译器之前， 调整UI还是一件费时费力的问题。

目前游戏还是内部指定了几个图片，实际上可以写个界面，通过unsplash接口在线选择图片。

如果有后端服务器，可以将生成拼图这一步放到后端去做， 前端只拿切好的图片就行了。