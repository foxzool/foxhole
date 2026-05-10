---
Status: 
tags:
  - input/articles
  - scoop
Links:
  - "[[Windows MOC]]"
  - "[[DevOps MOC]]"
Created: 2024-08-09T20:26:13
Source:
  - https://www.cnblogs.com/hongdada/p/11844277.html
Author: 
Collection: 
Finished: 
Rating:
---
## 安装
### scoop安装应用路径
```
[environment]::setEnvironmentVariable('SCOOP','D:\Scoop','User')
$env:SCOOP='D:\Scoop'
iex (new-object net.webclient).downloadstring('https://get.scoop.sh')
```
### 全局应用安装路径
```
[environment]::setEnvironmentVariable('SCOOP_GLOBAL','D:\Scoop\globalApps','Machine')
$env:SCOOP_GLOBAL='D:\Scoop\globalApps'
```

## Scoop 常用命令
scoop help 查看帮助
scoop help %3C某个命令%3E # 具体查看某个命令的帮助

scoop install <app>   # 安装 APP
scoop uinstall <app>  # 卸载 APP

scoop list  # 列出已安装的 APP
scoop search # 搜索 APP
scoop status # 检查哪些软件有更新

scoop update # 更新 Scoop 自身
scoop update appName1 appName2 # 更新某些app
scoop update *  # 更新所有 app （前提是需要在apps目录下操作）

scoop bucket known #通过此命令列出已知所有 bucket（软件源）
scoop bucket add bucketName #添加某个 bucket

scoop cache rm <app> # 移除某个app的缓存
安装卸载软件

# 安装之前，通过 search 搜索 APP, 确定软件名称
scoop search  xxx

# 安装 APP（注意软件使用安全，谨防违规）
scoop install AppName

# 安装特定版本的 APP；语法 AppName@[version]，示例
scoop install git@2.23.0.windows.1

# 卸载 APP 
scoop uninstall #卸载 APP
更新软件

scoop update # 更新 Scoop 自身

scoop update appName1 appName2 # 更新某些app

# 更新所有 app （可能需要在apps目录下操作）
scoop update *

# 禁止某程序更新
scoop hold <app>
# 允许某程序更新
scoop unhold <app>
清除缓存与旧版本

# 查看所有以下载的缓存信息
scoop cache show

# 清除指定程序的下载缓存
scoop cache rm <app>

# 清除所有缓存
scoop cache rm *

# 删除某软件的旧版本
scoop cleanup <app>

# 删除全局安装的某软件的旧版本
scoop cleanup <app> -g

# 删除过期的下载缓存
scoop cleanup <app> -k

创建别名

# 可用操作
scoop alias add|list|rm [<args>]

## 添加别名，格式：
scoop alias add <name> <command> <description>

# 示例：（注意：必须在 Powershell中运行）
scoop alias add st 'scoop status' '检查更新'
# 检查已添加的别名
scoop alias list -v

Name Command      Summary
---- -------      -------
st   scoop status 检查更新

# 测试已添加的别名 st
scoop st

# 另一个示例：
scoop alias add rm 'scoop uninstall $args[0]' '卸载某 app'
在同一程序的不同版本之间切换

scoop reset [app]@[version]
其它命令

# 显示某个app的信息
scoop info <app>

# 在浏览器中打开某app的主页
scoop home <app>

# 比如
scoop home git>)