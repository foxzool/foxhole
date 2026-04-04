---
Status: ""
tags:
  - view/note
Links: 
Created: 2024-07-29T16:49:51
cssclasses: 
HabitLabels:
  - Meditate 🧘
  - Make a tweet 🐦
HabitFields:
  - Meditate
  - MakeTweet
PastDays: 7
---

> [!TIP]+ Check my workflow
> Visit https://publish.obsidian.md/johnmavrick/My+habits+workflow to see how I track my workflow

[[My Habit Tracker]]

Can create a holistic dashboard to track all your habits in [[My Habits Board.canvas|♻️ My Habits Board]]

Can edit the templates that create each habit by visiting:
[[Task Tracker Addon]]
[[Hidden/My Templates/addons/Metric Tracker Addon]]

## Timeframes
### Daily

> [!INFO] To customize these fields
> - Edit the `HabitLabel` to be the labels you want for each habit
> - Edit the `HabitFields` value to be the frontmatter property for each habit
> - Edit the fileClass `Hidden/fileClass/reviews/daily.md` and add them as new fields with the correct type (boolean for checkbox, number for number)

```dataviewjs
const currentPage = dv.current()
const habitLabels = currentPage["HabitLabels"]
const habitFields = currentPage["HabitFields"]
const numPastDays = currentPage["PastDays"]

console.log('habit fields', habitFields)


const {fieldModifier: f} = this.app.plugins.plugins["metadata-menu"].api;

dv.table(["Day", ...habitLabels],
	dv.pages("#reviews/daily")
	.filter(p => !p.file.path.includes('Hidden'))
	.sort(p => p.file.name, "desc")
	.limit(numPastDays)
	.map(p => [
		p.file.link,
		...habitFields.map(label => f(dv, p, label))
	]))
```
## Active
```dataview
TABLE Frequency, HabitGroup, Goal, Area
FROM #habitNote and !"Hidden"
WHERE contains(Status, "🟨")
SORT file.name asc
```

## All
```dataview
TABLE Status, Frequency, HabitGroup, Goal, Area
FROM #habitNote and !"Hidden"
SORT file.name asc
```