---
Status: 🌿
tags:
  - note
Links:
  - "[[WSL MOC]]"
Created: 2024-08-28T17:00:00
---
## WSL 移除 Windows 的 PATH

在 `/etc/wsl.conf` 中添加：
```
[interop]
appendWindowsPath = false
```

### 参见

- [[WSL MOC]]
- [[wsl开发配置]]
