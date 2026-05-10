---
Status: 🟩
tags:
  - input/articles
Links:
  - "[[Arch Linux MOC]]"
Created: 2024-09-11T10:21:17
Source:
  - https://wiki.archlinux.org/title/NetworkManager
Author: 
Collection: 
Finished: "[[2024-09-11]]"
Rating: 10
---
## Summary
arch linux 会检查网络连接状态， 有时候会被vpn干扰
## Notes
修改 `/etc/NetworkManager/conf.d/20-connectivity.conf`
```
[connectivity]
enabled=false
```
