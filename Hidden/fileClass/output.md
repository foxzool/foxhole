---
mapWithTag: true
limit: 100
excludes: 
extends: 
version: "2.12"
fields:
  - id: 7ascQg
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
  - id: iEMkC9
    name: Collection
    options:
      dvQueryString: dv.pages("#outputCollection").filter(p => !p.file.path.includes('Hidden'))
    type: File
    path: ""
tagNames: 
filesPaths: 
bookmarksGroups: 
savedViews:
  - name: All
    children:
      - output/brainstorm
      - output/bookapplications
      - output/blog
    sorters: []
    filters:
      - id: output____file
        name: file
        query: ""
        customFilter: ""
      - id: output____Status
        name: Status
        query: ""
        customFilter: ""
      - id: output/brainstorm____Status
        name: Status
        query: ""
        customFilter: ""
      - id: output/bookapplications____Status
        name: Status
        query: ""
        customFilter: ""
      - id: output/bookapplications____file
        name: file
        query: ""
        customFilter: ""
      - id: output/blog____Status
        name: Status
        query: ""
        customFilter: ""
      - id: output/blog____file
        name: file
        query: ""
        customFilter: ""
    columns:
      - id: output____file
        name: file
        hidden: false
        position: 0
      - id: output____Status
        name: Status
        hidden: false
        position: 1
      - id: output/brainstorm____Status
        name: Status
        hidden: false
        position: 4
      - id: output/bookapplications____Status
        name: Status
        hidden: false
        position: 3
      - id: output/bookapplications____Source
        name: Source
        hidden: false
        position: 2
      - id: output/blog____Status
        name: Status
        hidden: false
        position: 5
      - id: output/blog____Source
        name: Source
        hidden: false
        position: 6
favoriteView: All
fieldsOrder:
  - 7ascQg
icon: package
---
