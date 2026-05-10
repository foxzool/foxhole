---
Status: 🟨
tags:
  - input/articles
Links:
  - "[[Linux MOC]]"
  - "[[DevOps MOC]]"
  - "[[Arch Linux MOC]]"
Created: 2024-08-12T12:48:41
Source:
  - https://github.com/Morganamilo/paru
Author: 
Collection: 
Finished: 
Rating: 
---
## Installation
```
sudo pacman -S --needed base-devel
git clone https://aur.archlinux.org/paru.git
cd paru
makepkg -si
```
## Examples

`paru <target>` -- Interactively search and install `<target>`.

`paru` -- Alias for `paru -Syu`.

`paru -S <target>` -- Install a specific package.

`paru -Sua` -- Upgrade AUR packages.

`paru -Qua` -- Print available AUR updates.

`paru -G <target>` -- Download the PKGBUILD and related files of `<target>`.

`paru -Gp <target>` -- Print the PKGBUILD of `<target>`.

`paru -Gc <target>` -- Print the AUR comments of `<target>`.

`paru --gendb` -- Generate the devel database for tracking `*-git` packages. This is only needed when you initially start using paru.

`paru -Bi .` -- Build and install a PKGBUILD in the current directory.