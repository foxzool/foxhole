---
tags: view/note
Links: "[[My Home]]"
Created: 2023-09-06T08:16:07
---

```button
name QuickAdd: 🗄️ Create Output Collection Note
type command
action QuickAdd: 🗄️ Create Output Collection Note
```

## By Type

_Turn into their own notes when they get bigger_

### None

```dataview
TABLE Status, tags, Links
from #outputCollection AND !"Hidden"
where !contains(file.tags, "/")
sort Created desc
```

### Series
`#outputCollection/series`
```dataview
TABLE Status, tags, Links
from #outputCollection/series AND !"Hidden"
sort Created desc
```

## By Date

```dataview
TABLE Status, tags, Links
from #outputCollection AND !"Hidden"
sort Created desc
```
