---
tags:
  - "clippings"
title: "Clash Verge系列使用最佳实践 - Lainbo"
source: "https://lainbo.dev/clash-config?p=438&locale=zh"
author:
  - "[[Lainbo]]"
published: 2023-07-20
created: 2024-11-23
description: "并不是懂技术的人的最优解，但是如果你懒得研究这些，那么直接照抄可以给你一个相对优质的体验~"
---
## 关于一些客户端作者停止更新[#](https://lainbo.dev/?p=438&locale=zh#user-content-%E5%85%B3%E4%BA%8E%E4%B8%80%E4%BA%9B%E5%AE%A2%E6%88%B7%E7%AB%AF%E4%BD%9C%E8%80%85%E5%81%9C%E6%AD%A2%E6%9B%B4%E6%96%B0)

这些客户端停止更新了，对我们的使用是否有影响呢？想要知道这个问题的答案，首先我们先明白一个概念，Clash Verge (开源)、Clash for Windows、Clash X Pro 这一类图形化的软件，**都是一个壳**，用于对接核心的功能，停止更新的只是这个**壳**。

**常见的核心**有 Clash Premium、Clash Meta (开源)

因为 Clash Verge 和他能切换的内核 Clash Meta**都是开源的**，所以我们应该优先选这个搭配，下文中也会使用。

那我们还能够继续使用他们吗？

**当然可以**，解释如下

1. 就像你在使用一个收音机 \*(Clash Verge)*，你不会因为收音机的制造商*(作者)\* 倒闭了 \*(停止更新)\*，而立刻扔掉你的收音机
2. 收音机的所有零件图纸是公开 \*(开源)\* 的，你不用担心他可能植入一些不好的后台程序
3. 收音机的外壳按钮 \*(Clash Verge)\* ，是让我们更轻松的控制收音机里面的主板元件 \*(Clash Meta 核心)\* 去执行它们的任务，只要这个 外壳按钮 \*(Clash Verge)\* 控制 收音机主板 \*(Clash Meta 核心)\* 的方式没有太大问题，那我们就可以用
4. 外壳停止更新，意味着收音机外壳不会增加新的按钮
5. 核心停止更新，意味着收音机主板不会更新功能，仅此而已
6. 收音机能播放声音 \*(开启魔法)*，是因为你输入了正确的 FM 频率*(订阅链接)。*只要电台*(机场)\* 还在广播 \*(服务)*，只要你的壳和核还在，就不影响你播放声音*(开启魔法)\*

最后，我们要明确一点，**下文中涉及到隐私保护的操作并不是绝对的安全**，就像是想要知道你在家里做什么，可以在楼下垃圾桶翻你的扔的垃圾进行推测，可以望远镜监视你，可以把你家天花板炸了或者用大炮强行冲进来看。网络监控也一样，就看你在网络上的行为，值不值得人家用那些高阶手段了，总不能因为挖掘机一铲子能把防盗门破了我就不装防盗门了。

## 目前可用的开源 Clash Verge 客户端[#](https://lainbo.dev/?p=438&locale=zh#user-content-%E7%9B%AE%E5%89%8D%E5%8F%AF%E7%94%A8%E7%9A%84%E5%BC%80%E6%BA%90-clash-verge-%E5%AE%A2%E6%88%B7%E7%AB%AF)

