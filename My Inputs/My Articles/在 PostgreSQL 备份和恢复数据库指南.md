---
Status: 
tags:
  - input/articles
  - postgresql
Links:
  - "[[Programing MOC]]"
Created: 2024-08-12T14:57:38
Source:
  - https://www.sjkjc.com/postgresql/backup-and-restore/
Author: 
Collection: 
Finished: 2024-10-21
Rating:
---
## ## 使用 `pg_dump` 备份一个数据库
`pg_dump -U username -W -F t db_name > output.tar`
说明：

- `-U username`: 指定连接 PostgreSQL 数据库服务器的用户。您可以在 `username` 位置使用自己的用户名。
    
- `-W`: 强制 `pg_dump` 在连接到 PostgreSQL 数据库服务器之前提示输入密码。按回车后， `pg_dump` 会提示输入 `postgres` 用户密码。
    
- `-F` : 指定输出文件的格式，它可以是以下格式之一：
    
    - `c`: 自定义格式
    - `d`: 目录格式存档
    - `t`: tar 文件包
    - `p`: SQL 脚本文件
- `db_name` 是要备份的数据库的名字。
    
- `output.tar` 是输出文件的路径。
## 使用 `pg_restore` 恢复数据库
```
pg_restore [option...] file_path
```

最常用的 `pg_restore` 用法如下：

```
pg_restore -U postgres -d db_name path_to_db_backup_file.tar
```