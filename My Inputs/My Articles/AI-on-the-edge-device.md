---
Status: 🌱
tags:
  - input/articles
Links: 
Created: 2024-09-24T16:41:07
---
## Welcome to the setup of the AI-on-the-edge-device  
欢迎来到边缘上的AI设备的设置

![](http://192.168.1.41/flow_overview.jpg)![](http://192.168.1.41/cnn_images.jpg)

This is the first time you started the device after the initial installation. You have been automatically routed to the **initial setup procedure**. With the prodecure the basic setup of your device within seven steps will be performed. After completion of all steps the setup mode will be completed and the device restarts automatically to the regular web interface.  
这是您在初始安装后第一次启动设备。您已自动转到**初始设置程序**。 使用该产品，将在七个步骤内执行设备的基本设置。完成所有步骤后，将完成设置模式 并且设备自动重启到常规的web界面。  
Note: All settings of the initial setup will be also accessible using regular web interface. See documentation: [Initial setup procedure](https://jomjol.github.io/AI-on-the-edge-device-docs/initial-setup) for additional explanations.  
注意：初始设置的所有设置也可以使用常规的Web界面进行访问。 有关其他说明，请参见文档：[初始设置过程](https://jomjol.github.io/AI-on-the-edge-device-docs/initial-setup)。

You can navigate forward and backward during the setup with the buttons "Next Step" and "Previous Step".  
您可以在设置过程中使用“下一步”和“上一步”按钮向前和向后导航。  
With the button "Abort Setup" the setup will be skipped and abort screen will be presented.  
使用“中止设置”按钮，将跳过设置并显示中止屏幕。  
To restart the setup process, push the button "Restart Setup".  
要重新启动安装过程，请按“重新启动安装程序”按钮。

This is an overview over the seven steps:  
这是对七个步骤的概述：

1. Adjust **lens focus** and check for **reflections of flashlight**.  
    调整**透镜焦点**并检查**手电筒的反射**。  
    Ensure you camera lens has proper focus to object and flashlight do not create any distoring reflections.  
    确保您的相机透镜有适当的重点对象和手电筒不创建任何扭曲的反射。
    
2. Create the **reference image**.  
    创建**参考图像**。  
    It is the base for the position referencing and the identification of the digits and counters.  
    它是位置参考和数字和计数器识别的基础。
    
3. Define two unique **alignment marker**.  
    定义两个唯一**的对齐标记**。  
    They are used to perform an orientation alignment of the taken camera images before further processing  
    它们用于在进一步处理之前对所拍摄的相机图像执行方向对准
    
4. Define **ROI's** for the **digits**.  
    为手指定义ROI。  
    They will be used to digitize the digit part of your meter.  
    它们将被用于显示仪表的数字部分。  
    NOTE: If your meter has no digits, this step can be skipped.  
    注：如果您的血糖仪没有数字，则可以跳过此步骤。
    
5. Define **ROI's** for the **analog counters**.  
    定义模拟计数器的ROI。  
    They will be used to digitize the analog part of your meter.  
    它们将被用于测量仪表的模拟部分。  
    NOTE: If your meter has no analog counters, this step can be skipped.  
    注：如果您的血糖仪没有模拟计数器，则可以跳过此步骤。
    
6. **Additional configuration:** List of all parameters  
    **附加配置：**所有参数列表  
    Further configuration of your device can be done here.  
    您的设备的进一步配置可以在这里完成。  
    NOTE: This can also be performed later with regular web interface, e.g. to setup any publishing service like MQTT  
    注意：这也可以稍后使用常规Web界面执行，例如设置任何发布服务，如MQTT
    
7. **Setup Completion:** End/Abort setup mode  
    **设置完成：**结束/中止设置模式  
    In the final step the setup mode needs to be properly terminated by pushing the button in this page.  
    在最后一步中，需要通过按下此页面中的按钮来正确终止设置模式。  
    NOTE: This is important, otherwise the setup mode is recalled again after reboot.  
    注意：这很重要，否则重新启动后将再次调用设置模式。

Please be patient when switching to another step. The device takes some time to load all needed information!  
请耐心等待切换到另一个步骤。该设备需要一些时间来加载所有需要的信息！

If you need support, have a look to the [documentation](https://jomjol.github.io/AI-on-the-edge-device-docs) or the [discussion](https://github.com/jomjol/AI-on-the-edge-device/discussions) pages.  
如果您需要支持，请查看[文档](https://jomjol.github.io/AI-on-the-edge-device-docs)或[讨论](https://github.com/jomjol/AI-on-the-edge-device/discussions)页面。

**Have fun with your AI-on-the-edge-device!  
享受您的AI边缘设备的乐趣！**