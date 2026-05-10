---
Status: 🟩
tags:
  - input/articles
  - UnrealEngine
Links:
  - "[[UnrealEngine MOC]]"
Created: 2024-08-07T10:22:57
Source:
  - https://imzlp.com/posts/27289/
Author: 
Collection: 
Finished: "[[2024-08-07]]"
Rating:
---
Java 中的基础类型和签名对照：

|  Java   |  Native  | Signature |
| :-----: | :------: | :-------: |
|  byte   |  jbyte   |     B     |
|  char   |  jchar   |     C     |
| double  | jdouble  |     D     |
|  float  |  jfloat  |     F     |
|   int   |   jint   |     I     |
|  short  |  jshort  |     S     |
|  long   |  jlong   |     J     |
| boolean | jboolean |     Z     |
|  void   |   void   |     V     |

如下列函数的签名为 `()V`：

|   |   |
|---|---|
|1|public void AndroidThunkJava_SetFullScreenDisplayForP();|

非内置类型的签名规则为：

1. 以 `L` 开头
2. 以 `;` 结尾
3. 中间用 `/` 隔开包和类名

如 Java 中的 String：

|   |   |
|---|---|
|1  <br>2|// ()Ljava/lang/String;  <br>public String AndroidThunkJava_GetDeviceId();|

> 注：括号内是参数的签名，括号右侧是返回值类型的签名。

如：

|          |                                                                          |
| -------- | ------------------------------------------------------------------------ |
| 1  <br>2 | // (Ljava/lang/String;Ljava/lang/String;)I  <br>int Func(String,String); |
