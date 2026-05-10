---
Status: 🟩
tags:
  - input/articles
Links:
  - "[[DevOps MOC]]"
  - "[[Windows MOC]]"
Created: 2024-08-22T10:37:43
Source:
  - https://www.cnblogs.com/mq0036/p/3843058.html
Author: 
Collection: 
Finished: 
Rating: 
---
相信大家都有用命令行(CMD)解决问题的习惯，起码我感觉自己在处理Windows系统故障时越来越离不开Windows PE了，今天我想介绍两个很实用的命令：Tasklist与Tskill。  
**命令：Tasklist**   
功能：命令用来显示运行在本地或远程计算机上的所有进程，可以监控用户的操作。   
命令格式：   
Tasklist [/S system [/U username [/P [password]]]] [/M [module] | /SVC | /V] [/FI filter] [/FO format] [/NH]   
参数含义   
/S system　 指定连接到的远程系统。   
/U [domain\]user　指定使用哪个用户执行这个命令。   
/P [password]　 为指定的用户指定密码。   
/M [module]　 列出调用指定的DLL模块的所有进程。如果没有指定模块名，显示每个进程加载的所有模块。   
/SVC　显示每个进程中的服务。   
/V　显示详细信息。   
实例分析：   
如果我们只是查看本地主机进程信息，直接办入命令即可。下面的实例是从客户机远程查看内网中某台主机时程信息。   
假如我们有一台服务器：   
内网地址：192.168.0.1，   
管理员帐号：administrator   
管理员密码：password   
我们需要在CMD窗口输入：   
Tasklist /s 192.168.0.1 /u administrator /p password   
这条命令可以使我们方便的查看到远程主机的运行情况，当然前提是保证RPC服务正常启动。

## 命令：tskill

　　功能：用来关掉进程的   
命令格式：   
TSKILL processid | processname [/SERVER:servername] [/ID:sessionid | /A] [/V]   
参数含义   
processid 要结束的进程的 Process ID。   
processname 要结束的进程名称。   
/SERVER:servername 含有 processID 的服务器(默认值是当前值)。   
使用进程名和 /SERVER 时，必须指定   
/ID 或 /A   
/ID:sessionid 结束在指定会话下运行的进程。   
/A 结束在所有会话下运行的进程。   
/V 显示正在执行的操作的信息。   
这个Tskill用法很简单，直接输入Tskill 图象名或PID就可以了。 

## 命令：ntsd

偶尔碰上Tskill无法结束的进程，还可以试试Ntsd命令，只有System、SMSS.EXE和CSRSS.EXE不能杀。前两个是纯内核态的，最后那个是Win32子系统，ntsd本身需要它。ntsd从2000开始就是系统自带的用户态调试工具。被调试器附着(attach)的进程会随调试器一起退出，所以可以用来在命令行下终止进程。使用ntsd自动就获得了debug权限，从而能杀掉大部分的进程。ntsd会新开一个调试窗口，本来在纯命令行下无法控制，但如果只是简单的命令，比如退出(q)，用-c参数从命令行传递就行了。NtsdNtsd 按照惯例也向软件开发人员提供。只有系统开发人员使用此命令。有关详细信息，请参阅 NTSD 中所附的帮助文件。用法:开个cmd.exe窗口， 如果你不知道进程的ID，任务管理器－>进程选项卡－>查看－>选择列－>勾上"PID（进程标识符）"，然后就能看见了。

格式为: ntsd -c q -pn {进程名｝   
参数含义：   
-c是表示执行debug命令;   
q表示执行结束后退出;   
-p 表示后面紧跟着是你要结束的进程对应的PID;   
-pn 表示后面紧跟着是你要结束的进程名;

1、根据端口查找进程、杀死进程: netstat -ano | find "8080"

C:\Documents and Settings\keju.wangkj>netstat -ano | find "8080" 
TCP    0.0.0.0:8080           0.0.0.0:0              LISTENING       5796 
C:\Documents and Settings\keju.wangkj>tskill 5796 

2、如果你不知道进程的ID，任务管理器－>进程选项卡－>查看－>选择列－>勾上"PID（进程标识符）"，然后就能看见了。

 出处：http://tianya23.blog.51cto.com/1081650/760533
## cmd下命令杀进程的几个方法

**1、用taskill命令  
①taskkill /f /im 进程名称  
示例:用taskkill /f /im VStart.exe命令关闭音速启动,VStart.exe就是音速启动的进程名称**

**②taskkill /pid[进程码] -t(结束该进程) -f(强制结束该进程以及所有子进程)  
注:有两种方法查进程的PID码:  
①在命令行下用 tasklist 命令查出进程的PID号码,就是这些**

**②在任务管理器中的查看选项中选择选择列中勾先PID那一项**

**示例:举个关闭迅雷的例子,先找出迅雷的PID码2552  
taskkill /pid 2552 -f,就是这个指令**

**2、用 wmic process Where name="进程名称" call terminate 这个不需要知道进程的PID号  
示例:  
wmic process Where name="iexplore.exe" call terminate 关闭IE浏览器,  
3、ntsd -c q -p [pid进程码]  
示例:还是举个关闭迅雷的吧,同样先找出迅雷的PID码2724  
ntsd -c q -p 2724 是这条指令!**

