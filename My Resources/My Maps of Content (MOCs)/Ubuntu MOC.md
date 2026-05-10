---
Status: 
tags:
  - moc
Links:
  - "[[Linux MOC]]"
Created: 2024-08-28T13:47:58
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

| File                                                    | Type                             | Links                                                                                   | Created                   |
| ------------------------------------------------------- | -------------------------------- | --------------------------------------------------------------------------------------- | ------------------------- |
| [[My Inputs/My Articles/Ubuntu 修改软件源.md\|Ubuntu 修改软件源]] | <ul><li>input/articles</li></ul> | <ul><li>[[My Resources/My Maps of Content (MOCs)/Ubuntu MOC.md\|Ubuntu MOC]]</li></ul> | 1:48 PM - August 28, 2024 |

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
