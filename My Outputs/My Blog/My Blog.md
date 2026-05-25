---
Status: 🟩
tags: view/note
Links: "[[My Home]]"
Created: 2023-05-08
---

```button

name QuickAdd: 📝 Create Blog Note

type command

action QuickAdd: 📝 Create Blog Note

```

## By Status

### No Status

```dataview

table Created, Links

FROM #output/blog AND !"Hidden"

WHERE !Status

sort file.mtime desc

```

### Backlog 🟥

```dataview

table Created, Links

FROM #output/blog AND !"Hidden"

WHERE contains(Status, "🟥")

sort file.mtime desc

```

### Active 🟨

```dataview

table Created, Links

FROM #output/blog AND !"Hidden"

WHERE contains(Status, "🟨")

sort file.mtime desc

```

### Finished 🟩

```dataview

table Created, Links

FROM #output/blog AND !"Hidden"

WHERE contains(Status, "🟩")

sort file.mtime desc

```

### Finished ⬛️

```dataview

table Created, Links

FROM #output/blog AND !"Hidden"

WHERE contains(Status, "⬛️")

sort file.mtime desc

```