---
Status: 
tags:
  - moc
Links:
  - "[[My Maps of Content (MOCs)]]"
Created: 2024-07-12T10:50:22
---
## Notes

## Queries
### To Develop

%% DATAVIEW_PUBLISHER: start
```dataview
list !"Hidden"
where contains(Links, this.file.link) and contains(file.frontmatter.Status, "🌱")
sort file.mtime desc
```
%%

- [[My Inputs/My Articles/安装配置starship.md|安装配置starship]]: false
- [[My Inputs/My Articles/win11关闭windows自动更新.md|win11关闭windows自动更新]]: false

%% DATAVIEW_PUBLISHER: end %%

### Notes

%% DATAVIEW_PUBLISHER: start
```dataview
list from [[]] AND !outgoing([[]]) AND !#input AND !#thought AND !"Hidden"
sort file.mtime desc
```
%%

- [[My Resources/My Maps of Content (MOCs)/Home Assistant MOC.md|Home Assistant MOC]]
- [[PowerShell 配置文件.md|PowerShell 配置文件]]

%% DATAVIEW_PUBLISHER: end %%

### Inputs

%% DATAVIEW_PUBLISHER: start
```dataview
table tags as Type, Links, Created
from [[]] AND #input AND !"Hidden"
sort file.mtime desc
```
%%

