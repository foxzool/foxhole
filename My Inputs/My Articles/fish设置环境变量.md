---
Status: 🌲
tags:
  - input/articles
Links:
  - "[[fish-shell MOC]]"
Created: 2024-08-28T19:35:25
Source:
  - https://fishshell.com/docs/current/faq.html
Author: 
Collection: 
Finished: "[[2024-08-28|2024-08-28]]"
Rating: 8
---
## 使用`set`命令
修改`~/.config/fish/config.fish`可以持久化保存
``` fish
set -x key value # typically set -gx key value
set -e key
```