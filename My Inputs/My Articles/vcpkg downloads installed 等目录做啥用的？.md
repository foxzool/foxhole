---
Status: 🟩
tags:
  - input/articles
  - vcpkg
Links:
  - "[[DevOps MOC]]"
  - "[[Windows MOC]]"
Created: 2024-08-22T19:18:53
Source:
  - https://www.cnblogs.com/itfanr/p/17830833.html
Author: 
Collection: 
Finished: 
Rating:
---
## Summary
`vcpkg` 是一个C++包管理器，它有几个重要的目录：

1. `downloads`：这个目录用于存储下载的包的源代码。当你安装一个包时，`vcpkg` 首先会下载包的源代码到这个目录。
    
2. `installed`：这个目录用于存储已经构建和安装的包。当你构建一个包时，`vcpkg` 会在这个目录下创建一个新的子目录，并将构建的结果（例如库文件和头文件）放在这个子目录中。
    
3. `ports`：这个目录包含了所有可用包的构建脚本。每个包都有一个对应的子目录，这个子目录中包含了一个名为`portfile.cmake`的文件，这个文件描述了如何下载、构建和安装这个包。
    
4. `packages`：这个目录用于存储构建的中间结果。当你构建一个包时，`vcpkg` 会在这个目录下创建一个新的子目录，并将构建的中间结果（例如对象文件）放在这个子目录中。
    
5. `buildtrees`：这个目录用于存储构建过程中的临时文件。每次构建一个包，`vcpkg` 都会在这个目录下创建一个新的子目录，并在这个子目录中进行构建。