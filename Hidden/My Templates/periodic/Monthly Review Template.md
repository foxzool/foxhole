---
tags:
  - "reviews/monthly"
Created: <% tp.date.now("YYYY-MM-DDTHH:mm:ss") %>
Parent: "[[My Calendar/My Quarterly Notes/<% moment(tp.file.title,'YYYY-[M]MM').format('YYYY-[Q]Q') %>|<% moment(tp.file.title,'YYYY-[M]MM').format('YYYY-[Q]Q') %>]]"
---

[[My Calendar/My Monthly Notes/<% moment(tp.file.title, "YYYY-[M]MM").add(-1, 'months').format("YYYY-[M]MM") %>|<% moment(tp.file.title, "YYYY-[M]MM").add(-1, 'months').format("YYYY-[M]MM") %>]] ⬅️ [[My Calendar/My Quarterly Notes/<% moment(tp.file.title,'YYYY-[M]MM').format('YYYY-[Q]Q') %>|<% moment(tp.file.title,'YYYY-[M]MM').format('YYYY-[Q]Q') %>]] ➡️ [[My Calendar/My Monthly Notes/<% moment(tp.file.title, "YYYY-[M]MM").add(1, 'months').format("YYYY-[M]MM") %>|<% moment(tp.file.title, "YYYY-[M]MM").add(1, 'months').format("YYYY-[M]MM") %>]]

> “Your decisions about allocating your personal time, energy, and talent ultimately shape your life’s strategy.”

## Plan

### Action Items

All the unfinished tasks from last review:

```dataview
task
where file.name = "<% moment(tp.file.title, "YYYY-[M]MM").add(-1, 'months').format("YYYY-[M]MM") %>" AND !completed
```

### Goals

> [!DANGER]+ If you need more clarity plan any monthly goals you want to achieve 🎯

```meta-bind-button
label: Create Goal Note 🎯
hidden: false
class: ""
tooltip: ""
id: ""
style: default
actions:
  - type: command
    command: quickadd:choice:0468ea18-5c37-4079-a9ef-25a64cb20934

```

```dataview
table list("🎯 " + Description, "💡 " + Why) as "Details"
FROM #goal AND !"Hidden"
WHERE contains(file.frontmatter.Timeframe, this.file.name)
SORT Order, file.name asc
```

## Recap
### Weeks
````datacorejsx
const { PeriodicRecap } = await dc.require("Hidden/Datacore/Views/PeriodicRecap.jsx");

function View() {
return <PeriodicRecap/>
}
return View
````

### Key Metrics

#### Energy

```tracker
searchType: frontmatter
searchTarget: Physical, Mental, Emotional, Spiritual
folder: /My Calendar/My Daily Notes
startDate: <% moment(tp.file.title,'YYYY-[M]MM').startOf('month').format('YYYY-MM-DD') %>
endDate: <% moment(tp.file.title,'YYYY-[M]MM').endOf('month').format('YYYY-MM-DD') %>
summary:
    template: "AVERAGES\nPhysical: {{average(dataset(0))}}\nMental: {{average(dataset(1))}}\nEmotional: {{average(dataset(2))}}\nSpiritual: {{average(dataset(3))}}\n"
```

```tracker
searchType: frontmatter
searchTarget: Physical, Mental, Emotional, Spiritual
datasetName: Physical, Mental, Emotional, Spiritual
folder: /My Calendar/My Daily Notes
month:
    startWeekOn: 'Sun'
    threshold: 7, 7, 7, 7
    color: green
    dimNotInMonth: false
    todayRingColor: white
    selectedRingColor: steelblue
    circleColorByValue: true
    showSelectedValue: true
    initMonth: <% moment(tp.file.title, "YYYY-[M]MM").format("YYYY-MM") %>
```

##### Reflection

Are you happy or surprised with the results? What can you consciously work on for the future?

#### Habits

##### Meditation

```tracker
searchType: task.done, task.notdone
searchTarget: Meditate, Meditate
folder: /My Calendar/My Daily Notes
datasetName: Meditate, Not Meditate
month:
    color: green
    todayRingColor: white
    selectedRingColor: steelblue
    showSelectedValue: false
    initMonth: <% moment(tp.file.title, "YYYY-[M]MM").format("YYYY-MM") %>
```

```tracker
searchType: task.done, task.all
searchTarget: Meditate, Meditate
folder: /My Calendar/My Daily Notes
startDate: <% moment(tp.file.title,'YYYY-[M]MM').startOf('month').format('YYYY-MM-DD') %>
endDate: <% moment(tp.file.title,'YYYY-[M]MM').endOf('month').format('YYYY-MM-DD') %>
summary:
    template: "Meditate - {{sum(dataset(0))/sum(dataset(1))*100}}% - {{sum(dataset(0))}}/{{sum(dataset(1))}} Days Completed"
```

##### Reflection

Are you happy or surprised with the results? What can you consciously work on for the future?

#### Wheel of Life

````datacorejsx
const { PeriodicReviewWheelOfLifeChart } = await dc.require("Hidden/Datacore/Views/WheelOfLife.jsx");

function View() {
return <PeriodicReviewWheelOfLifeChart/>
}
return View
````

`INPUT[number(placeholder(Insert Total Here)):Total]`

##### Reflection

Are you happy or surprised with the results? What can you consciously work on for the future?

## Reflection

<%tp.file.include("[[Reflection Addon]]") %>
