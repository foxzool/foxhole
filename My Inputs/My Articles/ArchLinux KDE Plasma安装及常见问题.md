---
Status: 🌲
tags:
  - input/articles
Links:
  - "[[Arch Linux MOC]]"
Created: "[[2024-08-29]]"
Source:
  - https://www.skyone.host/2024/archlinux-plasma-faq
Author: 
Collection: 
Finished: "[[2024-08-29]]"
Rating: 9
---
### 万恶的 NVIDIA 驱动

尽管 Arch Linux 提供里开箱即用的 NVIDIA 驱动包，但在 `plasma` + `wayland` 仍然有问题。首先安装 `nvidia` 驱动：

```
sudo pacman -S nvidia
```

这时一定不要重启，否则会进不去桌面。先创建 `/etc/modeprobe.d/nvidia_drm.conf` 文件，添加：

```
options nvidia-drm modeset=1
options nvidia-drm fbdev=1
```

再编辑 `/etc/mkinitcpio.conf` 文件，修改 `HOOKS` 行，将 `kms` 去掉，然后重新生成 `initramfs`：

```
sudo mkinitcpio -P
```

最后重启电脑，应该就可以进入 KDE Plasma 桌面了。