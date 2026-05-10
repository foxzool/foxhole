---
Status: 
tags:
  - input/articles
  - go
Links:
  - "[[DevOps MOC]]"
Created: 2024-08-16T12:44:38
Source:
  - https://github.com/junegunn/fzf
Author: 
Collection: "[[Software Collection]]"
Finished: 
Rating:
---
## Summary
🌸 A command-line fuzzy finder
命令行模糊查找器。
## Notes
### Install
Windows
```
scoop install fzf
```
Linux
```
paru -S fzf
```
## Setting up shell integration
- bash (~/.bashrc)
    
    ```sh
    eval "$(fzf --bash)"
    ```
    
- zsh (~/.zshrc)
    
    ```sh
    source <(fzf --zsh)
    ```
    
- fish (~/.config/fish/config.fish)
    
    ```fish
    fzf --fish | source
    ```

## Match types

|Token|Match type|Description|
|---|---|---|
|`sbtrkt`|fuzzy-match|Items that include `sbtrkt` characters in that order|
|`'wild`|exact-match (quoted)|Items that include `wild`|
|`^music`|prefix-exact-match|Items that start with `music`|
|`.mp3$`|suffix-exact-match|Items that end with `.mp3`|
|`!fire`|inverse-exact-match|Items that do not include `fire`|
|`!^music`|inverse-prefix-exact-match|Items that do not start with `music`|
|`!.mp3$`|inverse-suffix-exact-match|Items that do not end with `.mp3`|
## Highlights
