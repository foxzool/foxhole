---
Status: 
tags:
  - input/articles
Links:
  - "[[Rust MOC]]"
Created: 2024-06-25T17:43:00
Source:
  - https://doc.rust-lang.org/rustdoc/lints.html
Author: 
Collection: 
Finished: 
Rating: 
---
## Summary
配置 rustdoc 的lint
## Notes
在lib.rs 或者 main.rs 顶部添加
```
#![allow(rustdoc::broken_intra_doc_links)]
```

文档里加入 `no_run` 可以跳过测试

## Highlights