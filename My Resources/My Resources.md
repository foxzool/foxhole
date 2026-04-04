---
tags:
  - view/note
Links:
  - "[[My Home]]"
Created: 2023-05-07T02:05:22
---
*Create a MOC then tag it with `#resource` to show up here*
## Manually Organized
%% Type them out here for your own hierarchical directory %%

## By Last Created
```dataview
list
from #resource and !outgoing([[]]) and !"Hidden"
sort file.mtime desc
limit 10
```
## By Alphabetical
```dataview
list
from #resource and !outgoing([[]]) and !"Hidden"
sort file.name asc
```