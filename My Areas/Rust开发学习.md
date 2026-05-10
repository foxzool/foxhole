---
tags:
  - area
Links:
  - "[[My Areas]]"
Created: 2024-11-10T10:59:45
areaGroup: Personal
---
## Tasks

```meta-bind-button
label: Add New Task
hidden: false
id: ""
style: default
actions:
  - type: command
    command: quickadd:choice:6bb9f26c-69d2-4711-978e-5325f7b4f1c5
```

%% Tasks Start %%

## Productivity

### Goals

%% DATAVIEW_PUBLISHER: start
```dataview
table Status
FROM #goal AND [[]] AND !"Hidden"
WHERE icontains(file.frontmatter.Area, this.file.name)
SORT Created asc
```
%%

| File | Status |
| ---- | ------ |

%% DATAVIEW_PUBLISHER: end %%

### Projects

%% DATAVIEW_PUBLISHER: start
```dataview
table Status
FROM #project AND [[]] AND !"Hidden"
WHERE icontains(file.frontmatter.Area, this.file.name)
SORT Created asc
```
%%

| File | Status |
| ---- | ------ |

%% DATAVIEW_PUBLISHER: end %%

### Habits

%% DATAVIEW_PUBLISHER: start
```dataview
table Status, Frequency, HabitGroup, Goal
FROM #habitNote AND [[]] AND !"Hidden"
WHERE icontains(file.frontmatter.Area, this.file.name)
SORT Created asc
```
%%

| File | Status | Frequency | HabitGroup | Goal |
| ---- | ------ | --------- | ---------- | ---- |

%% DATAVIEW_PUBLISHER: end %%

## Knowledge

### Inputs

%% DATAVIEW_PUBLISHER: start
```dataview
table Status, Author
FROM  #input AND [[]] AND !"Hidden"
SORT file.mtime desc
```
%%

| File | Status | Author |
| ---- | ------ | ------ |

%% DATAVIEW_PUBLISHER: end %%

### Other Notes

%% DATAVIEW_PUBLISHER: start
```dataview
table Created
FROM [[]] AND !#project AND !#input AND !"Hidden"
SORT file.mtime desc
```
%%

| File | Created |
| ---- | ------- |

%% DATAVIEW_PUBLISHER: end %%
