---
Status: 🌱
tags:
  - moc
Links: []
Created: 2024-08-28T19:34:31
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

- [[My Views/My Input Processing Station.md|My Input Processing Station]]
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

| File                                                | Type                             | Links                                                                                           | Created                   |
| --------------------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------- |
| [[My Inputs/My Articles/安装配置fish.md\|安装配置fish]]     | <ul><li>input/articles</li></ul> | <ul><li>[[My Resources/My Maps of Content (MOCs)/fish-shell MOC.md\|fish-shell MOC]]</li></ul> | 2:20 PM - August 28, 2024 |
| [[My Inputs/My Articles/fish设置环境变量.md\|fish设置环境变量]] | <ul><li>input/articles</li></ul> | <ul><li>[[My Resources/My Maps of Content (MOCs)/fish-shell MOC.md\|fish-shell MOC]]</li></ul> | 7:35 PM - August 28, 2024 |

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
