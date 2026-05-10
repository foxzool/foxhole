---
Status: 🟩
tags:
  - input/articles
Links:
  - "[[DevOps MOC]]"
Created: 2024-08-01T19:41:45
Source:
  - https://gist.github.com/berkedel/a37abd1487b2db54079b20bc4d8befca
Author: 
Collection: 
Finished: "[[2024-08-01]]"
Rating:
---
## Summary

## Notes
Prerequiste:

- [OpenSSL](https://formulae.brew.sh/formula/openssl@1.1) and [keytool](https://docs.oracle.com/javase/8/docs/technotes/tools/unix/keytool.html) installed and added to your PATH  
    [OpenSSL](https://formulae.brew.sh/formula/openssl@1.1)和[keytool](https://docs.oracle.com/javase/8/docs/technotes/tools/unix/keytool.html)安装并添加到您的 PATH

Generate a file `platform.priv.pem` from you pk8 file.

```shell
openssl pkcs8 -in platform.pk8 -inform DER -outform PEM -out platform.priv.pem -nocrypt
```

Generate `platform.pk12` file using both your `platform.x509.pem` file and the previously generated `platform.priv.pem`. The key alias `KEY_ALIAS` is a string value and it can be anything. After entering command below, you'll be prompted for a password (and a password confirmation). It will be your a key password `KEY_PASSWORD`.

```shell
openssl pkcs12 -export -in platform.x509.pem -inkey platform.priv.pem -out platform.pk12 -name {{KEY_ALIAS}}
```

Create a brand new jks file `STORE_FILE_NAME`, and import your key with the given key alias and password before. Once the command below is entered, you'll be prompted for the store password `STORE_PASSWORD`.

```shell
keytool -importkeystore -destkeystore {{STORE_FILE_NAME}}.jks -srckeystore platform.pk12 -srcstoretype PKCS12 -srcstorepass {{KEY_PASSWORD}} -alias {{KEY_ALIAS}}
```

You already defined:

1. key alias
2. key password
3. store password
4. store file name

## Highlights
