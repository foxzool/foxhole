---
Status: 🌱
tags:
  - input/articles
Links:
  - "[[DevOps MOC]]"
  - starship
Created: 2024-08-28T15:17:49
Source:
  - https://starship.rs/zh-CN/guide/
Finished: 
Rating:
---
# 前置要求

- 安装并在终端启用 [Nerd Font](https://www.nerdfonts.com/) 字体（如 [Fira Code Nerd Font](https://www.nerdfonts.com/font-downloads) ）。
# 安装
## Windows
scoop
``` powershell
scoop install starship
```
## Linux
安装最新版本：

``` sh
curl -sS https://starship.rs/install.sh | sh
```
Arch Linux
```sh
pacman -S starship
```

## 配置shell脚本
- fish
在 `~/.config/fish/config.fish` 的最后，添加以下内容：
``` sh
starship init fish | source
```
- powershell
将以下内容添加到您 PowerShell 配置文件的末尾（通过运行 `$PROFILE` 来获取配置文件的路径）

``` powershell
Invoke-Expression (&starship init powershell)
```
- zsh
在 `~/.zshrc` 的最后，添加以下内容：
``` sh
eval "$(starship init zsh)"
```