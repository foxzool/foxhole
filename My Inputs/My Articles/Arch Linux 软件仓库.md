---
Status: 
tags:
  - input/articles
Links:
  - "[[Arch Linux MOC]]"
Created: 2024-08-12T13:00:36
Source:
  - https://mirrors.tuna.tsinghua.edu.cn/help/archlinux/
Author: 
Collection: 
Finished: 
Rating: 
---
## Summary
编辑 `/etc/pacman.d/mirrorlist`，在文件的最顶端添加：

`Server = https://mirrors.tuna.tsinghua.edu.cn/archlinux/$repo/os/$arch`

更新软件包缓存：

`pacman -Syyu`
## Notes
## Highlights
