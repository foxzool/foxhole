---
Status: 
tags:
  - moc
Links: 
Created: 2023-06-04T11:29:30
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

| File                                                                                                                              | Type                                             | Links                                                                                                                                                                                 | Created                  |
| --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| [[My Inputs/My Articles/手把手教你在Discord上安装翻译插件！.md\|手把手教你在Discord上安装翻译插件！]]                                                         | <ul><li>input/articles</li><li>discord</li></ul> | <ul><li>[[My Resources/My Maps of Content (MOCs)/Productivity.md\|Productivity]]</li></ul>                                                                                           | 11:26 AM - July 12, 2024 |
| [[My Inputs/My Articles/VLOOKUP.md\|VLOOKUP]]                                                                                     | <ul><li>input/articles</li></ul>                 | <ul><li>[[My Resources/My Maps of Content (MOCs)/Productivity.md\|Productivity]]</li></ul>                                                                                           | 11:38 AM - June 28, 2024 |
| [[My Inputs/My Articles/The 3-Part Daily Routine For Maximum Productivity.md\|The 3-Part Daily Routine For Maximum Productivity]] | <ul><li>input/articles</li></ul>                 | <ul><li>[[My Resources/Personal Knowledge Management.md\|Personal Knowledge Management]]</li><li>[[My Resources/My Maps of Content (MOCs)/Productivity.md\|Productivity]]</li></ul> | 11:51 AM - May 07, 2023  |

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
