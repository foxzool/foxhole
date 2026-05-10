---
Status: 🟨
tags:
  - input/articles
  - wsl
Links:
  - "[[DevOps MOC]]"
  - "[[Windows MOC]]"
Created: 2024-08-27T17:22:23
Source:
  - https://learn.microsoft.com/en-us/windows/wsl/connect-usb#install-the-usbip-tools-and-hardware-database-in-linux
Author: 
Collection: 
Finished: "[[2024-08-27]]"
Rating: 9
---

# Install USBIPD on WSL

1. Go to the [latest release page for the usbipd-win project](https://github.com/dorssel/usbipd-win/releases).
2. Select the .msi file, which will download the installer. (You may get a warning asking you to confirm that you trust this download).
3. Run the downloaded usbipd-win_x.msi installer file.
常用命令
1. 设备列表
   `usbipd list`
2. 绑定设备(需要管理员权限)
   `usbipd bind --busid <budid>`
3. 将设备连接至wsl
   `usbipd attach --wsl --busid <busid>`
4. wsl里查看USB设备
   `lsusb`

# Setting up permissions for usb debugging in wsl2

1.  Setup `udev` rules  
    The following list contains a few of the commonly used debuggers. For custom rules see this [tutorial](https://www.clearpathrobotics.com/assets/guides/kinetic/ros/Udev%20Rules.html)  
    a. Setup OpenOCD udev rules
    
        ​​​​curl -fsSL https://raw.githubusercontent.com/openocd-org/openocd/master/contrib/60-openocd.rules | sudo tee /etc/udev/rules.d/60-openocd.rules
        
    
    b. Setup SEGGER udev rules  
    //Todo  
    c. Wlink udev rules  
    //Todo
2.  Restart udev service
    
        ​​​​sudo service udev restart
        
    
3.  Add user to `plugdev` group
    
        ​​​​sudo usermod -aG plugdev $USER
        
    
4.  Verify whether the current user was added
    
        ​​​​groups `whoami`
        
    
5.  Now reconnect the device and attach it to wsl2 as stated above.
6.  Verify if rules are set.  
    a. Find device id
    
        ​​​​$ lsusb
        ​​​​Bus 001 Device 006: ID 0483:374e STMicroelectronics STLINK-V3
        ​​​​Bus 001 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub
        
    
    b. Check device permissions and user group  
    Use the syntax `ls -l /dev/bus/usb/<Bus>/<Device>`
    
        ​​​​$ ls -l /dev/bus/usb/001/006
        ​​​​crw-rw-rw- 1 root plugdev 189, 5 Dec 27 14:14 /dev/bus/usb/001/006
        
    
    Ensure that the device is accesible by plugdev group and also the read, write permissions