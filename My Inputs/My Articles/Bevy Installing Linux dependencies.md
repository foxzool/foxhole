---
Status: 🌿
tags:
  - input/articles
Links:
  - "[[Bevy MOC]]"
Created: 2024-08-28T19:44:39
Source:
  - https://github.com/bevyengine/bevy/blob/main/docs/linux_dependencies.md
Author: 
Collection: 
Finished: 
Rating:
---
## Ubuntu
``` sh
sudo apt-get install g++ pkg-config libx11-dev libasound2-dev libudev-dev libxkbcommon-x11-0
```
安装wayland支持
``` sh
sudo apt-get install libwayland-dev libxkbcommon-dev
```
```sh
sudo apt install gucharmap # the GNOME Character Map app

```
更新mesa
```
sudo add-apt-repository ppa:kisak/kisak-mesa sudo apt update sudo apt upgrade sudo apt install vulkan-tools
```