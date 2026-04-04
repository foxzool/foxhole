---
tags:
  - reviews/quarterly
Created: <% tp.date.now("YYYY-MM-DDTHH:mm:ss") %>
Parent: "[[My Calendar/My Yearly Notes/<% moment(tp.file.title,'YYYY-[Q]Q').format('YYYY')%>|<% moment(tp.file.title,'YYYY-[Q]Q').format('YYYY')%>]]"
---

[[My Calendar/My Quarterly Notes/<% moment(tp.file.title,'YYYY-[Q]Q').subtract(1, 'quarter').format('YYYY-[Q]Q') %>|<% moment(tp.file.title,'YYYY-[Q]Q').subtract(1, 'quarter').format('YYYY-[Q]Q') %>]] ⬅️ [[My Calendar/My Yearly Notes/<% moment(tp.file.title,'YYYY-[Q]Q').format("YYYY")%>|<% moment(tp.file.title,'YYYY-[Q]Q').format("YYYY")%>]] ➡️ [[My Calendar/My Quarterly Notes/<% moment(tp.file.title,'YYYY-[Q]Q').add(1, 'quarter').format('YYYY-[Q]Q') %>|<% moment(tp.file.title,'YYYY-[Q]Q').add(1, 'quarter').format('YYYY-[Q]Q') %>]]

> “Your decisions about allocating your personal time, energy, and talent ultimately shape your life’s strategy.”

> [!TIP]+ Follow my workflow
> Go to my published notes for my updated workflow https://publish.obsidian.md/johnmavrick/My+quarterly+review+workflow

## Plan

- [ ] Revisit the higher-order review to remember your long-term goals and vision #hidden

### Action Items

All the uncompleted tasks from last review:

```dataview
task
where file.name = "<% moment(tp.file.title, "YYYY-[Q]Q").add(-3, 'months').format("YYYY-[Q]Q") %>" AND !completed
```

### Goals

> [!DANGER]+ Plan at least 3 goals you want to achieve this quarter 🎯

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
### Months
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
startDate: <% moment(tp.file.title,'YYYY-[Q]Q').startOf('quarter').format('YYYY-MM-DD') %>
endDate: <% moment(tp.file.title,'YYYY-[Q]Q').endOf('quarter').format('YYYY-MM-DD') %>
summary:
    template: "AVERAGES\nPhysical: {{average(dataset(0))}}\nMental: {{average(dataset(1))}}\nEmotional: {{average(dataset(2))}}\nSpiritual: {{average(dataset(3))}}\n"
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

`INPUT[textArea(placeholder(Insert Total Here)):Total]`

##### Reflection
Are you happy or surprised with the results? What can you consciously work on for the future?

## Reflection

<% tp.file.include("[[Reflection Addon]]") %>
