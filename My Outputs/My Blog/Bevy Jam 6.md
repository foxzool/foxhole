---
Status: 🌲
tags:
  - note
  - output/blog
Links:
  - "[[Bevy MOC]]"
Created: 2025-06-10T11:24:00
BevyVersion: "0.16"
share: true
---
# Bevy Jam #6
第一次参加game jam, 记一下流水账.

- itch.io 地址
  https://itch.io/jam/bevy-jam-6/rate/3627018
- 源码地址
  https://github.com/foxzool/last-stop

随着bevy  0.16 的发布, [第六次Bevy Jam](https://itch.io/jam/bevy-jam-6)活动随即开展.
本次Bevy Jam 主题为 **Chain Reaction**
提交时间为 2025 年 6月 1 日凌晨 1：00 至 2025 年 6 月 9 日下午 2：59

前几天时间大部分都在工作和陪家人,  抽空先确认了游戏主题方向是道路连接类型, 通过连接道路, 让乘客可以乘车到不同的站点.

本次Jam也是临时起意参加, 没有找人组队. 前两天就用 [bevy_cli](https://github.com/TheBevyFlock/bevy_cli) 搭配 [bevy_new_2d](https://github.com/TheBevyFlock/bevy_new_2d)
模版搭了项目模版, 上班空闲时间先和Claude聊天确认了游戏系统的框架系统, 然后下班空闲时间写点代码.

人到中年, 时间不是自己的了, 进度严重落后, 决定让AI辅助编写, 之前我用的是windsurf + gemeni/Claude,  知识库里bevy版本落后,生成的代码需要大量修改, 然后上下文长度有限, 遗忘严重.

测试了一圈, 周五咬了咬牙, 投入了Claude的怀抱, 开了Claude Pro + Claude Code. 真香.
把整个项目加入了Claude Pro的project,  然后在Claude Desktop里和AI聊天沟通需求, Claude Code 连到 RustRover 里一顿修改.   Bevy UI的写法落伍了, 让它联网搜索后就改正确了, 后面也记住了正确的写法, 真不错.

之前已经明确好了游戏框架设计, 所以整个游戏逻辑代码和UI大部分都是生成的, 我主要是提需求, 让Claude帮我修改, 比如说 A* 寻路算法等.   但游戏素材还是得自己找, 还好 https://itch.io/game-assets 和 https://kenney.nl/assets  https://opengameart.org/,  有很多免费素材.

下面是游戏画面效果:
![image.png](https://assets.zool.me/2025/06/59f0886f41169afeda7f3aefbd21466d.png)

![image.png](https://assets.zool.me/2025/06/2887ab1d5456eabc37888f531c54b668.png)
![image.png](https://assets.zool.me/2025/06/63a4f9ec16a1e154ccd8cc19ef47e3ed.png)

我这次在最后一天, 还做了双语切换
![image.png](https://assets.zool.me/2025/06/37cf4a7a29deb844dbf49d6ce4c607ee.png)

# 后记
这次参加Bevy Jam的目的主要是走一遍游戏发布流程, 评估一下AI辅助编程的效果.从结果来看, 目前Claude挺符合我的要求.

目前来说, bevy_cli + bevy_new_2d , 可以快速上手2d游戏开发. 新的[热加载插件](https://github.com/TheBevyFlock/bevy_simple_subsecond_system) 可以加快编译速度.

Bevy 快速发展3-4月一个版本更新的速度, 会影响AI知识库的代码, 但实际上Bevy ECS已经很稳定,  AI写出的代码是可以用的.  只是UI部分还在快速演进, 这部分AI需要MCP的帮助.

游戏的美工素材对个人来说是一个大问题, 但2D游戏在前期出MVP(最小可用模型)时, itch.io 和 kenney 上面的免费素材已经够用了.