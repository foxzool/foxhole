---
Status: 🟩
tags:
  - input/articles
  - scoop
Links:
  - "[[Windows MOC]]"
  - "[[DevOps MOC]]"
Created: 2024-08-14T20:32:45
Source:
  - https://www.cnblogs.com/Dir-A/p/18149877
Author: 
Collection: 
Finished: 
Rating:
---
# 解决
打开注册表, 寻找ChromeHTML
```
Computer\HKEY_USERS\S-1-5-21-4241745024-2731878371-2167451356-1001\SOFTWARE\Classes\ChromeHTML.LRUVAM7VSMNF7N22QFWSTVUJYQ\shell\open\command
```
编辑default改为
```
"D:\Scoop\apps\googlechrome\current\chrome.exe" --user-data-dir="D:\Scoop\apps\googlechrome\current\User Data" --single-argument %1
```