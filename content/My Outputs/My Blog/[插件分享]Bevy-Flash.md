---
title: "[插件分享]Bevy-Flash"
Status: 🟩
tags:
  - output/blog
Links:
  - "[[Bevy MOC]]"
Created: 2025-04-04
BevyVersion:
  - "0.15"
share: true
Finished: 2025-04-04
---
# 前言

20多年前，Flash作为矢量动画与视频播放工具风靡一时，网页游戏也助推Flash上了神坛。

但随着移动设备的流行，Flash的兼容性和安全性带来了很多挑战，Adobe也在2020年底逐步淘汰了Flash插件。

Flash辉煌的年代留下了多优秀的作品，为了能继续运行这些flash，有人用rust开发了 [ruffle](https://github.com/ruffle-rs/ruffle)Flash Player 模拟器， 然后我们的这次分享的主角出现了:  [bevy_flash](https://github.com/aojiaoxiaolinlin/bevy_flash)

# Bevy-Flash 插件介绍
![预览效果](https://assets.zool.me/2025/04/25e9a20b34e42d09c644858de4185fb1.gif)

**Bevy-Flash** 是一个为 Bevy 游戏引擎设计的轻量级动画插件，专注于为游戏实体（Entity）提供高效的.swf渲染支持。通过简单的组件配置，开发者可以快速实现游戏对象的动态闪烁效果，适用于伤害提示、技能高亮、交互反馈等场景。

## 🎯 核心特性

### 🔥 动态闪烁控制

- **多参数调节**

支持持续时间、频率、缓动曲线、循环模式等配置

- **混合特效系统**

允许叠加颜色闪烁 + 尺寸脉冲 + 透明度变化组合效果

- **智能资源管理**

自动回收完成的效果实例，零内存泄漏风险

# 后记

个人开发做游戏UI时，苦恼于动画效果制作， bevy_flash 可以帮你复用一些之前的flash效果。