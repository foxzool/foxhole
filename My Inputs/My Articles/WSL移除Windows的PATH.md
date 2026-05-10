---
Status: 🟩
tags:
  - input/articles
Links:
  - "[[WSL MOC]]"
Created: "[[2024-08-27]]"
Source:
  - https://stackoverflow.com/questions/51336147/how-to-remove-the-win10s-path-from-wsl
Author: 
Collection: 
Finished: "[[2024-08-28|2024-08-28]]"
Rating: 10
---
## WSL移除Windows的PATH

^307508

编辑`/etc/wsl.conf`  
```ini
[interop]
appendWindowsPath = false
```

^050b87

