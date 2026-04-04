# Review and check your Statuses

## About this file

This file was created by the Obsidian Tasks plugin (version 7.13.0) to help visualise the task statuses in this vault.

If you change the Tasks status settings, you can get an updated report by:

- Going to `Settings` -> `Tasks`.
- Clicking on `Review and check your Statuses`.

You can delete this file any time.

## Status Settings

<!--
Switch to Live Preview or Reading Mode to see the table.
If there are any Markdown formatting characters in status names, such as '*' or '_',
Obsidian may only render the table correctly in Reading Mode.
-->

These are the status values in the Core and Custom statuses sections.

| Status Symbol | Next Status Symbol | Status Name | Status Type | Problems (if any) |
| ----- | ----- | ----- | ----- | ----- |
| `space` | `x` | Todo | `TODO` |  |
| `x` | `space` | Done | `DONE` |  |
| `/` | `x` | In Progress | `IN_PROGRESS` |  |
| `-` | `space` | Cancelled | `CANCELLED` |  |
| `space` | `x` | to-do | `TODO` | Duplicate symbol '`space`': this status will be ignored. |
| `/` | `x` | incomplete | `IN_PROGRESS` | Duplicate symbol '`/`': this status will be ignored. |
| `x` | `space` | done | `DONE` | Duplicate symbol '`x`': this status will be ignored. |
| `-` | `space` | canceled | `CANCELLED` | Duplicate symbol '`-`': this status will be ignored. |
| `>` | `x` | forwarded | `TODO` |  |
| `<` | `x` | scheduling | `TODO` |  |
| `?` | `x` | question | `TODO` |  |
| `!` | `x` | important | `TODO` |  |
| `*` | `x` | star | `TODO` |  |
| `"` | `x` | quote | `TODO` |  |
| `l` | `x` | location | `TODO` |  |
| `b` | `x` | bookmark | `TODO` |  |
| `i` | `x` | information | `TODO` |  |
| `S` | `x` | savings | `TODO` |  |
| `I` | `x` | idea | `TODO` |  |
| `p` | `x` | pros | `TODO` |  |
| `c` | `x` | cons | `TODO` |  |
| `f` | `x` | fire | `TODO` |  |
| `k` | `x` | key | `TODO` |  |
| `w` | `x` | win | `TODO` |  |
| `u` | `x` | up | `TODO` |  |
| `d` | `x` | down | `TODO` |  |

## Loaded Settings

<!-- Switch to Live Preview or Reading Mode to see the diagram. -->

These are the settings actually used by Tasks.

```mermaid
flowchart LR

classDef TODO        stroke:#f33,stroke-width:3px;
classDef DONE        stroke:#0c0,stroke-width:3px;
classDef IN_PROGRESS stroke:#fa0,stroke-width:3px;
classDef CANCELLED   stroke:#ddd,stroke-width:3px;
classDef NON_TASK    stroke:#99e,stroke-width:3px;

1["'Todo'<br>[ ] -> [x]<br>(TODO)"]:::TODO
2["'Done'<br>[x] -> [ ]<br>(DONE)"]:::DONE
3["'In Progress'<br>[/] -> [x]<br>(IN_PROGRESS)"]:::IN_PROGRESS
4["'Cancelled'<br>[-] -> [ ]<br>(CANCELLED)"]:::CANCELLED
5["'forwarded'<br>[&gt;] -> [x]<br>(TODO)"]:::TODO
6["'scheduling'<br>[&lt;] -> [x]<br>(TODO)"]:::TODO
7["'question'<br>[?] -> [x]<br>(TODO)"]:::TODO
8["'important'<br>[!] -> [x]<br>(TODO)"]:::TODO
9["'star'<br>[*] -> [x]<br>(TODO)"]:::TODO
10["'quote'<br>[&quot;] -> [x]<br>(TODO)"]:::TODO
11["'location'<br>[l] -> [x]<br>(TODO)"]:::TODO
12["'bookmark'<br>[b] -> [x]<br>(TODO)"]:::TODO
13["'information'<br>[i] -> [x]<br>(TODO)"]:::TODO
14["'savings'<br>[S] -> [x]<br>(TODO)"]:::TODO
15["'idea'<br>[I] -> [x]<br>(TODO)"]:::TODO
16["'pros'<br>[p] -> [x]<br>(TODO)"]:::TODO
17["'cons'<br>[c] -> [x]<br>(TODO)"]:::TODO
18["'fire'<br>[f] -> [x]<br>(TODO)"]:::TODO
19["'key'<br>[k] -> [x]<br>(TODO)"]:::TODO
20["'win'<br>[w] -> [x]<br>(TODO)"]:::TODO
21["'up'<br>[u] -> [x]<br>(TODO)"]:::TODO
22["'down'<br>[d] -> [x]<br>(TODO)"]:::TODO
1 --> 2
2 --> 1
3 --> 2
4 --> 1
5 --> 2
6 --> 2
7 --> 2
8 --> 2
9 --> 2
10 --> 2
11 --> 2
12 --> 2
13 --> 2
14 --> 2
15 --> 2
16 --> 2
17 --> 2
18 --> 2
19 --> 2
20 --> 2
21 --> 2
22 --> 2

linkStyle default stroke:gray
```
