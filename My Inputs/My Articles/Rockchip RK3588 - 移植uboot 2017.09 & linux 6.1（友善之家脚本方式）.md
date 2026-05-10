---
Status: 🌱
tags:
  - input/articles
Links: ["[[Linux MOC]]", "[[nanopi 3588 调试]]"]
Created: 2024-07-24T10:56:44
Source:
  - https://www.cnblogs.com/zyly/p/17876350.html
Author: 
Collection: 
Finished: 
Rating:
---
## Summary
(1) 进入`MASKROM`模式

硬件方式：按住`Mask`键再长按`Power`键开机（保持按下`Mask`键5秒以上），将强制进入`MASKROM`模式；

(2) 进入`LOADER`模式

由于我使用的开发板不支持硬件进入`LOADER`模式，因此只能通过软件方式进入`LOADER`模式；

这一步的前提是`eMMC`已经烧录过固件，比如`debian-bullseye-desktop`，具体参考上一篇文章：`Windows`下通过`RKDevTool.exe`工具烧录。

按下`Power`键开发板启动，根文件系统加载完成后，通过在桌面终端输入`reboot loader`进入`LOADER`模式；
## Notes
查看刷机模式
``` 
sudo upgrade_tool LD
```
刷机

```
sudo upgrade_tool ul MiniLoaderAll.bin -noreset
sudo upgrade_tool di -p parameter.txt
sudo upgrade_tool di -uboot uboot.img
sudo upgrade_tool di -misc misc.img
sudo upgrade_tool di -dtbo dtbo.img
sudo upgrade_tool di -resource resource.img
sudo upgrade_tool di -k kernel.img
sudo upgrade_tool di -boot boot.img
sudo upgrade_tool di -rootfs rootfs.img
sudo upgrade_tool di -userdata userdata.img
sudo upgrade_tool RD
```
对于`MASKROM`模式，其中前两步和最后一步是必须的，中间的步骤根据实际情况进行调整。

按照前面介绍的方法尝试软件方式进入`LOADER`模式，然后烧录除了`MiniLoaderAll.bin`之后的所有镜像文件；
## Highlights
检查pin
```
cat /sys/kernel/debug/pinctrl/pinctrl-rockchip-pinctrl/pinmux-pins
```
