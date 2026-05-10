---
Status: 🌲
tags:
  - input/articles
Links:
  - "[[Arch Linux MOC]]"
Created: 2024-08-29T15:45:13
Source:
  - https://chrpaul.de/posts/2019-07-19-enable-colour-emoji-support-on-manjaro-linux/
Author: 
Collection: 
Finished: "[[2024-08-29|2024-08-29]]"
Rating: 
---
 先安裝字体
```bash
sudo pacman -S noto-fonts-emoji
```
编辑`~/.config/fontconfig/fonts.conf`
```xml
<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
 <alias>
   <family>sans-serif</family>
   <prefer>
     <family>Noto Sans</family>
     <family>Noto Color Emoji</family>
     <family>Noto Emoji</family>
     <family>DejaVu Sans</family>
   </prefer> 
 </alias>

 <alias>
   <family>serif</family>
   <prefer>
     <family>Noto Serif</family>
     <family>Noto Color Emoji</family>
     <family>Noto Emoji</family>
     <family>DejaVu Serif</family>
   </prefer>
 </alias>

 <alias>
  <family>monospace</family>
  <prefer>
    <family>Noto Mono</family>
    <family>Noto Color Emoji</family>
    <family>Noto Emoji</family>
   </prefer>
 </alias>
</fontconfig>
```
