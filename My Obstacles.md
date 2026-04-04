---
Status: 
tags:
  - view/field
Links:
  - "[[My Daily Logs]]"
Created: 2024-04-22T20:20:26
Description: Obstacles from your daily logs
---

````datacorejsx
const { DailyLogsWithTags } = await dc.require("Hidden/Datacore/Views/DailyLogs.jsx");

const tags = ["#log/obstacle"];

function View() {
return <DailyLogsWithTags tags={tags}/>
}
return View
````