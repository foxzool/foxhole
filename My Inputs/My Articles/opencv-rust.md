---
Status: 
tags:
  - input/articles
  - rust
Links: ["[[Rust MOC]]"]
Created: 2024-08-16T13:56:56
Source:
  - https://github.com/twistedfall/opencv-rust
Author: 
Collection: "[[Rust Crate Collection]]"
Finished: 
Rating: 
---
## Summary
## Notes
### Install
#### Linux
##### Arch Linux:

OpenCV package in Arch is suitable for this:

`pacman -S clang qt6-base opencv`

and additionally to support more OpenCV modules:

`pacman -S vtk glew fmt openmpi`

##### Ubuntu:
`apt install libopencv-dev clang libclang-dev`
#### Windows
```
vcpkg install llvm opencv4[contrib,nonfree]
```
## Highlights
