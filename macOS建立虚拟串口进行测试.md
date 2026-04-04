---
Status: 
tags:
  - note
Links:
  - "[[DevOps MOC]]"
  - "[[macOS MOC]]"
Created: 2025-06-13T10:30:39
share: false
---
在macOS下建立虚拟串口进行测试，有几种方法可以实现：

## 方法1：使用socat (推荐)

### 安装socat

```bash
# 使用Homebrew安装
brew install socat
```

### 创建虚拟串口对

```bash
# 创建两个相互连接的虚拟串口
socat -d -d pty,raw,echo=0 pty,raw,echo=0
```

执行后会看到类似输出：

```
2024/06/13 10:30:15 socat[12345] N PTY is /dev/ttys002
2024/06/13 10:30:15 socat[12346] N PTY is /dev/ttys003
```

这样就创建了两个虚拟串口：`/dev/ttys002` 和 `/dev/ttys003`，它们之间可以相互通信。

### 在bevy_serialport中使用

修改你的测试代码：

```rust
// 发送端使用一个端口
fn setup_sender(mut serial_res: ResMut<SerialResource>, rt: Res<SerialPortRuntime>) {
    serial_res
        .open(rt.clone(), "/dev/ttys002", 115_200)
        .expect("Failed to open sender port");
}

// 接收端使用另一个端口
fn setup_receiver(mut serial_res: ResMut<SerialResource>, rt: Res<SerialPortRuntime>) {
    serial_res
        .open(rt.clone(), "/dev/ttys003", 115_200)
        .expect("Failed to open receiver port");
}
```

## 方法2：使用nc (netcat) 通过网络模拟

### 创建TCP串口桥接

```bash
# 终端1：创建TCP服务器
nc -l 1234

# 终端2：连接到服务器
nc localhost 1234
```

然后使用`socat`将TCP连接桥接到PTY：

```bash
# 终端3：将TCP桥接到串口
socat pty,raw,echo=0,link=/tmp/vserial1 tcp:localhost:1234

# 终端4：另一个方向的桥接
socat pty,raw,echo=0,link=/tmp/vserial2 tcp:localhost:1235
```

## 方法3：使用内置的/dev/null测试

对于简单的发送测试，可以使用：

```rust
// 只测试发送功能，不接收
serial_res.open(rt.clone(), "/dev/null", 115_200)
```

## 实用的测试脚本

创建一个Shell脚本来自动化虚拟串口创建：## 修改测试用例

为macOS创建一个专门的测试用例：## 使用方法

1. **给脚本添加执行权限**：
    
    ```bash
    chmod +x create_virtual_serial.sh
    ```
    
2. **运行脚本创建虚拟串口**：
    
    ```bash
    ./create_virtual_serial.sh
    ```
    
3. **在另一个终端窗口运行你的Rust测试**：
    
    ```bash
    cargo test test_virtual_serial_on_macos -- --nocapture
    ```
    
4. **手动测试虚拟串口**：
    
    ```bash
    # 终端1：监听接收
    cat /tmp/bevy_serialport_test/serial2
    
    # 终端2：发送数据
    echo "Hello World" > /tmp/bevy_serialport_test/serial1
    ```

## 注意事项

- 确保安装了socat：`brew install socat`
- 虚拟串口在进程退出后会自动清理
- 如果遇到权限问题，可能需要调整/tmp目录的权限
- 对于CI/CD环境，建议使用项目中已有的Linux测试方法

这样你就可以在macOS上方便地测试串口通信功能了！