---
Status: 🌿
tags:
  - input/articles
Links:
  - "[[fish-shell MOC]]"
Created: 2024-08-28T14:20:48
Source:
  - https://medium.com/@saadjamilakhtar/how-to-install-and-set-up-the-fish-shell-b9e0ddb12cc9
Author: 
Collection: 
Finished: 
Rating:
---
# 安装
## Linux
Ubuntu
``` bash
sudo apt-add-repository ppa:fish-shell/release-3
sudo apt update
sudo apt install fish
```
Arch linux
```sh
pacman -S fish
```
# 设置默认shell
## Linux
```sh
chsh -s /usr/bin/fish
```
    
alacritty终端需要修改配置
shell:
  program: /bin/zsh
# 配置文件
## Linux
一般在`~/.config/fish/config.fish`

# [Fisher](https://reckoning.dev/blog/fish-shell/)
	fish的包管理器
``` shell
curl -sL https://raw.githubusercontent.com/jorgebucaran/fisher/main/functions/fisher.fish | source && fisher install jorgebucaran/fisher
```
``` shell
fisher listc
```
```
### Z
 快速跳转目录
```shell
fisher install jethrokuan/z
```