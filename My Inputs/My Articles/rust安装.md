---
Status: 🟩
tags:
  - input/articles
  - rust
Links:
  - "[[Rust MOC]]"
Created: 2024-08-16T10:18:07
Source:
  - https://rsproxy.cn/#getStarted
Author: 
Collection: 
Finished: 
Rating:
---
## 配置说明
### 步骤一：设置 Rustup 镜像， 修改配置 ~/.zshrc or ~/.bashrc or ~/.config/fish/config.fish
```
export RUSTUP_DIST_SERVER="https://rsproxy.cn"
export RUSTUP_UPDATE_ROOT="https://rsproxy.cn/rustup"
```
### 步骤二：安装 Rust（请先完成步骤一的环境变量导入并 source rc 文件或重启终端生效）
```
curl --proto '=https' --tlsv1.2 -sSf https://rsproxy.cn/rustup-init.sh | sh
```
### 步骤三：设置 crates.io 镜像， 修改配置 ~/.cargo/config，已支持git协议和sparse协议，>=1.68 版本建议使用 sparse-index，速度更快。
```
[source.crates-io]
replace-with = 'rsproxy-sparse'
[source.rsproxy]
registry = "https://rsproxy.cn/crates.io-index"
[source.rsproxy-sparse]
registry = "sparse+https://rsproxy.cn/index/"
[registries.rsproxy]
index = "https://rsproxy.cn/crates.io-index"
[net]
git-fetch-with-cli = true
```
