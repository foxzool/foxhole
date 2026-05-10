---
Status: 🟨
tags:
  - input/articles
  - rust
Links:
  - "[[Rust MOC]]"
Created: 2024-06-26T11:51:00
Source:
  - https://github.com/rust-lang-nursery/lazy-static.rs
Author: 
Collection: "[[Rust Crate Collection]]"
Finished: 
Rating:
---
## Summary
A small macro for defining lazy evaluated static variables in Rust.
rust 延迟计算的宏
## Notes

### 安装
``` toml
[dependencies]
lazy_static = "1.5.0"
```

### Example
``` rust
use lazy_static::lazy_static;
use std::collections::HashMap;

lazy_static! {
    static ref HASHMAP: HashMap<u32, &'static str> = {
        let mut m = HashMap::new();
        m.insert(0, "foo");
        m.insert(1, "bar");
        m.insert(2, "baz");
        m
    };
}

fn main() {
    // First access to `HASHMAP` initializes it
    println!("The entry for `0` is \"{}\".", HASHMAP.get(&0).unwrap());

    // Any further access to `HASHMAP` just returns the computed value
    println!("The entry for `1` is \"{}\".", HASHMAP.get(&1).unwrap());
}
```
## Highlights
