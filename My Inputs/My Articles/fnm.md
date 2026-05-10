---
Status: 🟨
tags:
  - input/articles
  - rust
Links:
  - "[[Rust MOC]]"
Created: 2024-08-16T11:06:08
Source:
  - https://github.com/Schniz/fnm
Author: 
Collection: "[[Rust Crate Collection]]"
Finished: 
Rating:
---
## Summary
🚀 Fast and simple Node.js version manager, built in Rust
rust 写的nodejs版本管理器
## 安装
### Arch linux
``` sh
paru -S fnm
```
## 命令行设置
### Bash
```
eval "$(fnm env --use-on-cd --shell bash)"
```
### Zsh
```
eval "$(fnm env --use-on-cd --shell zsh)"
```

### fish
``` sh
fnm env --use-on-cd --shell fish | source
```
### PowerShell
```
fnm env --use-on-cd --shell power-shell | Out-String | Invoke-Expression
```

