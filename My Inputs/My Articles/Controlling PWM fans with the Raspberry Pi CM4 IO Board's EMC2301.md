---
Status: 
tags: "input/articles"
Links: 
Created: 2024-07-16T15:28:52
Source: "https://www.jeffgeerling.com/blog/2021/controlling-pwm-fans-raspberry-pi-cm4-io-boards-emc2301"
Author:
Collection:
Finished:
Rating:
---
## Summary
cm4io板用的是emc2301控制风扇
## Notes
关掉
```
i2cset -y 10 0x2f 0x30 0x00
```
满速
```
i2cset -y 10 0x2f 0x30 0xff
```
## Highlights
