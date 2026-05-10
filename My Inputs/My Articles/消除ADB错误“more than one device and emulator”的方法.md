---
Status: 
tags:
  - input/articles
Links: ["[[Android MOC]]"]
Created: 2024-07-26T14:49:54
Source:
  - https://blog.csdn.net/gaojinshan/article/details/9455193
Author: 
Collection: 
Finished: 
Rating:
---
## Summary
当我连着手机充电的时候，启动模拟器调试，执行ADB指令时，报错。
```
adb shell
error: more than one device and emulator
adb install e:\good.apk
error: more than one device and emulator
```

碰到这种情况，首先要查一下，是不是真的有多个设备或模拟器。
```

adb devices
List of devices attached
emulator-5554   device
4dfadcb86b00cf05        device
```

发现还真是多个设备，那就需要为ADB命令指定设备的序列号了。
`adb -s emulator-5554 shell`
也就是如上所示，给命令加上-s的参数就可以了！

如果实际上只有一个设备或模拟器，并且查到有offline的状态；
那就说明是ADB本身的BUG所导致的，就需要用如下的方法处理下了：
```
adb kill-server
taskkill /f /im adb.exe
```

第一条命令是杀ADB的服务，第二条命令是杀ADB的进程！
如果第一条没有用，才考虑用第二条命令再试试看的！
## Notes
## Highlights
