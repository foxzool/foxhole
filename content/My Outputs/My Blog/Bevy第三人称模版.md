---
Status: 🟩
tags:
  - output/blog
Links:
  - "[[Bevy MOC|Bevy MOC]]"
Created: 2025-05-30T15:37:42
BevyVersion:
  - "0.16"
share: true
Finished: 2025-05-30
---

网上闲逛发了一个新的bevy模版,支持第三人称
[源码地址](https://github.com/olekspickle/bevy_new_third_person)

# 安装方式
``` bash
# 使用 cargo-generate
cargo generate olekspickle/bevy_new_third_person
# 使用 bevy_cli
bevy new -t=https://github.com/olekspickle/bevy_new_third_person my_bevy_app
```

# 特性
- 从 .ron 导入和使用游戏配置和参数
- 从 [BevyFlock](https://github.com/TheBevyFlock/bevy_new_2d) 示例进行简单资产加载
-  使用[bevy_third_person_camera](https://github.com/The-DevBlog/bevy_third_person_camera) 第三人称相机
- 使用 [Leafwing-input-manager](https://github.com/Leafwing-Studios/leafwing-input-manager) 将键盘和游戏手柄做简单映射
- 使用 [Avian3D](https://github.com/Jondolf/avian/tree/main/crates/avian3d) 实现碰撞体和刚体
- 使用 [bevy_tnua](https://github.com/idanarye/bevy-tnua) 进行简单的玩家移动
- 使用 [[bevy atmosphere example](https://bevyengine.org/examples/3d-rendering/atmosphere/)](https://bevyengine.org/examples/3d-rendering/atmosphere/) 实现日夜循环效果
- 使用 Quaternius 的 [Universal Animation Library](https://quaternius.itch.io/universal-animation-library) 实现角色行走动画
- 基于 Firewheel 音频引擎的 [bevy_seedling](https://github.com/CorvusPrudens/bevy_seedling) 的实验性声音（可能会取代 bevy_audio）
- 通过堆叠模态框在游戏和菜单中保持一致的 Esc 返回导航