---
Status: 
tags:
  - outputCollection
Links: 
Created: <% tp.date.now("YYYY-MM-DDTHH:mm:ss") %>
Finished: 
---
## All Outputs
```dataview
table Status, Created
from [[]] and #outputCollection
where contains(Collection, [[]])
Sort Created desc
```
## By Status
### No Status
```dataview
table Created, Links, source
FROM  [[]] and #output AND !"Hidden"
where !Status AND contains(Collection, [[]])
SORT Created desc
```

### Not Started 🟥
```dataview
table Created, Links, source
FROM  [[]] and #output AND !"Hidden"
where contains(Collection, [[]]) AND contains(Status, "🟥")
SORT Created desc
```
### Consuming Media 🟧
```dataview
table Created, Links, source
FROM  [[]] and #output AND !"Hidden"
where contains(Collection, [[]]) AND contains(Status, "🟧")
SORT Created desc
```
### Implementation 🟨
```dataview
table Created, Links, source
FROM  [[]] and #output AND !"Hidden"
where contains(Collection, [[]])  AND contains(Status, "🟨")
SORT Created desc
```
### Finished 🟩
```dataview
table finished
FROM  [[]] and #output AND !"Hidden"
where contains(Collection, [[]])  AND contains(Status, "🟩")
SORT Created desc
```
### Archived ⬛️
```dataview
table finished
FROM  [[]] and #output AND !"Hidden"
where contains(Collection, [[]]) AND contains(Status, "⬛️")
SORT Created desc
```