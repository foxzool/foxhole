---
Status: 🟩
tags:
  - input/articles
Links:
  - "[[DevOps MOC]]"
Created: 2024-08-16T11:48:36
areaGroup: work
---
# 配置文件位置
PowerShell 控制台支持以下基本配置文件。 这些文件路径是默认位置。

- 所有用户，所有主机
    - Windows - `$PSHOME\Profile.ps1`。
    - Linux - `/opt/microsoft/powershell/7/profile.ps1`
    - macOS - `/usr/local/microsoft/powershell/7/profile.ps1`
- 所有用户，当前主机
    - Windows - `$PSHOME\Microsoft.PowerShell_profile.ps1`。
    - Linux - `/opt/microsoft/powershell/7/Microsoft.PowerShell_profile.ps1`
    - macOS - `/usr/local/microsoft/powershell/7/Microsoft.PowerShell_profile.ps1`
- 当前用户，所有主机
    - Windows - `$HOME\Documents\PowerShell\Profile.ps1`。
    - Linux - `~/.config/powershell/profile.ps1`
    - macOS - `~/.config/powershell/profile.ps1`
- 当前用户，当前主机
    - Windows - `$HOME\Documents\PowerShell\Microsoft.PowerShell_profile.ps1`。
    - Linux - `~/.config/powershell/Microsoft.PowerShell_profile.ps1`
    - macOS - `~/.config/powershell/Microsoft.PowerShell_profile.ps1`
# 查看当前位置
```
echo $PSHOME
```