现在有不少基于 Clash Verge 继续开发维护的客户端，比较推荐 [Clash Verge Rev](https://github.com/clash-verge-rev/clash-verge-rev/releases) 后面的文章中会基于这个客户端进行演示

后面提到的配置已完成 Clash Verge Rev ≥ v1.7 的适配，并自用了相当一段时间，放心食用

为什么是这个软件？

多端兼容性出色 ——Clash Verge Rev 支持 Windows、macOS、Linux。如果按照下方的教程进行操作，最终将得到一个新的订阅链接，而 iOS 上，可以将这个新的订阅链接生成二维码，用小火箭，点击「+」图标，找到底下的「扫描二维码」，就可以导入 iOS 设备进行使用；Stash 更是直接输入生成的链接就能用，而下方的最佳实践操作，只需执行一次，就可以在众多设备上跨端应用。

## 太长不看版本[#](https://lainbo.dev/?p=438&locale=zh#user-content-%E5%A4%AA%E9%95%BF%E4%B8%8D%E7%9C%8B%E7%89%88%E6%9C%AC)

1. 订阅转换 \*\*(所有端必做)\*\*
2. 开 TUN 模式，关代理 (可选)
3. 关闭浏览器安全 DNS 地址，设置 DNS 地址 (所有 PC 可选，如果操作了 2，则此项必做)
4. 系统 DNS 设置自动 (可选)
5. 关闭浏览器 QUIC\*\*（所有 PC 必做）\*\*
6. 设置本地中国 IP 数据库 (可选)

## 解决订阅分流规则问题[#](https://lainbo.dev/?p=438&locale=zh#user-content-%E8%A7%A3%E5%86%B3%E8%AE%A2%E9%98%85%E5%88%86%E6%B5%81%E8%A7%84%E5%88%99%E9%97%AE%E9%A2%98)

拿到了订阅链接，第一步要做的应该就是订阅转换，将他的分流规则完善 (因为给你提供订阅的服务商，自带的分流规则往往就几百条，很不健全，很多人开着 Clash 但 New Bing 却用不了就是个很好的例子)

在线订阅转换**不仅仅是将**Shadowsocks、V2ray、Trojan 订阅链接转换为 Clash 、Stash、V2ray、Quantumult X、Surge 等软件使用的订阅格式，他还**支持非常多的[进阶操作](https://github.com/tindy2013/subconverter/blob/master/README-cn.md)**，不过在本文仅以**够用**为目标，而不是把这个东西玩出花来。

在线订阅转换网站虽然好用，但也有一定的隐私风险，需要注意，建议会技术的朋友自己搭建在线订阅转换平台。

## **订阅转换网站**[#](https://lainbo.dev/?p=438&locale=zh#user-content-%E8%AE%A2%E9%98%85%E8%BD%AC%E6%8D%A2%E7%BD%91%E7%AB%99)

我搭建的订阅转换网站，下文将使用该网站作为示例

进入: [https://sub.lainbo.com/](https://sub.lainbo.com/)

## 需要操作的步骤[#](https://lainbo.dev/?p=438&locale=zh#user-content-%E9%9C%80%E8%A6%81%E6%93%8D%E4%BD%9C%E7%9A%84%E6%AD%A5%E9%AA%A4)

![image](https://lainbo.dev/_next/image?url=https%3A%2F%2Fi0.hdslb.com%2Fbfs%2Farticle%2F19e95004a61e6835cd2a8139361e8e1730109107.png&w=3840&q=75)

一般这样就已经可以比较完美的使用了，并且拥有我写的远程配置文件中的一些额外功能

### 判断是否成功套用了规则文件[#](https://lainbo.dev/?p=438&locale=zh#user-content-%E5%88%A4%E6%96%AD%E6%98%AF%E5%90%A6%E6%88%90%E5%8A%9F%E5%A5%97%E7%94%A8%E4%BA%86%E8%A7%84%E5%88%99%E6%96%87%E4%BB%B6)

拉取订阅后，节点中应该会出现 “🌿自动选择”、“🇭🇰香港自动”、“🇨🇳台湾自动”、“🇸🇬狮城自动”、“🇺🇸美国自动”、“🇯🇵日本自动” 这几个自动节点。能看到这几个自动节点，那你就成功在自己的订阅上套用了我的规则。

推荐在没有特殊需求的时候选择用这几个自动节点，自动节点会帮你使用对应国家 / 地区节点中，延迟最低的节点。

### 关于远程配置[#](https://lainbo.dev/?p=438&locale=zh#user-content-%E5%85%B3%E4%BA%8E%E8%BF%9C%E7%A8%8B%E9%85%8D%E7%BD%AE)

这个远程配置是什么，能赋予你的订阅什么功能，你可以打开[「远程配置」原文的链接](https://u.lainbo.com/clash-config)，顶部有注释

## 解决 DNS 泄露问题[#](https://lainbo.dev/?p=438&locale=zh#user-content-%E8%A7%A3%E5%86%B3-dns-%E6%B3%84%E9%9C%B2%E9%97%AE%E9%A2%98)

DNS 泄露指的是在使用 VPN 或其他隐私服务的情况下，用户的真实 IP 地址通过 DNS 请求被发送到了 ISP（如联通，移动）的 DNS 服务器，而不是通过 VPN 设置的安全、匿名的 DNS 服务器。如果在 [DNS Leak Test](https://browserleaks.com/dns) 、[ipleak](https://ipleak.net/)这种网站的列表中看到了中国国旗，就要意识到**可能**发生了 DNS 泄露。

如果真的泄露了有什么问题呢？我也不知道可能导致什么，或许你可能收到下图这样的消息  
![image](https://lainbo.dev/_next/image?url=https%3A%2F%2Fi0.hdslb.com%2Fbfs%2Farticle%2F7359a158f85939c22400cf366e6e727330109107.png&w=1080&q=75)  
![image](https://lainbo.dev/_next/image?url=https%3A%2F%2Fi0.hdslb.com%2Fbfs%2Farticle%2F4b7b56b6ea3e45673c71b069eb4c154f30109107.png&w=1920&q=75)  
我觉得还是尽量不要让他们知道这件事。虽然没有人知道具体的探测机制是什么，但很可能是从网络层面获取的。在一般的家庭网络拓扑中，[wireshark](https://www.wireshark.org/)可以看到什么内容，运营商就能看见什么内容，所以你使用 114.114.114.114、223.5.5.5 这样的 DNS 解析去访问了什么网站是很清晰的。

这就要衍生出第一个使用技巧 ——**Clash 开启 TUN 模式，关闭系统代理去使用**

与普通的系统代理模式区别在于，TUN 模式下 Clash 会创建一张虚拟网卡，从网络层面接管所有的网络流量。

普通的系统代理模式，是作为一个软件的权限去接管别的软件的网络，总有一些无法接管的应用，比如游戏，比如命令行。所以我们应该开启 TUN 模式，关闭系统代理，让网卡做这件事，而不是让软件做这件事

### 操作一 (开启 TUN 模式)[#](https://lainbo.dev/?p=438&locale=zh#user-content-%E6%93%8D%E4%BD%9C%E4%B8%80-%E5%BC%80%E5%90%AF-tun-%E6%A8%A1%E5%BC%8F)

1. 首先切换 Clash Verge 的内核，选开源的 Clash Meta 内核，然后重启整个 Clash Verge 确保生效（Clash Verge Rev 新版本应该默认就是 Meta 了）

*(Clash Meta 在后期可能在不同的客户端名称有所不同，如果看到内核名字是`Mihomo`也是 Meta)*

![image](https://lainbo.dev/_next/image?url=https%3A%2F%2Fi0.hdslb.com%2Fbfs%2Farticle%2F7de86032da0ed4b7b853be5ca1c5501d30109107.png&w=3840&q=75)
2. 安装服务，开启 Tun 模式，开启严格路由，按下方图中的数字序号**顺序点击**

![image](https://lainbo.dev/_next/image?url=https%3A%2F%2Fi0.hdslb.com%2Fbfs%2Farticle%2F16d34f61b7f235569d4f24d83db94f9e30109107.png&w=1920&q=75)

如果服务模式无法安装

- *Win 可以尝试在系统命令行 (PowerShell) 中执行`sc delete clash_verge_service` 来删除之前的 Clash Verge 服务，这可能是你之前安装过 Clash Verge，但是卸载的时候没有写在这服务模式，导致新的安装不上*
- *Mac/Linux 请在设置的`Clash内核`点开齿轮图标⚙️，点 " 授权”*
- *其他疑难杂症参考[https://github.com/clash-verge-rev/clash-verge-rev/issues/125](https://github.com/clash-verge-rev/clash-verge-rev/issues/125)*
3. 此时需要重启一下 Clash 软件，再点击 TUN 模式旁边的齿轮图标⚙️，选择 Tun 的堆栈模式为 Mixed，这也是官方推荐的选项，开启「严格路由」。

- **前端开发朋友需要注意**

前端开发如果开启了严格路由，Vite 默认运行 npm run vite dev，启动起来的[http://localhost:5173 可能无法访问，解决方式就是使用指定 Vite 服务器应该监听哪个](http://localhost:5173%E5%8F%AF%E8%83%BD%E6%97%A0%E6%B3%95%E8%AE%BF%E9%97%AE%EF%BC%8C%E8%A7%A3%E5%86%B3%E6%96%B9%E5%BC%8F%E5%B0%B1%E6%98%AF%E4%BD%BF%E7%94%A8%E6%8C%87%E5%AE%9AVite%E6%9C%8D%E5%8A%A1%E5%99%A8%E5%BA%94%E8%AF%A5%E7%9B%91%E5%90%AC%E5%93%AA%E4%B8%AA) IP 地址。

即：以下两种方式均可解决，二选一即可

1. 在 package.json 修改（加个`--host`）

```
"scripts": {
  "dev": "vite --host",
}
```
2. 或者在 vite.config.ts 修改（在 server 块中将 host 指定为 0.0.0.0）

```
export default defineConfig({
	server: {
		host: '0.0.0.0',
	}
})
```

![image](https://lainbo.dev/_next/image?url=https%3A%2F%2Fi0.hdslb.com%2Fbfs%2Farticle%2F142832d81aed11e2a02a433c41aae9b530109107.png&w=2048&q=75)

### 操作二 (调整组策略 Mac 跳过)[#](https://lainbo.dev/?p=438&locale=zh#user-content-%E6%93%8D%E4%BD%9C%E4%BA%8C-%E8%B0%83%E6%95%B4%E7%BB%84%E7%AD%96%E7%95%A5-mac-%E8%B7%B3%E8%BF%87)

要解决这个问题也很简单，问题出现的原因是 Windows 系统默认使用多宿主 DNS 解析，会使用所有的网卡发起请求，我们只需要在组策略 (Windows 家庭版无该功能) 中关闭这个功能即可 (Win+R，输入`gpedit.msc` 点确定)。

![image](https://lainbo.dev/_next/image?url=https%3A%2F%2Fi0.hdslb.com%2Fbfs%2Farticle%2Feea240482d25fd4266c7d9e6bb189e9130109107.png&w=3840&q=75)

至此，我们解决了 Clash 在 Windows 下可能发生的 DNS 泄露问题

但并不能保证 ipleak 检测不到。虽然我可以将 ipleak 加入规则中，但这样做就是掩耳盗铃。只要确保某些黑名单网站不被漏掉，不会收到上面那种短信，我认为就可以了。

### 操作三 (使用一个稳定的的 DNS)[#](https://lainbo.dev/?p=438&locale=zh#user-content-%E6%93%8D%E4%BD%9C%E4%B8%89-%E4%BD%BF%E7%94%A8%E4%B8%80%E4%B8%AA%E7%A8%B3%E5%AE%9A%E7%9A%84%E7%9A%84-dns)

DNS 这部分有人会教使用运营商的 DNS，**运营商的 DNS 只适合小白用户，因为他可能连反诈**，所以建议使用国内大厂的。

1. 关闭浏览器的 QUIC, 中国大陆的 isp 是限速 udp 的，所以导致 QUIC 这个优秀的协议，到了中国大陆的网络下成了个负面增益效果。

`about://flags/#enable-quic` 设置为`Disabled` (点下方弹出的重启浏览器生效)
2. 关闭浏览器中的 “安全 DNS”

- Chrome: `chrome://settings/security`

【使用安全 DNS】*(新版 Chrome 中叫做【对您访问的网站的名称进行加密】)*，关闭
- Edge: `edge://settings/privacy`

找到【安全性】 -【使用安全的 DNS 指定如何查找网站的网络地址】，关闭

- 如果你的 Clash Verge Rev 的版本 < 1.7

1. 在 Clash Verge 的【配置】中，点右上角的新建，进行如下操作

![image](https://lainbo.dev/_next/image?url=https%3A%2F%2Fi0.hdslb.com%2Fbfs%2Farticle%2F69b3be08ffafc7dc6e425eac884ab5ab30109107.png&w=3840&q=75)

1. 右键点击新建的卡片，选择编辑文件，并输入以下内容，保存，右键点击卡片启用

![image](https://lainbo.dev/_next/image?url=https%3A%2F%2Fi0.hdslb.com%2Fbfs%2Farticle%2F4aa98982967104ad381308230601584d30109107.png&w=1080&q=75)

```
function main(content) {
  const isObject = (value) => {
    return value !== null && typeof value === 'object'
  }

  const mergeConfig = (existingConfig, newConfig) => {
    if (!isObject(existingConfig)) {
      existingConfig = {}
    }
    if (!isObject(newConfig)) {
      return existingConfig
    }
    return { ...existingConfig, ...newConfig }
  }

  const cnDnsList = [
    'https://1.12.12.12/dns-query',
    'https://223.5.5.5/dns-query',
  ]
  
  // 大部分的网络请求都会走这个里面的，这里目前是腾讯、阿里、和使用节点查询的1.0.0.1的dns
  const trustDnsList = [
    'https://doh.pub/dns-query', // 腾讯
    'https://dns.alidns.com/dns-query', // 阿里（这里会触发h3和普通的并发查询）
    '180.184.1.1', // 字节-火山引擎的DNS
  ]
  const notionDns = 'tls://dns.jerryw.cn' // notion加速dns
  const notionUrls = [
    'http-inputs-notion.splunkcloud.com',
    '+.notion-static.com',
    '+.notion.com',
    '+.notion.new',
    '+.notion.site',
    '+.notion.so',
  ]
  const combinedUrls = notionUrls.join(',');
  const dnsOptions = {
    'enable': true,
    'prefer-h3': true, // 如果DNS服务器支持DoH3会优先使用h3（本例子中只有阿里DNS支持）
    'default-nameserver': cnDnsList, // 用于解析其他DNS服务器、和节点的域名, 必须为IP, 可为加密DNS。注意这个只用来解析节点和其他的dns，其他网络请求不归他管
    'nameserver': trustDnsList, // 其他网络请求都归他管
    
    // 这个用于覆盖上面的 nameserver
    'nameserver-policy': {
      [combinedUrls]: notionDns,
      'geosite:geolocation-!cn': trustDnsList,
      // 如果你有一些内网使用的DNS，应该定义在这里，多个域名用英文逗号分割
      // '+.公司域名.com, www.4399.com, +.baidu.com': '10.0.0.1'
    },
  }

  // GitHub加速前缀
  const githubPrefix = 'https://fastgh.lainbo.com/'

  // GEO数据GitHub资源原始下载地址
  const rawGeoxURLs = {
    geoip: 'https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geoip-lite.dat',
    geosite: 'https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geosite.dat',
    mmdb: 'https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/country-lite.mmdb',
  }

  // 生成带有加速前缀的GEO数据资源对象
  const accelURLs = Object.fromEntries(
    Object.entries(rawGeoxURLs).map(([key, githubUrl]) => [key, \`${githubPrefix}${githubUrl}\`]),
  )

  const otherOptions = {
    'unified-delay': true,
    'tcp-concurrent': true,
    'profile': {
      'store-selected': true,
      'store-fake-ip': true,
    },
    'sniffer': {
      enable: true,
      sniff: {
        TLS: {
          ports: [443, 8443],
        },
        HTTP: {
          'ports': [80, '8080-8880'],
          'override-destination': true,
        },
      },
    },
    'geodata-mode': true,
    'geo-auto-update': true,
    'geo-update-interval': 24,
    'geodata-loader': 'standard',
    'geox-url': accelURLs,
    'find-process-mode': 'strict',
  }
  content.dns = mergeConfig(content.dns, dnsOptions)
  return { ...content, ...otherOptions }
}
```

![image](https://lainbo.dev/_next/image?url=https%3A%2F%2Fi0.hdslb.com%2Fbfs%2Farticle%2F8bb38e3071b3242c0ec7c5dd71513cb430109107.png&w=3840&q=75)

*图片仅提供界面参考，实际内容以上方代码块为准*

![image](https://lainbo.dev/_next/image?url=https%3A%2F%2Fi0.hdslb.com%2Fbfs%2Farticle%2F19ba4b667f34fdb560e922cdfd37d35330109107.png&w=1080&q=75)
2. 启用后再次点击按钮，确保正确的应用了设置 (这里的任何代码变动，都需要点击这个按钮手动刷新运行时的配置)

![image](https://lainbo.dev/_next/image?url=https%3A%2F%2Fi0.hdslb.com%2Fbfs%2Farticle%2F871e9012b0c3778052d6acb75ce073f430109107.png&w=640&q=75)
- 如果你的 Clash Verge Rev 的版本≥1.7

1. 右键「全局扩展配置」，点击编辑文件

![image](https://lainbo.dev/_next/image?url=https%3A%2F%2Fi0.hdslb.com%2Fbfs%2Farticle%2F5d3e2a955e253b42d85469d8075be09830109107.png&w=1080&q=75)
2. 粘贴以下代码后，点击「保存」

```
dns:
  prefer-h3: true
  default-nameserver:
    - 180.184.1.1
    - udp://47.108.230.123:5553
    - https://119.29.29.29/dns-query
  nameserver-policy:
    "http-inputs-notion.splunkcloud.com,+.notion-static.com,+.notion.com,+.notion.new,+.notion.site,+.notion.so": tls://dns.jerryw.cn
    geosite:geolocation-!cn:
      - https://doh.pub/dns-query
      - https://dns.alidns.com/dns-query
      - 180.184.1.1
    nameserver:
      - https://doh.pub/dns-query
      - https://dns.alidns.com/dns-query
      - 180.184.1.1
unified-delay: true
tcp-concurrent: true
profile:
  store-selected: true
  store-fake-ip: true
sniffer:
  enable: true
  sniff:
    HTTP:
      ports:
        - 80
        - 8080-8880
      override-destination: true
    TLS:
      ports:
        - 443
        - 8443
    QUIC:
      ports:
        - 443
        - 8443
geodata-mode: true
geo-auto-update: true
geo-update-interval: 24
geodata-loader: standard
geox-url:
  geoip: https://fastgh.lainbo.com/https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geoip-lite.dat
  geosite: https://fastgh.lainbo.com/https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geosite.dat
  mmdb: https://fastgh.lainbo.com/https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/country-lite.mmdb
```

这段代码的作用是

- 使用阿里和 DNSPod (腾讯的 DNS) 的`DoT`来解析节点、DNS 服务器
- 使用阿里、腾讯、火山的 DNS 服务器解析其他网站（DNS 泄露往往是运营商泄露，大厂没听说过泄露）
- 使用非营利组织的 DoT 解析 Notion 网站
- tun 模式堆栈使用自适应模式
- 更换延迟计算方式，去除握手等额外延迟
- 开启 TCP 并发的支持
- 开启域名嗅探，准确还原域名，进行域名分流
- 设置 geodata 的下载源为国内加速下载源

有人可能这里会说，你用了阿里腾讯这些 dns 解析网站，还是会漏呀！我想说的是，我们要解决的问题是运营商（电信、联通、移动）外泄数据这件事，而不是不留痕迹的 DNS 查询，**如果你希望自己的 DNS 查询行为不留痕迹，请自建 DNS**

## 解决 GEOIP, CN 问题[#](https://lainbo.dev/?p=438&locale=zh#user-content-%E8%A7%A3%E5%86%B3-geoip-cn-%E9%97%AE%E9%A2%98)

目前市面上绝大多数的代理工具都依赖于 GeoIP2 数据库判断地址所属地。它们的规则结尾部分一般都会有一条类似 `GEOIP, CN`，用来查询目的 IP 地址是否属于中国大陆，从而判断是否直连。

这些代理工具通常使用的 GeoIP2 数据库是来自于 MaxMind 的 [GeoLite2](https://dev.maxmind.com/geoip/geoip2/geolite2/) 免费数据库。这个数据库目前存在一下几个问题：

- 获取不便：从 2019 年 12 月 30 日起，必须注册后才能下载
- 数据量大：数据库庞大，包含全球的 IP 地址段，约 10 MB
- 准确度低：对中国大陆的 IP 地址判定不准，如：香港阿里云的 IP 被判定为新加坡、中国大陆等。

庞大的数据量对于大多数中国大陆的用户来说是没有意义的，因为只仅需要去判断 IP 的地理位置是否属于中国大陆境内，其他国家的 IP 一律代理 / 直连。过多的数据量会增加载入时间，降低查询效率。

我们在之前创建的 Script 中已经包含了下载更精简合适中国大陆的 IP 数据库链接，现在只需要手动操作下载和替换即可。

1. 点击 Clash Verge Rev 的设置菜单，找到「更新 GeoData」, 点击进行更新即可
2. 下载完成后右键托盘中的 Clash Verge 图标，【更多】-【重启应用】确保数据库被正确应用

## 我希望 xxx.com 不要走代理，如何做？[#](https://lainbo.dev/?p=438&locale=zh#user-content-%E6%88%91%E5%B8%8C%E6%9C%9B-xxxcom-%E4%B8%8D%E8%A6%81%E8%B5%B0%E4%BB%A3%E7%90%86%E5%A6%82%E4%BD%95%E5%81%9A)

- 如果你的 Clash Verge Rev 的版本 < 1.7
1. 点击左侧「订阅」菜单，点击右上角的「新建」按钮
2. 类型选择「Merge」, 名称自己起一个，点保存
3. 右键点击刚才新建出来的 Merge, 点击「编辑文件」, 在`prepend-rules:` 后面进行添加 (Clash 的策略是从上往下读取规则，读取到了就不再往下找，所以要使用 prepend, 在前面插入规则)
4. 格式如下，自行灵活组合即可添加你想要的规则，写时注意 yaml 文件的缩进

(不要照搬下面的规则，只是写法演示，演示内容写的策略很不合理！)

```
prepend-rules:
# ↓表示\`*.baidu.com\`会走\`🔗 无需代理\`这个策略组, 而这个策略组默认行为走直连而非走节点
- DOMAIN-SUFFIX,baidu.com,🔗 无需代理

# ↓表示\`abc.baidu.com\`会走\`DIRECT\`这个内置策略
# DIRECT同样为直连, 区别在于这条规则不受\`🔗 无需代理\`策略组控制
# 🔗 无需代理策略组只是名字叫“无需代理”, 你可以手动调整他的策略, 但DIRECT不能调
- DOMAIN,abc.baidu.com,DIRECT

# ↓表示\`Weiyun.exe\`这个源进程名, 会走\`🛡️ 广告拦截\`, 而这个策略组默认行为是Reject请求
- PROCESS-NAME,Weiyun.exe,🛡️ 广告拦截

# ↓表示只要请求url中包含\`aria2\`这个关键字, 就会走\`REJECT\`这个内置策略
# REJECT同样为丢弃请求, 区别在于这条规则不受\`🛡️ 广告拦截\`策略组控制
# 不解释了, 和上面的无需代理一样的逻辑
- DOMAIN-KEYWORD,aria2,REJECT

# ↓表示所有的22端口都走\`✈️ 节点选择\`这个策略组, 也就是走你选择的节点流量
- DST-PORT,22,✈️ 节点选择

# ↓表示指定的ip段不需要代理, 记得在最后加\`,no-resolve\`
# no-resolve会告诉Clash不要去尝试解析来匹配这条规则, 只处理「直接IP访问」的请求
- IP-CIDR,203.205.254.0/23,🔗 无需代理,no-resolve
- IP-CIDR6,2a0b:b580::/48,🔗 无需代理,no-resolve
```

上面只写了常用的，还有更多规则类型详见[Clash 文档的对应章节](https://clash.wiki/configuration/rules.html#%E8%A7%84%E5%88%99%E7%B1%BB%E5%9E%8B) 或 [虚空终端 Docs](https://wiki.metacubex.one/config/rules/)
5. 写完之后右键你新建出来的 Merge, 点击「启用」, 再点击右上角的「重新激活订阅」按钮来刷新配置

![image](https://lainbo.dev/_next/image?url=https%3A%2F%2Fi0.hdslb.com%2Fbfs%2Farticle%2F871e9012b0c3778052d6acb75ce073f430109107.png&w=640&q=75)
- 如果你的 Clash Verge Rev 的版本≥1.7
1. 右键「全局扩展脚本」，点击「编辑文件」

![image](https://lainbo.dev/_next/image?url=https%3A%2F%2Fi0.hdslb.com%2Fbfs%2Farticle%2F25bb8d26ce09eba6e261da5ed3eb112330109107.png&w=2048&q=75)
2. 格式如下，自行灵活组合即可添加你想要的规则，组合方式和上面版本 < 1.7 是一样的，可以参照，只是格式需要写 JavaScript 代码，需要添加更多规则，请自行扩充代码中的`prependRules`

```
function main(content) {
  const prependRules = [
    'IP-ASN,132203,🔗 无需代理,no-resolve',
    'DOMAIN-SUFFIX,baidu.com,🔗 无需代理', // 表示\`*.baidu.com\`会走\`🔗 无需代理\`这个策略组, 而这个策略组默认行为走直连而非走节点
    'PROCESS-NAME,Weiyun.exe,🛡️ 广告拦截', // 表示\`Weiyun.exe\`这个源进程名, 会走\`🛡️ 广告拦截\`, 而这个策略组默认行为是Reject请求
    'DST-PORT,22,✈️ 节点选择', // 表示所有的22端口都走\`✈️ 节点选择\`这个策略组, 也就是走你选择的节点流量
  ]
  if (content.rules?.length) {
    content.rules = prependRules.concat(content.rules) 
  }

  return content
}
```

---

至此，就完成了我认为的 Clash 的最佳实践配置（对于不想过多研究的人来说）。

远程配置的维护我会持续进行，希望文章的内容能对你有所帮助。