| File                                                                                                                                                      | Type                                                              | Links                                                                                                                                                                                                                                                         | Created                      |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| [[My Inputs/My Articles/MQTT QoS 0, 1, 2 介绍.md\|MQTT QoS 0, 1, 2 介绍]]                                                                                     | <ul><li>input/articles</li></ul>                                  | <ul><li>[[My Resources/My Maps of Content (MOCs)/DevOps MOC.md\|DevOps MOC]]</li></ul>                                                                                                                                                                       | 4:27 PM - September 13, 2024 |
| [[My Inputs/My Articles/monitor-your-debian-10-vps-with-influxdb-telegraf-and-grafana.md\|monitor-your-debian-10-vps-with-influxdb-telegraf-and-grafana]] | <ul><li>input/articles</li></ul>                                  | <ul><li>[[My Resources/My Maps of Content (MOCs)/DevOps MOC.md\|DevOps MOC]]</li></ul>                                                                                                                                                                       | 7:48 PM - August 30, 2024    |
| [[My Inputs/My Articles/如何安装及设置ArchWSL.md\|如何安装及设置ArchWSL]]                                                                                               | <ul><li>input/articles</li><li>wsl</li></ul>                      | <ul><li>[[My Resources/My Maps of Content (MOCs)/DevOps MOC.md\|DevOps MOC]]</li><li>[[My Resources/My Maps of Content (MOCs)/Arch Linux MOC.md\|Arch Linux MOC]]</li><li>[[My Resources/My Maps of Content (MOCs)/Windows MOC.md\|Windows MOC]]</li></ul> | 12:40 PM - August 12, 2024   |
| [[My Inputs/My Articles/paru - Feature packed AUR helper.md\|paru - Feature packed AUR helper]]                                                           | <ul><li>input/articles</li></ul>                                  | <ul><li>[[My Resources/My Maps of Content (MOCs)/Linux MOC.md\|Linux MOC]]</li><li>[[My Resources/My Maps of Content (MOCs)/DevOps MOC.md\|DevOps MOC]]</li><li>[[My Resources/My Maps of Content (MOCs)/Arch Linux MOC.md\|Arch Linux MOC]]</li></ul>     | 12:48 PM - August 12, 2024   |
| [[My Inputs/My Articles/安装配置starship.md\|安装配置starship]]                                                                                                   | <ul><li>input/articles</li></ul>                                  | <ul><li>[[My Resources/My Maps of Content (MOCs)/DevOps MOC.md\|DevOps MOC]]</li><li>starship</li></ul>                                                                                                                                                      | 3:17 PM - August 28, 2024    |
| [[My Inputs/My Articles/wsl连接usb设备.md\|wsl连接usb设备]]                                                                                                       | <ul><li>input/articles</li><li>wsl</li></ul>                      | <ul><li>[[My Resources/My Maps of Content (MOCs)/DevOps MOC.md\|DevOps MOC]]</li><li>[[My Resources/My Maps of Content (MOCs)/Windows MOC.md\|Windows MOC]]</li></ul>                                                                                       | 5:22 PM - August 27, 2024    |
| [[My Inputs/My Articles/vcpkg downloads installed 等目录做啥用的？.md\|vcpkg downloads installed 等目录做啥用的？]]                                                       | <ul><li>input/articles</li><li>vcpkg</li></ul>                    | <ul><li>[[My Resources/My Maps of Content (MOCs)/DevOps MOC.md\|DevOps MOC]]</li><li>[[My Resources/My Maps of Content (MOCs)/Windows MOC.md\|Windows MOC]]</li></ul>                                                                                       | 7:18 PM - August 22, 2024    |
| [[My Inputs/My Articles/WINDOWS下kill进程的命令.md\|WINDOWS下kill进程的命令]]                                                                                         | <ul><li>input/articles</li></ul>                                  | <ul><li>[[My Resources/My Maps of Content (MOCs)/DevOps MOC.md\|DevOps MOC]]</li><li>[[My Resources/My Maps of Content (MOCs)/Windows MOC.md\|Windows MOC]]</li></ul>                                                                                       | 10:37 AM - August 22, 2024   |
| [[My Inputs/My Articles/update-pwsh-with-scoop.md\|update-pwsh-with-scoop]]                                                                               | <ul><li>input/articles</li><li>powershell</li><li>scoop</li></ul> | <ul><li>[[My Resources/My Maps of Content (MOCs)/DevOps MOC.md\|DevOps MOC]]</li><li>[[My Resources/My Maps of Content (MOCs)/Windows MOC.md\|Windows MOC]]</li></ul>                                                                                       | 10:29 AM - August 22, 2024   |
| [[My Inputs/My Articles/just.md\|just]]                                                                                                                   | <ul><li>input/articles</li><li>rust</li></ul>                     | <ul><li>[[My Resources/My Maps of Content (MOCs)/Rust MOC.md\|Rust MOC]]</li><li>[[My Resources/My Maps of Content (MOCs)/DevOps MOC.md\|DevOps MOC]]</li></ul>                                                                                             | 12:01 PM - August 16, 2024   |
| [[My Inputs/My Articles/fzf.md\|fzf]]                                                                                                                     | <ul><li>input/articles</li><li>go</li></ul>                       | <ul><li>[[My Resources/My Maps of Content (MOCs)/DevOps MOC.md\|DevOps MOC]]</li></ul>                                                                                                                                                                       | 12:44 PM - August 16, 2024   |
| [[My Inputs/My Articles/Scoop安装Chrome设置默认浏览器不加载用户数据的问题.md\|Scoop安装Chrome设置默认浏览器不加载用户数据的问题]]                                                               | <ul><li>input/articles</li><li>scoop</li></ul>                    | <ul><li>[[My Resources/My Maps of Content (MOCs)/Windows MOC.md\|Windows MOC]]</li><li>[[My Resources/My Maps of Content (MOCs)/DevOps MOC.md\|DevOps MOC]]</li></ul>                                                                                       | 8:32 PM - August 14, 2024    |
| [[My Inputs/My Articles/Window包管理工具Scoop.md\|Window包管理工具Scoop]]                                                                                           | <ul><li>input/articles</li><li>scoop</li></ul>                    | <ul><li>[[My Resources/My Maps of Content (MOCs)/Windows MOC.md\|Windows MOC]]</li><li>[[My Resources/My Maps of Content (MOCs)/DevOps MOC.md\|DevOps MOC]]</li></ul>                                                                                       | 8:26 PM - August 09, 2024    |
| [[My Inputs/My Articles/Clash Verge系列使用最佳实践.md\|Clash Verge系列使用最佳实践]]                                                                                     | <ul><li>input/articles</li><li>clash</li></ul>                    | <ul><li>[[My Resources/My Maps of Content (MOCs)/DevOps MOC.md\|DevOps MOC]]</li></ul>                                                                                                                                                                       | 1:31 PM - August 13, 2024    |
| [[My Inputs/My Articles/vcpkg的安装与使用.md\|vcpkg的安装与使用]]                                                                                                     | <ul><li>input/articles</li><li>vcpkg</li></ul>                    | <ul><li>[[My Resources/My Maps of Content (MOCs)/DevOps MOC.md\|DevOps MOC]]</li></ul>                                                                                                                                                                       | 10:14 AM - August 12, 2024   |
| [[My Inputs/My Articles/设置vcpkg默认安装64位库.md\|设置vcpkg默认安装64位库]]                                                                                             | <ul><li>input/articles</li><li>vcpkg</li></ul>                    | <ul><li>[[My Resources/My Maps of Content (MOCs)/Windows MOC.md\|Windows MOC]]</li><li>[[My Resources/My Maps of Content (MOCs)/DevOps MOC.md\|DevOps MOC]]</li></ul>                                                                                       | 10:11 AM - August 12, 2024   |
| [[My Inputs/My Articles/2024年，提升Windows开发和使用体验实践 - 终端&命令行篇 .md\|2024年，提升Windows开发和使用体验实践 - 终端&命令行篇 ]]                                                     | <ul><li>input/articles</li></ul>                                  | <ul><li>[[My Resources/My Maps of Content (MOCs)/DevOps MOC.md\|DevOps MOC]]</li><li>[[My Resources/My Maps of Content (MOCs)/Windows MOC.md\|Windows MOC]]</li></ul>                                                                                       | 9:03 PM - August 09, 2024    |
| [[My Inputs/My Articles/命令行判断显示器数量.md\|命令行判断显示器数量]]                                                                                                       | <ul><li>input/articles</li><li>powershell</li><li>bash</li></ul>  | <ul><li>[[My Resources/My Maps of Content (MOCs)/Windows MOC.md\|Windows MOC]]</li><li>[[My Resources/My Maps of Content (MOCs)/DevOps MOC.md\|DevOps MOC]]</li><li>[[My Resources/My Maps of Content (MOCs)/Linux MOC.md\|Linux MOC]]</li></ul>           | 3:47 PM - August 06, 2024    |
| [[My Inputs/My Articles/win11关闭windows自动更新.md\|win11关闭windows自动更新]]                                                                                       | <ul><li>input/articles</li></ul>                                  | <ul><li>[[My Resources/My Maps of Content (MOCs)/DevOps MOC.md\|DevOps MOC]]</li></ul>                                                                                                                                                                       | 12:08 PM - August 02, 2024   |
| [[My Inputs/My Articles/How to import x509.pem pk8 file into jks keystore.md\|How to import x509.pem pk8 file into jks keystore]]                         | <ul><li>input/articles</li></ul>                                  | <ul><li>[[My Resources/My Maps of Content (MOCs)/DevOps MOC.md\|DevOps MOC]]</li></ul>                                                                                                                                                                       | 7:41 PM - August 01, 2024    |
| [[My Inputs/My Articles/解决Windows英文版中文字体显示难看问题.md\|解决Windows英文版中文字体显示难看问题]]                                                                               | input/articles                                                    | <ul><li>[[My Resources/My Maps of Content (MOCs)/DevOps MOC.md\|DevOps MOC]]</li></ul>                                                                                                                                                                       | 10:09 AM - July 31, 2024     |
| [[My Inputs/My Articles/Visual Studio 2019修改编码UTF-8.md\|Visual Studio 2019修改编码UTF-8]]                                                                     | <ul><li>input/articles</li></ul>                                  | <ul><li>[[My Resources/My Maps of Content (MOCs)/DevOps MOC.md\|DevOps MOC]]</li></ul>                                                                                                                                                                       | 11:30 AM - July 30, 2024     |
| [[My Inputs/My Articles/git 设置和取消代理.md\|git 设置和取消代理]]                                                                                                     | <ul><li>input/articles</li><li>proxy</li></ul>                    | <ul><li>[[My Resources/My Maps of Content (MOCs)/DevOps MOC.md\|DevOps MOC]]</li></ul>                                                                                                                                                                       | 10:38 AM - July 22, 2024     |
| [[My Inputs/My Articles/Checkbox Tables in Markdown.md\|Checkbox Tables in Markdown]]                                                                     | input/articles                                                    | <ul><li>[[My Resources/My Maps of Content (MOCs)/DevOps MOC.md\|DevOps MOC]]</li></ul>                                                                                                                                                                       | 1:50 PM - July 19, 2024      |
| [[My Inputs/My Articles/使用acme.sh申请Let’s Encrypt SSL证书并自动上传到阿里云CDN.md\|使用acme.sh申请Let’s Encrypt SSL证书并自动上传到阿里云CDN]]                                       | <ul><li>input/articles</li></ul>                                  | <ul><li>[[My Resources/My Maps of Content (MOCs)/DevOps MOC.md\|DevOps MOC]]</li></ul>                                                                                                                                                                       | 10:45 AM - July 12, 2024     |

%% DATAVIEW_PUBLISHER: end %%

### Thoughts

%% DATAVIEW_PUBLISHER: start
```dataview
table Created
from [[]] AND #thought AND !"Hidden"
sort file.mtime desc
```
%%

| File | Created |
| ---- | ------- |

%% DATAVIEW_PUBLISHER: end %%
