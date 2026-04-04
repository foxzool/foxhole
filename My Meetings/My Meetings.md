---
tags:
  - view/note
Links:
  - "[[My Home]]"
Created: 2023-05-13T04:12:50
---

```button
name QuickAdd: 🗣 Create Meeting Note
type command
action QuickAdd: 🗣 Create Meeting Note
```

## By Status

### Not Started 🟥
```dataview
TABLE Attendees, Summary
FROM #meeting AND !"Hidden"
WHERE contains(Status, "🟥")
SORT Created DESC
```

### Processing 🟨
```dataview
TABLE Attendees, Summary
FROM #meeting AND !"Hidden"
WHERE contains(Status, "🟨")
SORT Created DESC
```

### Completed 🟩

```dataview
TABLE Attendees, Summary
FROM #meeting AND !"Hidden"
WHERE contains(Status, "🟩")
SORT Created DESC
```

### Archived ⬛️
```dataview
TABLE Attendees, Summary
FROM #meeting AND !"Hidden"
WHERE contains(Status, "⬛️")
SORT Created DESC
```
## By Date

```dataview
TABLE MeetingDate, Attendees, Summary
from #meeting AND !"Hidden"
sort MeetingDate desc
```
