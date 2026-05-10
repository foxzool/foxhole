---
title: "使用 Yubikey 进行 GPG 签名 | Vigorous Pro"
source: "https://www.wevg.org/archives/gpg-sign-via-yubikey/"
author:
  - "[[Edison Jwa]]"
published: 2020-01-09
created: 2024-11-24
description: "前两天入手了一个 yubikey 5 之后，在给几个常用的网站配置了用于两部认证的安全密钥之后，便在想还能拿来做什么，经过一番尝试之后发现了几个比较好玩的玩法。本文便是其中之一。 - Edison Jwa - Vigorous Pro"
tags:
  - "clippings"
---
前两天入手了一个 yubikey 5 之后，在给几个常用的网站配置了用于两部认证的安全密钥之后，便在想还能拿来做什么，经过一番尝试之后发现了几个比较好玩的玩法。本文便是其中之一。 ~~*(其实就是想多水几篇文章*~~

## 生成 GPG 证书

说到生成证书，请务必要对证书做好备份，不然就会像我一样 QAQ

> 在立音的诱惑下(其实主要也是我闲着没事干)，我便把笔记本从 Manjaro 换成了 openSUSE ，然后这时我发现我忘记备份我的 SSH 密钥，配置文件，甚至 GPG 密钥，估计这种大傻子 全世界也就只有我一个了吧 ㅠㅠ  
> 言归正传，下面开始说明 GPG 证书的生成过程，当然如果您了解如何生成，可以直接跳过此步骤。

> 下文中出现的用户名 `Edison Jwa`， 邮箱 `example@uv.uy`， 以及 密钥信息 `W4IJICKJLQPX8CMB9IYZMVPSMCCJIHOTGSM2QFGP`，部分请根据个人情况进行修改

首先，输入 `gpg --full-generate-key` 开始生成 GPG 证书

| ``` 123456789101112 ``` | ``` edison@edison-pc ~> gpg --full-generate-keygpg (GnuPG) 2.2.19; Copyright (C) 2019 Free Software Foundation, Inc.This is free software: you are free to change and redistribute it.There is NO WARRANTY, to the extent permitted by law.Please select what kind of key you want:   (1) RSA and RSA (default)   (2) DSA and Elgamal   (3) DSA (sign only)   (4) RSA (sign only)  (14) Existing key from cardYour selection? 1 ``` |
| --- | --- |

输入 `1` 即选择 `(1) RSA and RSA (default)`

需要注意的是，如果你的 Yubikey 型号为 NEO 那么请选择 `2048` 位，Yubikey 4 或 5 的话，选择 `4096` 位  
此处的过期时间随意，此处我将过期时间设置成了1年

| ``` 123456789101112 ``` | ``` RSA keys may be between 1024 and 4096 bits long.What keysize do you want? (2048) 4096Requested keysize is 4096 bitsPlease specify how long the key should be valid.         0 = key does not expire      <n>  = key expires in n days      <n>w = key expires in n weeks      <n>m = key expires in n months      <n>y = key expires in n yearsKey is valid for? (0) 1yKey expires at Fri 08 Jan 2021 08:22:31 AM CSTIs this correct? (y/N) y ``` |
| --- | --- |

输入您的个人信息，输入完成后如果没有问题输入 `o` 并敲击 Enter 键即可。

| ``` 123456789 ``` | ``` GnuPG needs to construct a user ID to identify your key.Real name: Edison JwaEmail address: example@uv.uyComment: You selected this USER-ID:    "Edison Jwa <example@uv.uy>"Change (N)ame, (C)omment, (E)mail or (O)kay/(Q)uit? o ``` |
| --- | --- |

接下来会要求输入密码，请务必记住此密码。

| ``` 12345678910111213141516 ``` | ``` We need to generate a lot of random bytes. It is a good idea to performsome other action (type on the keyboard, move the mouse, utilize thedisks) during the prime generation; this gives the random numbergenerator a better chance to gain enough entropy.We need to generate a lot of random bytes. It is a good idea to performsome other action (type on the keyboard, move the mouse, utilize thedisks) during the prime generation; this gives the random numbergenerator a better chance to gain enough entropy.gpg: key 1234567890ABCDEF marked as ultimately trustedgpg: revocation certificate stored as '/home/edison/.gnupg/openpgp-revocs.d/W4IJICKJLQPX8CMB9IYZMVPSMCCJIHOTGSM2QFGP.rev'public and secret key created and signed.pub   rsa4096 2020-01-01 [SC] [expires: 2021-01-08]      W4IJICKJLQPX8CMB9IYZMVPSMCCJIHOTGSM2QFGPuid                      Edison Jwa <example@uv.uy>sub   rsa4096 2020-01-01 [E] [expires: 2021-01-08] ``` |
| --- | --- |

至此，主证书已经创建完成，当然接下来我们继续添加子证书  
输入 `gpg --expert --edit-key W4IJICKJLQPX8CMB9IYZMVPSMCCJIHOTGSM2QFGP` 开始对证书进行修改

| ``` 12345678910111213 ``` | ``` edison@edison-pc ~> gpg --expert --edit-key W4IJICKJLQPX8CMB9IYZMVPSMCCJIHOTGSM2QFGPgpg (GnuPG) 2.2.19; Copyright (C) 2019 Free Software Foundation, Inc.This is free software: you are free to change and redistribute it.There is NO WARRANTY, to the extent permitted by law.Secret key is available.sec  rsa4096/1234567890ABCDEF     created: 2020-01-01  expires: 2021-01-08  usage: SC       trust: ultimate      validity: ultimatessb  rsa4096/1234567890ABCDEF     created: 2020-01-01  expires: 2021-01-08  usage: E   [ultimate] (1). Edison Jwa <example@uv.uy> ``` |
| --- | --- |

输入 `addkey` 开始添加子证书

| ``` 1234567891011121314 ``` | ``` gpg> addkey Please select what kind of key you want:   (3) DSA (sign only)   (4) RSA (sign only)   (5) Elgamal (encrypt only)   (6) RSA (encrypt only)   (7) DSA (set your own capabilities)   (8) RSA (set your own capabilities)  (10) ECC (sign only)  (11) ECC (set your own capabilities)  (12) ECC (encrypt only)  (13) Existing key  (14) Existing key from cardYour selection? 4 ``` |
| --- | --- |

这里选择 `4`, 即 `RSA (sign only)`

| ``` 1234567891011121314151617181920212223242526 ``` | ``` RSA keys may be between 1024 and 4096 bits long.What keysize do you want? (2048) 4096Requested keysize is 4096 bitsPlease specify how long the key should be valid.         0 = key does not expire      <n>  = key expires in n days      <n>w = key expires in n weeks      <n>m = key expires in n months      <n>y = key expires in n yearsKey is valid for? (0) 1yKey expires at Fri 08 Jan 2021 10:29:48 AM CSTIs this correct? (y/N) yReally create? (y/N) yWe need to generate a lot of random bytes. It is a good idea to performsome other action (type on the keyboard, move the mouse, utilize thedisks) during the prime generation; this gives the random numbergenerator a better chance to gain enough entropy.sec  rsa4096/1234567890ABCDEF     created: 2020-01-01  expires: 2021-01-08  usage: SC       trust: ultimate      validity: ultimatessb  rsa4096/1234567890ABCDEF     created: 2020-01-01  expires: 2021-01-08  usage: E   ssb  rsa4096/1234567890ABCDEF     created: 2020-01-01  expires: 2021-01-08  usage: S   [ultimate] (1). Edison Jwa <example@uv.uy> ``` |
| --- | --- |

继续创建证书

| ``` 1234567891011121314 ``` | ``` gpg> addkeyPlease select what kind of key you want:   (3) DSA (sign only)   (4) RSA (sign only)   (5) Elgamal (encrypt only)   (6) RSA (encrypt only)   (7) DSA (set your own capabilities)   (8) RSA (set your own capabilities)  (10) ECC (sign only)  (11) ECC (set your own capabilities)  (12) ECC (encrypt only)  (13) Existing key  (14) Existing key from cardYour selection? 8 ``` |
| --- | --- |

这里我们需要先去掉 `Sign` 和 `Encrypt` ，所依次输入 `S` `E`  
接下来 输入 `A` 启用 `Authenticate`

| ``` 123456789101112131415161718192021222324252627282930313233343536373839404142434445464748495051525354555657585960616263646566676869 ``` | ``` Possible actions for a RSA key: Sign Encrypt Authenticate Current allowed actions: Sign Encrypt    (S) Toggle the sign capability   (E) Toggle the encrypt capability   (A) Toggle the authenticate capability   (Q) FinishedYour selection? sPossible actions for a RSA key: Sign Encrypt Authenticate Current allowed actions: Encrypt   (S) Toggle the sign capability   (E) Toggle the encrypt capability   (A) Toggle the authenticate capability   (Q) FinishedYour selection? ePossible actions for a RSA key: Sign Encrypt Authenticate Current allowed actions:   (S) Toggle the sign capability   (E) Toggle the encrypt capability   (A) Toggle the authenticate capability   (Q) FinishedYour selection? aPossible actions for a RSA key: Sign Encrypt Authenticate Current allowed actions: Authenticate   (S) Toggle the sign capability   (E) Toggle the encrypt capability   (A) Toggle the authenticate capability   (Q) FinishedYour selection? qRSA keys may be between 1024 and 4096 bits long.What keysize do you want? (2048) 4096Requested keysize is 4096 bitsPlease specify how long the key should be valid.         0 = key does not expire      <n>  = key expires in n days      <n>w = key expires in n weeks      <n>m = key expires in n months      <n>y = key expires in n yearsKey is valid for? (0) 1yKey expires at Fri 08 Jan 2021 10:30:23 AM CSTIs this correct? (y/N) yReally create? (y/N) yWe need to generate a lot of random bytes. It is a good idea to performsome other action (type on the keyboard, move the mouse, utilize thedisks) during the prime generation; this gives the random numbergenerator a better chance to gain enough entropy.sec  rsa4096/1234567890ABCDEF     created: 2020-01-01  expires: 2021-01-08  usage: SC       trust: ultimate      validity: ultimatessb  rsa4096/1234567890ABCDEF     created: 2020-01-01  expires: 2021-01-08  usage: E   ssb  rsa4096/1234567890ABCDEF     created: 2020-01-01  expires: 2021-01-08  usage: S   ssb  rsa4096/7EC20E50EE5ECDD5     created: 2020-01-01  expires: 2021-01-08  usage: A   [ultimate] (1). Edison Jwa <example@uv.uy>gpg> save ``` |
| --- | --- |

### 查看生成的 GPG 证书

| ``` 123456789 ``` | ``` edison@edison-pc ~> gpg --list-keys/home/edison/.gnupg/pubring.kbx-------------------------------pub   rsa4096 2020-01-01 [SC] [expires: 2021-01-08]      W4IJICKJLQPX8CMB9IYZMVPSMCCJIHOTGSM2QFGPuid           [ultimate] Edison Jwa <example@uv.uy>sub   rsa4096 2020-01-01 [E] [expires: 2021-01-08]sub   rsa4096 2020-01-01 [S] [expires: 2021-01-08]sub   rsa4096 2020-01-01 [A] [expires: 2021-01-08] ``` |
| --- | --- |

### 修改主密钥有效期

这里我们修改主密钥有效期为永久，这样每年只需要更新子密钥即可以了～

| ``` 123456789101112131415161718192021222324252627282930313233343536373839404142 ``` | ``` edison@edison-pc ~> gpg --expert --edit-key W4IJICKJLQPX8CMB9IYZMVPSMCCJIHOTGSM2QFGPgpg (GnuPG) 2.2.19; Copyright (C) 2019 Free Software Foundation, Inc.This is free software: you are free to change and redistribute it.There is NO WARRANTY, to the extent permitted by law.Secret key is available.sec  rsa4096/1234567890ABCDEF     created: 2020-01-01  expires: 2021-01-08  usage: SC       trust: ultimate      validity: ultimatessb  rsa4096/1234567890ABCDEF     created: 2020-01-01  expires: 2021-01-08  usage: E   ssb  rsa4096/1234567890ABCDEF     created: 2020-01-01  expires: 2021-01-08  usage: S   ssb  rsa4096/7EC20E50EE5ECDD5     created: 2020-01-01  expires: 2021-01-08  usage: A   [ultimate] (1). Edison Jwa <example@uv.uy>gpg> expireChanging expiration time for the primary key.Please specify how long the key should be valid.         0 = key does not expire      <n>  = key expires in n days      <n>w = key expires in n weeks      <n>m = key expires in n months      <n>y = key expires in n yearsKey is valid for? (0) 0Key does not expire at allIs this correct? (y/N) ysec  rsa4096/1234567890ABCDEF     created: 2020-01-01  expires: never       usage: SC       trust: ultimate      validity: ultimatessb  rsa4096/1234567890ABCDEF     created: 2020-01-01  expires: 2021-01-08  usage: E   ssb  rsa4096/1234567890ABCDEF     created: 2020-01-01  expires: 2021-01-08  usage: S   ssb  rsa4096/1234567890ABCDEF     created: 2020-01-01  expires: 2021-01-08  usage: A   [ultimate] (1). Edison Jwa <example@uv.uy>gpg> save ``` |
| --- | --- |

此时可以发现有效期已经修改成功，以后只需要每年更新子密钥即可。

## 备份 GPG 证书

> 请务必执行备份的操作，首先导入至 Yubikey 的密钥是无法提取出来的，其次也可以不会像我一样丢失之前的 GPG 密钥

### 导出公钥

| ``` 12 ``` | ``` edison@edison-pc ~/gpg-backup> gpg --armor --output public.asc  --export W4IJICKJLQPX8CMB9IYZMVPSMCCJIHOTGSM2QFGP ``` |
| --- | --- |

### 导出密钥

| ``` 12 ``` | ``` edison@edison-pc ~/gpg-backup> gpg --armor --output private.asc --export-secret-keys W4IJICKJLQPX8CMB9IYZMVPSMCCJIHOTGSM2QFGP ``` |
| --- | --- |

### 导出子证书密钥

| ``` 12 ``` | ``` edison@edison-pc ~/gpg-backup> gpg --armor --output private-subkeys.asc --export-secret-subkeys W4IJICKJLQPX8CMB9IYZMVPSMCCJIHOTGSM2QFGP ``` |
| --- | --- |

## 上传 GPG 证书公钥

| ``` 1234 ``` | ``` edison@edison-pc ~/gpg-backup> gpg --keyserver hkp://pgp.mit.edu --send-keys W4IJICKJLQPX8CMB9IYZMVPSMCCJIHOTGSM2QFGPgpg: sending key W4IJICKJLQPX8CMB9IYZMVPSMCCJIHOTGSM2QFGP to hkp://pgp.mit.eduedison@edison-pc ~/gpg-backup>  ``` |
| --- | --- |

## 设置 OpenPGP 卡

### 修改 Yubikey 默认 PIN 码

首先，我们修改掉 Yubikey 的默认 PIN 码，（PIN 和 Admin PIN）

输入 `gpg --card-edit` 开始进行修改

| ``` 123 ``` | ``` edison@edison-pc ~> gpg --card-edit××××× ``` |
| --- | --- |

此处会输出 Yubikey 的信息

输入 `admin` 启用管理员指令

| ``` 12 ``` | ``` gpg/card> adminAdmin commands are allowed ``` |
| --- | --- |

输入 `passwd` 开始修改 PIN 码

Yubikey 的 默认 PIN 码为 `123456`  
默认 Admin PIN 码为 `12345678`

| ``` 12345678910 ``` | ``` gpg/card> passwdgpg: OpenPGP card no. ××××× detected1 - change PIN2 - unblock PIN3 - change Admin PIN4 - set the Reset CodeQ - quitYour selection? 1 ``` |
| --- | --- |

输入 `1` ，修改 PIN 码，此处会要求输入默认 PIN 码，和新 PIN 码两次

> PIN 码的长度要求不低于 6 位

| ``` 123456789 ``` | ``` PIN changed.1 - change PIN2 - unblock PIN3 - change Admin PIN4 - set the Reset CodeQ - quitYour selection? 3 ``` |
| --- | --- |

接下来，输入 `3` 开始修改 Admin PIN 码

> Admin PIN 码的长度要求不低于8位

| ``` 1234567891011 ``` | ``` PIN changed.1 - change PIN2 - unblock PIN3 - change Admin PIN4 - set the Reset CodeQ - quitYour selection? qgpg/card> q ``` |
| --- | --- |

## 导入到 Yubikey

输入 `gpg --expert --edit-key`

| ``` 12345678910111213141516171819 ``` | ``` edison@edison-pc ~> gpg --expert --edit-key W4IJICKJLQPX8CMB9IYZMVPSMCCJIHOTGSM2QFGPgpg (GnuPG) 2.2.19; Copyright (C) 2019 Free Software Foundation, Inc.This is free software: you are free to change and redistribute it.There is NO WARRANTY, to the extent permitted by law.Secret key is available.sec  rsa4096/1234567890ABCDEF     created: 2020-01-09  expires: never       usage: SC       trust: ultimate      validity: ultimatessb  rsa4096/1234567890ABCDEF     created: 2020-01-09  expires: 2021-01-08  usage: E   ssb  rsa4096/1234567890ABCDEF     created: 2020-01-09  expires: 2021-01-08  usage: S   ssb  rsa4096/1234567890ABCDEF     created: 2020-01-09  expires: 2021-01-08  usage: A   [ultimate] (1). Edison Jwa <example@uv.uy>gpg> key 1 ``` |
| --- | --- |

选中 `key 1`

| ``` 12345678910 ``` | ``` sec  rsa4096/1234567890ABCDEF     created: 2020-01-09  expires: never       usage: SC       trust: ultimate      validity: ultimatessb* rsa4096/1234567890ABCDEF     created: 2020-01-09  expires: 2021-01-08  usage: E   ssb  rsa4096/1234567890ABCDEF     created: 2020-01-09  expires: 2021-01-08  usage: S   ssb  rsa4096/1234567890ABCDEF     created: 2020-01-09  expires: 2021-01-08  usage: A   [ultimate] (1). Edison Jwa <example@uv.uy> ``` |
| --- | --- |

> 此处的 `*` 表示该证书已被选中

然后输入 `keytocard` 将 GPG 证书导入至 Yubikey 中

| ``` 12345678910111213141516 ``` | ``` gpg> keytocardPlease select where to store the key:   (2) Encryption keyYour selection? 2sec  rsa4096/1234567890ABCDEF     created: 2020-01-09  expires: never       usage: SC       trust: ultimate      validity: ultimatessb* rsa4096/1234567890ABCDEF     created: 2020-01-09  expires: 2021-01-08  usage: E   ssb  rsa4096/1234567890ABCDEF     created: 2020-01-09  expires: 2021-01-08  usage: S   ssb  rsa4096/1234567890ABCDEF     created: 2020-01-09  expires: 2021-01-08  usage: A   [ultimate] (1). Edison Jwa <example@uv.uy>gpg> key 1 ``` |
| --- | --- |

再次输入 `key 1` 取消选中，接下来重复此动作，分别导入 `key 2` 和 `key 3`

## 检查 Yubikey 上存储的密钥

输入 `gpg --card-status` 即可查看 Yubikey 上存储的信息

后面进行签名的操作就都一样啦～

![1a47d0c644843aae49c044c76d09c596.png](https://i.yecdn.com/images/2020/01/10/1a47d0c644843aae49c044c76d09c596.png)

## 参考链接

[Using Your YubiKey with OpenPGP](https://support.yubico.com/support/solutions/articles/15000006420-using-your-yubikey-with-openpgp)

[YubiKey for SSH, Login, 2FA, GPG and Git Signing](https://ocramius.github.io/blog/yubikey-for-ssh-gpg-git-and-local-login/)

[Use A YubiKey For PGP Signing, Encryption, And Authentication](https://www.thepolyglotdeveloper.com/2019/02/use-yubikey-pgp-signing-encryption-authentication/)

[How to setup Signed Git Commits with a YubiKey NEO and GPG and Keybase on Windows](https://www.hanselman.com/blog/HowToSetupSignedGitCommitsWithAYubiKeyNEOAndGPGAndKeybaseOnWindows.aspx)

[Yubikeys for Signed Git Commits](https://www.engineerbetter.com/blog/yubikey-signed-commits/)