---
Status: 
tags:
  - input/articles
  - rust
Links:
  - "[[Rust MOC]]"
Created: 2024-08-16T13:46:33
Source:
  - https://github.com/sharkdp/fd
Author: 
Collection: "[[Software Collection]]"
Finished: 
Rating: 
---
## Summary
A simple, fast and user-friendly alternative to 'find'
Rust写的文件查找cli
## Notes
* 简单查询
  `fd netfl`
* 正则查询
  `fd '^x.*rc$'`
* 在指定目录查询
  `fd passwd /etc`
## Highlights
默认不查询隐藏目录， 需要查询时添加`-H`
```
> fd pre-commit
> fd -H pre-commit
.git/hooks/pre-commit.sample
```
在git目录里，默认不查询忽略目录，需要查询时添加 `-I`
```
> fd num_cpu
> fd -I num_cpu
target/debug/deps/libnum_cpus-f5ce7ef99006aa05.rlib
```
如果都要查询 使用`-HI`，或者 `-u`