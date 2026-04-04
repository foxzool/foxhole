---
tags: view/note
Links: "[[My Home]]"
Created: 2023-05-08T07:19:51
---

```button
name QuickAdd: 💡 Create Brainstorm Note
type command
action QuickAdd: 💡 Create Brainstorm Note
```

## By Status

### No Status

```dataview
table Created, Links
FROM #output/brainstorm AND !"Hidden"
WHERE !Status
sort file.mtime desc
```

### Backlog 🟥

```dataview
table Created, Links
FROM #output/brainstorm AND !"Hidden"
WHERE contains(Status, "🟥")
sort file.mtime desc
```

### Active 🟨

```dataview
table Created, Links
FROM #output/brainstorm AND !"Hidden"
WHERE contains(Status, "🟨")
sort file.mtime desc
```

### Finished 🟩

```dataview
table Created, Links
FROM #output/brainstorm AND !"Hidden"
WHERE contains(Status, "🟩")
sort file.mtime desc
```

### Finished ⬛️

```dataview
table Created, Links
FROM #output/brainstorm AND !"Hidden"
WHERE contains(Status, "⬛️")
sort file.mtime desc
```
