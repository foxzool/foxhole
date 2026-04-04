---
tags: [okr]
Created: <% tp.date.now("YYYY-MM-DDTHH:mm:ss") %>
Project: 
KPIs: 
RecentDays: 7
CalculationType: default
TimeframeStart: 
TimeframeEnd: 
TimeframeStyle: recent
---

> [!tutorial]-
> [[OKRs Guide]]

## Objective

`INPUT[textArea(placeholder(Objective)):exampleProperty]`

## KPIs

`BUTTON[create-kpi]`

%% KPI Start - Do Not Remove %%

### Tracking

```dataviewjs
const currentPage = dv.current();

// Load and run the metric tracker
const metricTracker = require(app.vault.adapter.basePath + "/Hidden/Scripts/metricTracker.js");
metricTracker(dv, currentPage);
```

## Tactics

`BUTTON[create-tactic-note]`

```dataview
list
from #tactics and !"Hidden"
sort file.name desc
```