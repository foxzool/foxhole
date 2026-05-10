---
Status: 🟩
tags:
  - input/articles
Links:
  - "[[Android MOC]]"
  - "[[UnrealEngine MOC]]"
Created: 2024-08-06T11:09:49
Source:
  - https://stackoverflow.com/questions/68387270/android-studio-error-installed-build-tools-revision-31-0-0-is-corrupted
Author: 
Collection: 
Finished: "[[2024-08-06]]"
Rating:
---
## For Windows

1. go to the location
    
    ```bash
     "C:\Users\user\AppData\Local\Android\Sdk\build-tools\31.0.0"
    ```
    
2. find a file named d8.bat. This is a Windows batch file.
    
3. rename d8.bat to dx.bat.
    
4. in the folder lib ("C:\Users\user\AppData\Local\Android\Sdk\build-tools\31.0.0\lib")
    
5. rename d8.jar to dx.jar

Remember AppData is a hidden folder. Turn on hidden items to see the AppData folder.

## For macOS or Linux

Run the following in the Terminal:

```bash
# change below to your Android SDK path
cd ~/Library/Android/sdk/build-tools/31.0.0 \
  && mv d8 dx \
  && cd lib  \
  && mv d8.jar dx.jar
```