---
Status: 🟩
tags:
  - input/articles
  - wsl
Links:
  - "[[DevOps MOC]]"
  - "[[Arch Linux MOC]]"
  - "[[Windows MOC]]"
Created: 2024-08-12T12:40:57
Source:
  - https://wsldl-pg.github.io/ArchW-docs/locale/zh-CN/How-to-Setup/
Author: 
Collection: 
Finished: 
Rating: 
---
## Summary
```
DISM /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
DISM /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```

3. **启用虚拟化**：

- Intel处理器：找到“Intel Virtualization Technology”或“Intel VT-x”，将其设置为“Enabled”。
- AMD处理器：找到“AMD-V”或“SVM Mode”，将其设置为“Enabled”。
如果你使用的是 Windows 11 22H2 及以后的系统，根据[文档](https://learn.microsoft.com/en-us/windows/wsl/networking)，可以在 `C:\Users\<your_user>\.wslconfig` 中添加如下配置

```
[wsl2]
networkingMode = mirrored
autoproxy = true
```

再启动 WSL2 环境变量应该就自动设置好了
[## Notes
## 完成安装后的操作
如果你使用 WSL1 ，你将必须修改一下 glibc 包。更多详情，请查看已知问题章节。
设置Root密码
```
>Arch.exe
[root@PC-NAME]# passwd
```

设置默认用户
参考 ArchWiki 的 Sudo 和 User and groups 页。

>Arch.exe
[root@PC-NAME]# echo "%wheel ALL=(ALL) ALL" > /etc/sudoers.d/wheel
    (设置 sudoers 文件。)

[root@PC-NAME]# useradd -m -G wheel -s /bin/bash {username}
(添加用户)

[root@PC-NAME]# passwd {username}
(设置默认用户密码)

[root@PC-NAME]# exit

>Arch.exe config --default-user {username}
    (设置默认用户)

如果默认用户密码被更改 (issue #7), 请重启电脑或者用管理员CMD重启LxssManager。

要重启 LxssManager, 请运行：

net stop lxssmanager && net start lxssmanager

初始化密钥环（keyring）
请执行这些命令以初始化密钥环（keyring）。 (必须执行此步骤才可以使用 Pacman)

>Arch.exe
[user@PC-NAME]$ sudo pacman-key --init

[user@PC-NAME]$ sudo pacman-key --populate

[user@PC-NAME]$ sudo pacman -Syy archlinux-keyring
