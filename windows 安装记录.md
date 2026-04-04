---
Status: 🟨
tags:
  - note
Links:
  - "[[Windows MOC]]"
Created: 2024-11-23T23:48:39
share: false
---
# 安装visual Studio
![](https://learn.microsoft.com/zh-cn/windows/images/rust-vs-workloads.png)
# 安装scoop包管理器
打开终端输入
``` powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
```

``` powershell
scoop install rustup
```

```
rustup install stable
```

```
> rustc --version
rustc 1.82.0 (f6e511eec 2024-10-15)
```

# 其他软件
```
scoop install git 
git config --global user.name "ZoOL"
git config --global user.email zhooul@gmail.com
scoop install firefox

scoop install main/openssh
sudo C:\Users\ZoOL\scoop\apps\openssh\current\install-sshd.ps1

scoop install docker
scoop install main/docker-compose
scoop install main/zig
scoop install just

```

# scoop extra
不知道怎么安装去 https://scoop.sh/#/
```
scoop bucket add extras
scoop install extras/obsidian
scoop install extras/jetbrains-toolbox
scoop install extras/wechat
scoop install extras/wecom
scoop install extras/yubikey-manager-qt
scoop install extras/discord
scoop install extras/mobaxterm
scoop install extras/mosquitto

```

```
scoop bucket add kkzzhizhou_scoop-apps https://github.com/kkzzhizhou/scoop-apps
scoop bucket add IsaacShoebottom_scoop-bucket https://github.com/IsaacShoebottom/scoop-bucket
```