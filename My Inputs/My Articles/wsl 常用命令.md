---
Status: 🌱
tags:
  - input/articles
Links:
  - "[[WSL MOC]]"
Created: 2024-08-28T13:04:48
Source:
  - https://4sysops.com/archives/export-and-import-windows-subsystem-for-linux-wsl/
Author: 
Collection: 
Finished: 
Rating:
---

## 查看当前的wsl的容器列表
```powershell
wsl -l -v
```
## 关闭wsl
```powershell
wsl --shutdown
```
## 导出文件
```powershell
wsl --export Ubuntu-22.04 d:\Ubuntu.tar
```
## 注销原容器
```
wsl --unregister Ubuntu-22.04
```
## 导入文件
``` powershell
wsl --import Ubuntu-22.04 d:\ubuntu D:\Ubuntu.tar
``` 
## 运行指定的分发版
```
wsl -d Ubuntu-22.04
```
## 修改默认用户
编辑`/etc/wsl.conf`,添加 ^ee5443
```
[user]
default=<username>
```
## 停止指定的分发版
```
wsl -t Ubuntu-22.04
```
