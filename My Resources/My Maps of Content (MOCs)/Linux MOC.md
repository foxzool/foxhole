---
Status: 
tags: "moc"
Links: ["[[My Maps of Content (MOCs)]]"]
Created: 2024-07-11T11:20:06
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

- [[My Inputs/My Articles/Rockchip RK3588 - 移植uboot 2017.09 & linux 6.1（友善之家脚本方式）.md|Rockchip RK3588 - 移植uboot 2017.09 & linux 6.1（友善之家脚本方式）]]: false
- [[My Inputs/My Articles/串口调试利器 -- Minicom配置及使用详解.md|串口调试利器 -- Minicom配置及使用详解]]: false

%% DATAVIEW_PUBLISHER: end %%

### Notes

%% DATAVIEW_PUBLISHER: start
```dataview
list from [[]] AND !outgoing([[]]) AND !#input AND !#thought AND !"Hidden"
sort file.mtime desc
```
%%

- [[My Resources/My Maps of Content (MOCs)/Ubuntu MOC.md|Ubuntu MOC]]
- [[My Resources/My Maps of Content (MOCs)/Android MOC.md|Android MOC]]
- [[My Inputs/My Articles/Change-Hostname-on-Linux.md|Change-Hostname-on-Linux]]

%% DATAVIEW_PUBLISHER: end %%

### Inputs

%% DATAVIEW_PUBLISHER: start
```dataview
table tags as Type, Links, Created
from [[]] AND #input AND !"Hidden"
sort file.mtime desc
```
%%

| File                                                                                                                                          | Type                                                             | Links                                                                                                                                                                                                                                                     | Created                      |
| --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| [[My Inputs/My Articles/如何在 Linux 主机和 KVM 中的 Windows 客户机之间共享文件夹.md\|如何在 Linux 主机和 KVM 中的 Windows 客户机之间共享文件夹]]                                 | <ul><li>input/articles</li></ul>                                 | <ul><li>[[My Resources/My Maps of Content (MOCs)/Linux MOC.md\|Linux MOC]]</li></ul>                                                                                                                                                                     | 3:42 PM - September 02, 2024 |
| [[My Inputs/My Articles/paru - Feature packed AUR helper.md\|paru - Feature packed AUR helper]]                                               | <ul><li>input/articles</li></ul>                                 | <ul><li>[[My Resources/My Maps of Content (MOCs)/Linux MOC.md\|Linux MOC]]</li><li>[[My Resources/My Maps of Content (MOCs)/DevOps MOC.md\|DevOps MOC]]</li><li>[[My Resources/My Maps of Content (MOCs)/Arch Linux MOC.md\|Arch Linux MOC]]</li></ul> | 12:48 PM - August 12, 2024   |
| [[My Inputs/My Articles/Linux tar.gz、tar、bz2、zip 等解压缩、压缩命令详解.md\|Linux tar.gz、tar、bz2、zip 等解压缩、压缩命令详解]]                                       | <ul><li>input/articles</li></ul>                                 | <ul><li>[[My Resources/My Maps of Content (MOCs)/Linux MOC.md\|Linux MOC]]</li></ul>                                                                                                                                                                     | 2:53 PM - August 12, 2024    |
| [[My Inputs/My Articles/命令行判断显示器数量.md\|命令行判断显示器数量]]                                                                                           | <ul><li>input/articles</li><li>powershell</li><li>bash</li></ul> | <ul><li>[[My Resources/My Maps of Content (MOCs)/Windows MOC.md\|Windows MOC]]</li><li>[[My Resources/My Maps of Content (MOCs)/DevOps MOC.md\|DevOps MOC]]</li><li>[[My Resources/My Maps of Content (MOCs)/Linux MOC.md\|Linux MOC]]</li></ul>       | 3:47 PM - August 06, 2024    |
| [[My Inputs/My Articles/Rockchip RK3588 - 移植uboot 2017.09 & linux 6.1（友善之家脚本方式）.md\|Rockchip RK3588 - 移植uboot 2017.09 & linux 6.1（友善之家脚本方式）]] | <ul><li>input/articles</li></ul>                                 | <ul><li>[[My Resources/My Maps of Content (MOCs)/Linux MOC.md\|Linux MOC]]</li><li>[[nanopi 3588 调试\|nanopi 3588 调试]]</li></ul>                                                                                                                         | 10:56 AM - July 24, 2024     |
| [[My Inputs/My Articles/串口调试利器 -- Minicom配置及使用详解.md\|串口调试利器 -- Minicom配置及使用详解]]                                                               | <ul><li>input/articles</li></ul>                                 | <ul><li>[[My Resources/My Maps of Content (MOCs)/Linux MOC.md\|Linux MOC]]</li></ul>                                                                                                                                                                     | 6:55 PM - July 25, 2024      |
| [[My Inputs/My Articles/Linux find 命令.md\|Linux find 命令]]                                                                                     | <ul><li>input/articles</li></ul>                                 | <ul><li>[[My Resources/My Maps of Content (MOCs)/Linux MOC.md\|Linux MOC]]</li></ul>                                                                                                                                                                     | 11:22 AM - July 24, 2024     |
| [[My Inputs/My Articles/how-to-command-ping-display-time-and-date-of-ping.md\|how-to-command-ping-display-time-and-date-of-ping]]             | <ul><li>input/articles</li></ul>                                 | <ul><li>[[My Resources/My Maps of Content (MOCs)/Linux MOC.md\|Linux MOC]]</li></ul>                                                                                                                                                                     | 1:59 PM - July 15, 2024      |

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
