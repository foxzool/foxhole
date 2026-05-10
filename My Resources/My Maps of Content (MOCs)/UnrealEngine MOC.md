---
Status: 
tags: "moc"
Links: ["[[My Maps of Content (MOCs)]]"]
Created: 2024-07-26T18:23:25
---
## Notes

## Queries
### To Develop

%% DATAVIEW_PUBLISHER: start
```dataview
list !"Hidden"
where contains(Links, this.file.link) and contains(file.frontmatter.Status, "🌱")
sort file.mtime desc
```
%%



%% DATAVIEW_PUBLISHER: end %%

### Notes

%% DATAVIEW_PUBLISHER: start
```dataview
list from [[]] AND !outgoing([[]]) AND !#input AND !#thought AND !"Hidden"
sort file.mtime desc
```
%%



%% DATAVIEW_PUBLISHER: end %%

### Inputs

%% DATAVIEW_PUBLISHER: start
```dataview
table tags as Type, Links, Created
from [[]] AND #input AND !"Hidden"
sort file.mtime desc
```
%%

| File                                                                                                                                                                                                                                      | Type                                                  | Links                                                                                                                                                                               | Created                                                  |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| [[My Inputs/My Articles/solved-sdk-ndk-and-jdk-configuration-for-compiling-android-including-oculus-quest-2-for-26-2-and-27-2.md\|solved-sdk-ndk-and-jdk-configuration-for-compiling-android-including-oculus-quest-2-for-26-2-and-27-2]] | <ul><li>input/articles</li></ul>                      | <ul><li>[[My Resources/My Maps of Content (MOCs)/UnrealEngine MOC.md\|UnrealEngine MOC]]</li></ul>                                                                                 | [[My Calendar/My Daily Notes/2024-08-26.md\|2024-08-26]] |
| [[My Inputs/My Articles/Installed Build Tools revision 31.0.0 is corrupted. Remove and install again using the SDK Manager..md\|Installed Build Tools revision 31.0.0 is corrupted. Remove and install again using the SDK Manager.]]     | <ul><li>input/articles</li></ul>                      | <ul><li>[[My Resources/My Maps of Content (MOCs)/Android MOC.md\|Android MOC]]</li><li>[[My Resources/My Maps of Content (MOCs)/UnrealEngine MOC.md\|UnrealEngine MOC]]</li></ul> | 11:09 AM - August 06, 2024                               |
| [[My Inputs/My Articles/UE：UPL 与 JNI 调用的最佳实践.md\|UE：UPL 与 JNI 调用的最佳实践]]                                                                                                                                                                   | <ul><li>input/articles</li><li>UnrealEngine</li></ul> | <ul><li>[[My Resources/My Maps of Content (MOCs)/UnrealEngine MOC.md\|UnrealEngine MOC]]</li></ul>                                                                                 | 10:22 AM - August 07, 2024                               |
| [[My Inputs/My Articles/Ue4的UE_LOG.md\|Ue4的UE_LOG]]                                                                                                                                                                                       | <ul><li>input/articles</li><li>UnrealEngine</li></ul> | <ul><li>[[My Resources/My Maps of Content (MOCs)/UnrealEngine MOC.md\|UnrealEngine MOC]]</li></ul>                                                                                 | 10:47 AM - August 07, 2024                               |
| [[My Inputs/My Articles/UE4 C++读取Json数据，解析Json数组.md\|UE4 C++读取Json数据，解析Json数组]]                                                                                                                                                           | <ul><li>input/articles</li></ul>                      | <ul><li>[[My Resources/My Maps of Content (MOCs)/UnrealEngine MOC.md\|UnrealEngine MOC]]</li></ul>                                                                                 | 12:09 PM - August 06, 2024                               |
| [[My Inputs/My Articles/UE4 安卓打包失败“Build-tool 31.0.0 is missing DX”.md\|UE4 安卓打包失败“Build-tool 31.0.0 is missing DX”]]                                                                                                                     | <ul><li>input/articles</li></ul>                      | <ul><li>[[My Resources/My Maps of Content (MOCs)/UnrealEngine MOC.md\|UnrealEngine MOC]]</li></ul>                                                                                 | 6:22 PM - July 26, 2024                                  |

%% DATAVIEW_PUBLISHER: end %%

### Thoughts

%% DATAVIEW_PUBLISHER: start
```dataview
table Created
from [[]] AND #thought AND !"Hidden"
sort file.mtime desc
```
%%

| File | Created |
| ---- | ------- |

%% DATAVIEW_PUBLISHER: end %%
