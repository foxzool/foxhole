---
fields:
  - id: nABqlo
    name: Status
    options:
      valuesList:
        "1": 🟥
        "2": 🟨
        "3": 🟩
        "4": ⬛️
      sourceType: ValuesListNotePath
      valuesListNotePath: Hidden/Utilities/Basic Status Values.md
      valuesFromDVQuery: ""
    type: Select
    path: ""
  - id: QMcp8A
    name: Area
    options:
      dvQueryString: |-
        dv.pages("#area")
        .filter(p => !p.file.path.includes('Hidden'))
    type: File
    path: ""
  - name: Goal
    type: File
    options:
      dvQueryString: dv.pages('#goal')
    path: ""
    id: CohxM8
  - name: Type
    type: Select
    options:
      valuesList:
        "1": Task
        "2": Metric
      sourceType: ValuesList
      valuesListNotePath: ""
      valuesFromDVQuery: ""
    path: ""
    id: OILyKu
  - name: HabitId
    type: Input
    options: {}
    path: ""
    id: F0XYoc
  - name: HabitUnit
    type: Select
    options:
      sourceType: ValuesList
      valuesList:
        "1": Minutes
        "2": Hours
        "3": Dollars
        "4": Checkbox
    path: ""
    id: Fwe4aM
  - name: HabitEmoji
    type: Input
    options: {}
    path: ""
    id: NTCN3l
  - name: HabitLabel
    type: Input
    options: {}
    path: ""
    id: pkYAmZ
  - name: HabitDailyGoal
    type: Number
    options: {}
    path: ""
    id: no8tYT
  - name: HabitType
    type: Select
    options:
      sourceType: ValuesList
      valuesList:
        "1": checkbox
        "2": number
    path: ""
    id: j4IiiL
limit: 100
mapWithTag: true
tagNames: 
filesPaths: 
bookmarksGroups: 
excludes: 
extends: 
savedViews: []
favoriteView: 
fieldsOrder:
  - j4IiiL
  - no8tYT
  - pkYAmZ
  - NTCN3l
  - Fwe4aM
  - OILyKu
  - nABqlo
  - CohxM8
  - QMcp8A
  - F0XYoc
version: "2.18"
icon: package
---
