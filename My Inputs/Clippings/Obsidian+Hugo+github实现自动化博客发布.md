---
tags:
  - "clippings"
title: "Obsidian+Hugo+github实现自动化博客发布"
source: "https://flynx.dev/post/obsidian-hugo-github-vercel-private-blog/"
author:
published:
created: 2024-11-06
description: "Obsidian+Hugo+github实现自动化博客发布"
---
## 动机hugo搭配github、vercel实现静态博客的发布，相信很多朋友都有实践过，相对比较简单，但是存在博客编写体验不佳的问题，因为，大部分情况下，我们需要再额外搭配typora与git实现博客的手动发布。

最近新接触了obsidian文章工具，使用下来，发现Obsidian是梦想中的博客工具，基于Obsidian，可以实现高度自动化的发布博客，体验极佳，重点是完全免费。

## 方案- obsidian：博客编写
- github：博客存储
- hugo：博客静态化
- vercel：博客发布

## 配置Obsidian是一款极度自由的本地文章编辑工具，借助其插件系统，可以实现各种目的的功能扩展。

### Obsidian 配置[Open: Pasted image 20240909102711.png](https://flynx.dev/post/attachments/42796e80d006645445346ef197b46c83_MD5.jpeg)

![42796e80d006645445346ef197b46c83_MD5.jpeg](https://flynx.dev/post/attachments/42796e80d006645445346ef197b46c83_MD5.jpeg)

42796e80d006645445346ef197b46c83\_MD5.jpeg

### Remotely Save 插件配置Remotely Save是Obsidian的一款第三方插件，主要实现多端笔记同步。这里我们除了需要安装这款插件，还需要有支持Webdav协议的云盘支持，经过对比速度与空间大小等指标，推荐大家使用[infini\-cloud](https://infini-cloud.net/)，如本文略有帮助，可填写本人的推荐码：**`SLW7Y`**

[Open: Pasted image 20240909103730.png](https://flynx.dev/post/attachments/992b152554822288e85eb210cd996847_MD5.jpeg)

![992b152554822288e85eb210cd996847_MD5.jpeg](https://flynx.dev/post/attachments/992b152554822288e85eb210cd996847_MD5.jpeg)

992b152554822288e85eb210cd996847\_MD5.jpeg

### Local Images Plus 插件配置Local Images Plus是Obsidian的一款第三方插件，主要实现附件的保存与重命名工作。本插件安装完毕其实无需配置，不过，确认一下红框处的配置项是否与图片中所选一致还是必要的。

[Open: Pasted image 20240909103916.png](https://flynx.dev/post/attachments/e4799fc5f97e64c47b91d14fee00b387_MD5.jpeg)

![e4799fc5f97e64c47b91d14fee00b387_MD5.jpeg](https://flynx.dev/post/attachments/e4799fc5f97e64c47b91d14fee00b387_MD5.jpeg)

e4799fc5f97e64c47b91d14fee00b387\_MD5.jpeg

### Enveloppe 插件配置#### GitHub config Tab此页签配置是为了实现将本地的Obsidian文章推送到github的目标repository [Open: Pasted image 20240909104606.png](https://flynx.dev/post/attachments/ae9171c394d58a935e199126ea62dc94_MD5.jpeg)

![ae9171c394d58a935e199126ea62dc94_MD5.jpeg](https://flynx.dev/post/attachments/ae9171c394d58a935e199126ea62dc94_MD5.jpeg)

ae9171c394d58a935e199126ea62dc94\_MD5.jpeg

#### File paths Tab此页签配置将本地的markdown文章推送到远程仓库的什么目录：我这里配置的是: **content/post** [Open: Pasted image 20240909104754.png](https://flynx.dev/post/attachments/f1bb394845b3a4044dce0984c65a68ed_MD5.jpeg)

![f1bb394845b3a4044dce0984c65a68ed_MD5.jpeg](https://flynx.dev/post/attachments/f1bb394845b3a4044dce0984c65a68ed_MD5.jpeg)

f1bb394845b3a4044dce0984c65a68ed\_MD5.jpeg

#### Attachment & embeds Tab此页签配置决定本地attachments目录下的附件发送到远程repository的目录：**content/post/attachments**

[Open: Pasted image 20240909105122.png](https://flynx.dev/post/attachments/769c76053a25a2e3e184eede30847c1d_MD5.jpeg)

![769c76053a25a2e3e184eede30847c1d_MD5.jpeg](https://flynx.dev/post/attachments/769c76053a25a2e3e184eede30847c1d_MD5.jpeg)

769c76053a25a2e3e184eede30847c1d\_MD5.jpeg

#### Content Tab此页签配置决定markdown文章发送到远程之前，如何对其内容进行转换（主要是原因是Obsidian的markdown文章格式与Hugo格式的markdown文章略有差别；其次，图片等附件链接的path路径需要通过正则表达式进行适当的替换）。

`[[Wikilinks]] to [MDlinks](links)` 项即实现Obsidian链接转hugo链接

`Text replacer` 项即实现通过正则表达式替换Obsidian中链接的路径到hugo中的链接

[Open: Pasted image 20240909105408.png](https://flynx.dev/post/attachments/36f0d5c7e6d415cdb9d4a106a1ea01a2_MD5.jpeg)

![36f0d5c7e6d415cdb9d4a106a1ea01a2_MD5.jpeg](https://flynx.dev/post/attachments/36f0d5c7e6d415cdb9d4a106a1ea01a2_MD5.jpeg)

36f0d5c7e6d415cdb9d4a106a1ea01a2\_MD5.jpeg

`Text replacer` 项具体的配置如下：

- 第1处即替换的具体规则，替换效果如下： [替换效果](https://flynx.dev/post/attachments/e0c6b272f1bcf3ec7a17e05598760a59_MD5.jpeg)![e0c6b272f1bcf3ec7a17e05598760a59_MD5.jpeg](https://flynx.dev/post/attachments/e0c6b272f1bcf3ec7a17e05598760a59_MD5.jpeg)

e0c6b272f1bcf3ec7a17e05598760a59\_MD5.jpeg
- 第2处箭头必须向上，表示`Text replacer`配置的规则优先级低，在其他转换规则执行之后再执行。

[Open: Pasted image 20240909112846.png](https://flynx.dev/post/attachments/e7c385796b7dbc52200cbe9996fd0e8c_MD5.jpeg)

![e7c385796b7dbc52200cbe9996fd0e8c_MD5.jpeg](https://flynx.dev/post/attachments/e7c385796b7dbc52200cbe9996fd0e8c_MD5.jpeg)

e7c385796b7dbc52200cbe9996fd0e8c\_MD5.jpeg

## 发布文章### 发布- 打开Obsidian，在根目录下新建英文文章名，obsidian\-hugo\-github\-vercel\-private\-blog
- 编写文章内容（文档属性需要满足hugo的格式），需要额外添加属性 `share: true` [Open: Pasted image 20240909113553.png](https://flynx.dev/post/attachments/3bb1c36d2ea56fc6655b9ba36eff8fe9_MD5.jpeg)![3bb1c36d2ea56fc6655b9ba36eff8fe9_MD5.jpeg](https://flynx.dev/post/attachments/3bb1c36d2ea56fc6655b9ba36eff8fe9_MD5.jpeg)

3bb1c36d2ea56fc6655b9ba36eff8fe9\_MD5.jpeg

文章涉及图片的话，粘贴的图片附件等会自动保存在attachments目录下。
- 文章书写完毕，调出Obsidian命令面板，选择 `Enveloppe: Upload all shared notes` 即可实现博客自动发布

### 查看[https://flynx.dev/post/obsidian\-hugo\-github\-vercel\-private\-blog/](https://flynx.dev/post/obsidian-hugo-github-vercel-private-blog/)