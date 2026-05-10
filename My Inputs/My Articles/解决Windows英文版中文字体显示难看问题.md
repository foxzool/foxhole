---
Status: 
tags: "input/articles"
Links: ["[[DevOps MOC]]"]
Created: 2024-07-31T10:09:38
Source: "https://www.0shuo.com/archives/30"
Author:
Collection:
Finished:
Rating:
---
## Summary
## Notes
1.打开注册表编辑器（Win+R，输入【regedit】回车）

2.展开到 HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\FontLink\SystemLink

3.依次找到【Segoe UI】，【Tahoma】，【Microsoft Sans Serif】（这三个都是要改的）

4.双击Segoe UI找到 “MSYH.TTC,Microsoft YaHei UI,128,96”和“MSYH.TTC,Microsoft YaHei UI”

5.把它俩放在最前面。（就是先剪切，再去最前面粘贴）

6.分别双击Tahoma，Microsoft Sans Serif找到“MSYH.TTC,Microsoft YaHei UI”还是把它放在最前面。

7.保存后重启
## Highlights
