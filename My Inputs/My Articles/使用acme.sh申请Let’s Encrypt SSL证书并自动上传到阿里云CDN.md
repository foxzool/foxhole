---
Status: 🟨
tags:
  - input/articles
Links: ["[[DevOps MOC]]"]
Created: 2024-07-12T10:45:34
Source: https://www.wpzhiku.com/acme-sh-aliyun-cdn/
Author: 
Collection: 
Finished: 
Rating:
---
## Summary
使用acme的 renew-hook自动续签
## Notes
```
#!/usr/bin/env bash
 
# 使用的 OpenAPI
# CAS: https://help.aliyun.com/document_detail/126507.html
# CDN：https://help.aliyun.com/document_detail/106661.html
 
# 可配合 acme.sh 使用的 renewHook 脚本：自动将新证书上传至阿里云并更新对应 CDN 域名，然后删除对应域名的旧证书。
# 每次 API 执行都会检测是否失败，如果失败，会中断脚本执行并返回自定义错误代码。
 
# RIBO: 修改为自己的 AccessKey
AliAccessKeyId="阿里云Access Key ID"
AliAccessKeySecret="阿里云 Access Key Secret"
 
# acme.sh 执行 renewHook 时导出的环境变量列表
ACME_ENV_LIST=(
    "CERT_KEY_PATH"
    "CERT_FULLCHAIN_PATH"
    "Le_Domain"
)
# 检查环境变量是否存在
for value in "${ACME_ENV_LIST[@]}" ; do
   [[ -v "$value" ]] || exit 1
done
unset value
# 获取证书自定义函数
get_cert() {
    # 使用 sed 删除掉证书文件的空行
    sed -e "/^$/d" "$CERT_FULLCHAIN_PATH"
}
# 获取密钥自定义函数
get_key() {
    cat "$CERT_KEY_PATH"
}
 
# shellcheck disable=SC2154
DOMAIN=$Le_Domain

# 证书名称 (替换域名的 . 为 _，以符合阿里云证书名称规范)
CERT_NAME="${DOMAIN//./_}-$(date +%s)"

# 需要更新证书的 CDN 域名列表
# RIBO: 修改这里的 CDN 域名列表
DOMAIN_LIST=(
    "cdn.wpzhiku.com"
)
 
# 设置 CDN 域名列表使用新的证书
for _domain in "${DOMAIN_LIST[@]}"; do
    aliyun cdn SetCdnDomainSSLCertificate --DomainName "$_domain" --SSLPub="$(get_cert)" --SSLPri="$(get_key)"  --CertType upload --SSLProtocol on || exit 103
done
unset _domain
```
## Highlights
