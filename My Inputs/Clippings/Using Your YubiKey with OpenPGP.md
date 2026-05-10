---
tags:
  - "clippings"
title: "Using Your YubiKey with OpenPGP"
source: "https://support.yubico.com/hc/en-us/articles/360013790259-Using-Your-YubiKey-with-OpenPGP"
author:
  - "[[Yubico]]"
published: 2020-05-13
created: 2024-11-24
description: "Note: If you haven't set a User PIN or an Admin PIN for OpenPGP, the default values are 123456 and 12345678, respectively. If the User..."
---
## Compatible devices

### YubiKey 5 FIPS Series

![](https://support.yubico.com/hc/article_attachments/360025842419)

YubiKey 5 NFC FIPS

![](https://support.yubico.com/hc/article_attachments/360025873139)

YubiKey 5C FIPS

![](https://support.yubico.com/hc/article_attachments/360025840480)

YubiKey 5C NFC FIPS

![](https://support.yubico.com/hc/article_attachments/360025873259)

YubiKey 5Ci FIPS

![](https://support.yubico.com/hc/article_attachments/360025873059)

YubiKey 5 Nano FIPS

![](https://support.yubico.com/hc/article_attachments/360025842399)

YubiKey 5C Nano FIPS

### YubiKey Bio Series

![](https://support.yubico.com/hc/article_attachments/13900892222364)

YubiKey C Bio - Multi-protocol Edition

![](https://support.yubico.com/hc/article_attachments/13450958593692)

YubiKey Bio - Multi-protocol Edition

![](https://support.yubico.com/hc/article_attachments/4407742308882)

YubiKey Bio - FIDO Edition

![](https://support.yubico.com/hc/article_attachments/4407752649362)

YubiKey C Bio - FIDO Edition

### Security Key Series

![](https://support.yubico.com/hc/article_attachments/7450469727516)

Security Key NFC - Enterprise Edition

![](https://support.yubico.com/hc/article_attachments/7450553193756)

Security Key C NFC - Enterprise Edition

![](https://support.yubico.com/hc/article_attachments/7450561829404)

Security Key NFC

![](https://support.yubico.com/hc/article_attachments/7450493058460)

Security Key C NFC

### YubiKey 5 Series

![](https://support.yubico.com/hc/article_attachments/360011846079)

YubiKey 5 NFC

![](https://support.yubico.com/hc/article_attachments/360011951599)

YubiKey 5 Nano

![](https://support.yubico.com/hc/article_attachments/360017322960)

YubiKey 5C NFC

![](https://support.yubico.com/hc/article_attachments/360011951719)

YubiKey 5Ci

![](https://support.yubico.com/hc/article_attachments/360011835900)

YubiKey 5C Nano

![](https://support.yubico.com/hc/article_attachments/360011835300)

YubiKey 5C

### YubiKey FIPS (4 Series)

![](https://support.yubico.com/hc/article_attachments/360018949900)

YubiKey C Nano FIPS (4 Series)

![](https://support.yubico.com/hc/article_attachments/360011897080)

YubiKey FIPS (4 Series)

![](https://support.yubico.com/hc/article_attachments/360011938800)

YubiKey Nano FIPS (4 Series)

![](https://support.yubico.com/hc/article_attachments/360018949920)

YubiKey C FIPS (4 Series)

### YubiHSM Series

![](https://support.yubico.com/hc/article_attachments/360011846040)

YubiHSM 1

![](https://support.yubico.com/hc/article_attachments/360011814999)

YubiHSM 2

### Legacy Devices

![](https://support.yubico.com/hc/article_attachments/360011813840)

YubiKey NEO

![](https://support.yubico.com/hc/article_attachments/360011813920)

YubiKey Edge

![](https://support.yubico.com/hc/article_attachments/360011813980)

YubiKey Edge-n

![](https://support.yubico.com/hc/article_attachments/360011835080)

FIDO U2F Security Key

![](https://support.yubico.com/hc/article_attachments/360011813940)

YubiKey NEO-n

![](https://support.yubico.com/hc/article_attachments/360011823419)

Security Key by Yubico

![](https://support.yubico.com/hc/article_attachments/360011833040)

YubiKey Standard

![](https://support.yubico.com/hc/article_attachments/360011835200)

YubiKey Nano

### YubiKey 4 Series

![](https://support.yubico.com/hc/article_attachments/360011813880)

YubiKey 4

![](https://support.yubico.com/hc/article_attachments/360011813860)

YubiKey 4C

![](https://support.yubico.com/hc/article_attachments/360011813900)

YubiKey 4C Nano

![](https://support.yubico.com/hc/article_attachments/360011823479)

YubiKey 4 Nano

**Note:** If you haven't set a User PIN or an Admin PIN for OpenPGP, the default values are 123456 and 12345678, respectively. If the User PIN and/or Admin PIN have been changed and are not known, the OpenPGP Applet can be reset by following [this article](https://support.yubico.com/support/solutions/articles/15000006421-resetting-the-openpgp-applet-on-the-yubikey).

These instructions will show you how to set up your YubiKey with OpenPGP. Before you begin, decide if you want to generate the private key on the YubiKey device, or if you want to generate the private key off of the YubiKey and then move the subkeys to the YubiKey. To allow for your PGP keys to be backed up, we recommend you generate them externally, not directly on the YubiKey. Once keys have been moved to/generated on the device, we also recommend that you personalize the YubiKey by changing the PIN, setting the admin PIN, and so on. Changing the PINs can be done by running the command gpg --change-pin.

## Requirements

- A compatible YubiKey.
- A current version of the GnuPG software installed.
- Windows: [GPG4Win](https://www.gpg4win.org/download.html)
- macOS: [GPG Suite](https://gpgtools.org/gpgsuite.html)
- Linux: Pre-installed on all common distributions.

## Generating Keys externally from the YubiKey (Recommended)

**Note:** It is strongly recommended that the keys be generated on an offline system, such as a live Linux distribution like [Ubuntu](https://tutorials.ubuntu.com/tutorial/try-ubuntu-before-you-install). Note that with live Linux, certain packages (like **scdaemon**) may need to be installed manually.

1. Insert the YubiKey into the USB port if it is not already plugged in.
2. Enter the GPG command: gpg --expert --full-gen-key
3. When prompted to specify the key type, enter 1 (for "RSA and RSA (Default)") and press Enter.
4. Specify the size of key you want to generate. Do one of the following:
- For a YubiKey NEO, enter 2048 and press Enter.
- For a YubiKey 4 or 5, enter 4096 and press Enter.
5. Specify the expiration date of the key, and press Enter. Verify the expiration date when prompted.
6. Now you will enter your user information. Enter your Real Name and press Enter. Be sure to enter both your first and last name.
7. Enter your Email Address and press Enter.
8. If desired, enter a Comment about this key, and press Enter. (To leave the comment blank, just press Enter.)
9. Review the information you entered, make any changes if necessary. If all information is correct, enter O (for Okay) and press Enter.
10. A dialog box is displayed so you can enter the passphrase for your key. While the key is being generated, move your mouse around or type on the keyboard to gain enough entrophy. When the key has been generated, you will see several messages displayed. Make a note of the key ID, that is displayed in the message such as "gpg: key 1234ABC marked as ultimately trusted". The key ID in this case is 1234ABC and you will need this key ID to perform other operations.

**To add an authentication key:**

**Note:** Recent release of GnuPG may have the default allowed actions to be both sign and encrypt. Please be sure to check the default allowed action before proceeding with adding the authentication key. 

1. Insert the YubiKey into the USB port if it is not already plugged in.
2. Enter the GPG command: gpg --expert --edit-key 1234ABC (where 1234ABC is the key ID of your key)
3. Enter the command: addkey
4. Enter the passphrase for the key. Note that this is the passphrase, and not the PIN or admin PIN.
5. You are prompted to specify the type of key. Enter 8 for RSA.
6. Initial default will be Sign and Encrypt. To select authentication key toggle S to disable sign, E to disable encrypt, A to enable authentication.
7. Once you can confirm that authentication is the current allowed actions select Q to Finish the selection.
8. Specify the key size.
9. Specify the expiration of the authentication key (this should be the same expiration as the key).
10. When prompted to save your changes, enter y (yes).

**To add a signing key:**

**Note:** Recent release of GnuPG may have the default allowed actions to be both sign and encrypt. Please be sure to check the default allowed action before proceeding with adding the signing key. 

1. Enter the GPG command: gpg --expert --edit-key 1234ABC (where 1234ABC is the key ID of your key) if you are not in edit mode already.
2. Enter the command: addkey
3. Enter the passphrase for the key. Note that this is the passphrase, and not the PIN or admin PIN.
4. You are prompted to specify the type of key. Enter 8 for RSA.
5. Initial default will be Sign and Encrypt. To select signing key press A to enable authentication. Optionally, if you want to disable encryption press e to toggle it to disabled.
6. Once you can confirm that authentication is the current allowed actions select Q to Finish the selection.
7. Specify the key size.
8. Specify the expiration of the signing key (this should be the same expiration as the key).
9. When prompted to save your changes, enter y (yes).

**To create a backup of your key:**

1. Insert the YubiKey into the USB port if it is not already plugged in.
2. Enter the GPG command: gpg --export-secret-key --armor 1234ABC (where 1234ABC is the key ID of your key)
3. Store the text output from the command in a safe place ( e.g. Print the text, save the text in password managers, save the text on a USB storage device).

**To import the key on your YubiKey:**

1. Insert the YubiKey into the USB port if it is not already plugged in.
2. Enter the GPG command: gpg --edit-key 1234ABC (where 1234ABC is the key ID of your key)
3. Enter the command: keytocard
4. When prompted if you really want to move your primary key, enter y (yes).
5. When prompted where to store the key, select 1. This will move the signature subkey to the PGP signature slot of the YubiKey.
6. Enter the command: key 1
7. Enter the command: keytocard
8. When prompted where to store the key, select 2. This will move the encryption subkey to the YubiKey.
9. Enter the command: key 1
10. Enter the command: key 2
11. Enter the command: keytocard
12. When prompted where to store the key, select 3. This will move the authentication subkey to the YubiKey.
13. Enter the command: quit
14. When prompted to save your changes, enter n (no). Otherwise, GPG will delete you key from your hard drive, and you won't be able to copy it to another YubiKey/keep it as a backup/etc. See [here](https://lists.gnupg.org/pipermail/gnupg-users/2016-July/056353.html) for a more detailed explanation.

## Generating Your PGP Key directly on Your YubiKey

**Warning:** Generating the PGP on the YubiKey ensures that malware can never steal your PGP private key, but it means that the key can not be backed up so if your YubiKey is lost or damaged the PGP key is irrecoverable. 

1. Insert the YubiKey into the USB port if it is not already plugged in.
2. Open Command Prompt (Windows) or Terminal (macOS / Linux).
3. Enter the GPG command: gpg --card-edit
4. At the gpg/card> prompt, enter the command: admin
5. If you want to use keys larger than 2048 bits, run: key-attr
6. Enter the command: generate
7. When prompted, specify if you want to make an off-card backup of your encryption key. 
- Note: This is a shim backup of the private key, not a full backup, and cannot be used to restore to a new YubiKey.
8. Specify how long the key should be valid for (specify the number in days, weeks, months, or years).
9. Confirm the expiration day.
10. When prompted, enter your name.
11. Enter your email address.
12. If needed, enter a comment.
13. Review the name and email, and accept or make changes.
14. Enter the default admin PIN again. The green light on the YubiKey will flash while the keys are being written.
15. Enter a Passphrase as the key will not allow you to pass without having a passphrase. If you do not enter a Passphrase generation will fail.

## Using your YubiKey's OpenPGP function on multiple computers

In order to use the OpenPGP private keys stored on your YubiKey on computers apart from the one where they were generated, it is necessary to import the corresponding public keys. Please see [this guide](https://github.com/drduh/YubiKey-Guide?tab=readme-ov-file#notes:~:text=To%20use%20YubiKey%20on%20multiple%20computers) (under the section **Notes**) for more information.

## Further Reading

For more advanced usage of the YubiKey's OpenPGP application with GPG, please refer to [https://github.com/drduh/YubiKey-Guide](https://github.com/drduh/YubiKey-Guide).