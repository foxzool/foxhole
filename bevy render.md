---
Status: 🟨
tags:
  - note
Links:
  - "[[Bevy MOC]]"
Created: 2025-04-18T13:16:05
BevyVersion:
share:
---

原因如下：

1. 累加型历史区域（如探索/迷雾遮罩）需要跨帧保存和更新。每一帧你会读取“上一帧”的历史（history_read），并将“本帧”累加结果写入 history_write。
2. 如果你每一帧都用同一个纹理作为读写，GPU 行为是未定义的（不能同时读写同一 storage texture）。
3. 正确做法是：每帧交替切换 read/write（即 ping-pong），本帧写完，下帧 read/write 角色互换，保证历史信息持续累加且不会冲突。

典型流程如下：

- 帧N：history_read = A，history_write = B，写入结果到B
- 帧N+1：history_read = B，history_write = A，写入结果到A
- 如此循环

结论：  
history_read 和 history_write 必须做 ping-pong 交换，否则历史数据无法正确累加，也会导致 GPU 读写冲突。

# MainEntity
在 render world 里 Entity是自己world的entity,  MainEntity 时对应main_world的Entity

render world 里, component 是每个ticket都会清空,  但Resource是保留的

你提交 GPU 命令（Queue::submit）时，有一个 buffer 还处于 mapped 状态（即还被 CPU 映射着），wgpu 要求 buffer 不能同时被 mapped 和用于 GPU 操作。

每个node都会处理camera的输入, 所以需要用
`let view_entity = graph.view_entity();`
判断相机上是否有没有指定的组件进行判断.