---
Status: 
tags:
  - moc
Links:
  - "[[Linux MOC]]"
Created: 2024-07-26T14:45:45
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

- [[My Resources/My Maps of Content (MOCs)/My Maps of Content (MOCs).md|My Maps of Content (MOCs)]]

%% DATAVIEW_PUBLISHER: end %%

### Inputs

%% DATAVIEW_PUBLISHER: start
```dataview
table tags as Type, Links, Created
from [[]] AND #input AND !"Hidden"
sort file.mtime desc
```
%%

| File                                                                                                                                                                                                                                  | Type                             | Links                                                                                                                                                                               | Created                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| [[My Inputs/My Articles/Installed Build Tools revision 31.0.0 is corrupted. Remove and install again using the SDK Manager..md\|Installed Build Tools revision 31.0.0 is corrupted. Remove and install again using the SDK Manager.]] | <ul><li>input/articles</li></ul> | <ul><li>[[My Resources/My Maps of Content (MOCs)/Android MOC.md\|Android MOC]]</li><li>[[My Resources/My Maps of Content (MOCs)/UnrealEngine MOC.md\|UnrealEngine MOC]]</li></ul> | 11:09 AM - August 06, 2024 |
| [[My Inputs/My Articles/消除ADB错误“more than one device and emulator”的方法.md\|消除ADB错误“more than one device and emulator”的方法]]                                                                                                             | <ul><li>input/articles</li></ul> | <ul><li>[[My Resources/My Maps of Content (MOCs)/Android MOC.md\|Android MOC]]</li></ul>                                                                                           | 2:49 PM - July 26, 2024    |

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
