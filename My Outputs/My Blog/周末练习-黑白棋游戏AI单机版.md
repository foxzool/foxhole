---
title: "周末练习-黑白棋游戏AI单机版"
Status: 🟩
tags:
  - output/blog
Links:
  - "[[Bevy MOC]]"
Created: 2025-07-04
BevyVersion:
  - "0.16"
share: true
Finished: 2025-07-25
---
周末练习制作
itch 在线游玩: https://foxzool.itch.io/reversi
源码: https://github.com/foxzool/reversi


在游戏结束时获得最多的棋子。


- 玩家轮流放置棋子
- 黑棋先手
- 放置棋子以夹住对手棋子
- 被夹住的棋子翻转为己方颜色
- 有合法走法时必须走棋
- 棋盘填满或无合法走法时游戏结束


• 必须至少夹住一个对手棋子

• 棋子在直线上被夹住（水平、垂直、对角线）

• 新棋子与已有棋子之间的所有对手棋子都会翻转

# 操作控制：

• 点击/触摸放置棋子

