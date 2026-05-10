---
Status: 🟩
tags:
  - input/articles
Links:
  - "[[DevOps MOC]]"
Created: 2024-09-13T16:27:07
Source:
  - https://www.emqx.com/zh/blog/introduction-to-mqtt-qos
Author: 
Collection: 
Finished: "[[2024-09-13]]"
Rating: 10
---
MQTT 定义了三个 QoS 等级，分别为：

- QoS 0，最多交付一次。
- QoS 1，至少交付一次。
- QoS 2，只交付一次。

其中，使用 QoS 0 可能丢失消息，使用 QoS 1 可以保证收到消息，但消息可能重复，使用 QoS 2 可以保证消息既不丢失也不重复。QoS 等级从低到高，不仅意味着消息可靠性的提升，也意味着传输复杂程度的提升。