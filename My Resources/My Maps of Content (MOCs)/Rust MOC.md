---
Status: 
tags:
  - moc
Links:
  - "[[Programing MOC]]"
Created: 2024-06-28T16:52:01
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

| File                                                                                                                              | Type                                          | Links                                                                                                                                                             | Created                    |
| --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| [[My Inputs/My Articles/fnm.md\|fnm]]                                                                                             | <ul><li>input/articles</li><li>rust</li></ul> | <ul><li>[[My Resources/My Maps of Content (MOCs)/Rust MOC.md\|Rust MOC]]</li></ul>                                                                               | 11:06 AM - August 16, 2024 |
| [[My Inputs/My Articles/rust安装.md\|rust安装]]                                                                                       | <ul><li>input/articles</li><li>rust</li></ul> | <ul><li>[[My Resources/My Maps of Content (MOCs)/Rust MOC.md\|Rust MOC]]</li></ul>                                                                               | 10:18 AM - August 16, 2024 |
| [[My Inputs/My Articles/cargo-zigbuild.md\|cargo-zigbuild]]                                                                       | <ul><li>input/articles</li><li>rust</li></ul> | <ul><li>[[My Resources/My Maps of Content (MOCs)/Rust MOC.md\|Rust MOC]]</li></ul>                                                                               | 11:07 AM - August 22, 2024 |
| [[My Inputs/My Articles/fd.md\|fd]]                                                                                               | <ul><li>input/articles</li><li>rust</li></ul> | <ul><li>[[My Resources/My Maps of Content (MOCs)/Rust MOC.md\|Rust MOC]]</li></ul>                                                                               | 1:46 PM - August 16, 2024  |
| [[My Inputs/My Articles/opencv-rust.md\|opencv-rust]]                                                                             | <ul><li>input/articles</li><li>rust</li></ul> | <ul><li>[[My Resources/My Maps of Content (MOCs)/Rust MOC.md\|Rust MOC]]</li></ul>                                                                               | 1:56 PM - August 16, 2024  |
| [[My Inputs/My Articles/just.md\|just]]                                                                                           | <ul><li>input/articles</li><li>rust</li></ul> | <ul><li>[[My Resources/My Maps of Content (MOCs)/Rust MOC.md\|Rust MOC]]</li><li>[[My Resources/My Maps of Content (MOCs)/DevOps MOC.md\|DevOps MOC]]</li></ul> | 12:01 PM - August 16, 2024 |
| [[My Inputs/My Articles/tabled.md\|tabled]]                                                                                       | <ul><li>input/articles</li><li>rust</li></ul> | <ul><li>[[My Resources/My Maps of Content (MOCs)/Rust MOC.md\|Rust MOC]]</li></ul>                                                                               | 11:12 AM - August 16, 2024 |
| [[My Inputs/My Articles/sysinfo.md\|sysinfo]]                                                                                     | <ul><li>input/articles</li><li>rust</li></ul> | <ul><li>[[My Resources/My Maps of Content (MOCs)/Rust MOC.md\|Rust MOC]]</li></ul>                                                                               | 11:10 AM - August 07, 2024 |
| [[My Inputs/My Articles/kanal.md\|kanal]]                                                                                         | <ul><li>input/articles</li><li>rust</li></ul> | <ul><li>[[My Resources/My Maps of Content (MOCs)/Rust MOC.md\|Rust MOC]]</li></ul>                                                                               | 10:33 AM - June 26, 2024   |
| [[My Inputs/My Articles/serde_aux.md\|serde_aux]]                                                                                 | <ul><li>input/articles</li><li>rust</li></ul> | <ul><li>[[My Resources/My Maps of Content (MOCs)/Rust MOC.md\|Rust MOC]]</li></ul>                                                                               | 6:38 PM - July 02, 2024    |
| [[My Inputs/My Articles/lazy_static.md\|lazy_static]]                                                                             | <ul><li>input/articles</li><li>rust</li></ul> | <ul><li>[[My Resources/My Maps of Content (MOCs)/Rust MOC.md\|Rust MOC]]</li></ul>                                                                               | 11:51 AM - June 26, 2024   |
| [[My Inputs/My Articles/how-to-print-well-formatted-tables-to-the-console.md\|how-to-print-well-formatted-tables-to-the-console]] | <ul><li>input/articles</li><li>rust</li></ul> | <ul><li>[[My Resources/My Maps of Content (MOCs)/Rust MOC.md\|Rust MOC]]</li></ul>                                                                               | 10:19 AM - August 16, 2024 |
| [[My Inputs/My Articles/rustdoc lints.md\|rustdoc lints]]                                                                         | <ul><li>input/articles</li></ul>              | <ul><li>[[My Resources/My Maps of Content (MOCs)/Rust MOC.md\|Rust MOC]]</li></ul>                                                                               | 5:43 PM - June 25, 2024    |

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
