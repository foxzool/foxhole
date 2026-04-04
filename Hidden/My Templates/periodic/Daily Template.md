---
tags:
  - reviews/daily
Created: <% tp.date.now("YYYY-MM-DDTHH:mm:ss") %>
Headings:
  - "[[<%tp.file.title%>#Thoughts|💭]] [[<%tp.file.title%>#Improvements|💪]] [[<%tp.file.title%>#Obstacles|🚧]]"
  - "[[<%tp.file.title%>#Accomplishments|✅]] [[<%tp.file.title%>#Gratitude|🙏]] [[<%tp.file.title%>#Content Log|📚]]"
Parent: "[[My Calendar/My Weekly Notes/<% moment(tp.file.title,'YYYY-MM-DD').format('YYYY-[W]WW') %>|<% moment(tp.file.title,'YYYY-MM-DD').format('YYYY-[W]WW') %>]]"
MakeTweet: 
Meditation: 
hideMetadata: true
---

<< [[My Calendar/My Daily Notes/<% moment(tp.file.title,'YYYY-MM-DD').add(-1,'days').format("YYYY-MM-DD") %>|<% moment(tp.file.title,'YYYY-MM-DD').add(-1,'days').format("YYYY-MM-DD") %>]] | [[My Calendar/My Weekly Notes/<% moment(tp.file.title,'YYYY-MM-DD').format("YYYY-[W]WW") %>|<% moment(tp.file.title,'YYYY-MM-DD').format("YYYY-[W]WW") %>]] | [[My Calendar/My Daily Notes/<% moment(tp.file.title,'YYYY-MM-DD').add(1,'days').format("YYYY-MM-DD") %>|<% moment(tp.file.title,'YYYY-MM-DD').add(1,'days').format("YYYY-MM-DD") %>]] >>

## Reminders

> [!DANGER] Today's Highlight
> %% What am I most looking forward to today? %%

**Today's Big 3**

1. 
2. 
3. 

Remember [[<% moment(tp.file.title,'YYYY-MM-DD').add(-1,'days').format("YYYY-MM-DD") %>#Improvements]]
### Routines
Morning Routine
- `INPUT[toggle:Meditation]` Meditate

<%-* if (moment(tp.file.title, "YYYY-MM-DD").format("ddd") != "Sun" && moment(tp.file.title, "YYYY-MM-DD").format("ddd") != "Sat") { %>
Work
<%* } -%>

Evening
<%-* if (moment(tp.file.title, "YYYY-MM-DD").format("ddd") != "Sun" && moment(tp.file.title, "YYYY-MM-DD").format("ddd") != "Sat") { %>
- `INPUT[toggle:MakeTweet]` Make a tweet
<%* } -%>

Night Routine
- [ ] Journal
- [ ] Brush teeth and floss
- [ ] Plan for tomorrow
## Tasks

```tasks
not done
((due on <%tp.file.title%>) OR (scheduled on <%tp.file.title%>)) OR (((scheduled before <%tp.file.title%>) OR (due before <%tp.file.title%>)) AND (tags does not include habit))
sort by priority
```

## Today

## Journals

### Gratitude

**3 things I'm grateful for in my life:**
- 

**3 things I'm grateful for about myself:**
- 

### Morning Mindset

**I'm excited today for:**

**One word to describe the person I want to be today would be \_ because:**

**Someone who needs me on my a-game/needs my help today is:**

**What's a potential obstacle/stressful situation for today and how would my best self deal with it?**

**Someone I could surprise with a note, gift, or sign of appreciation is:**

**One action I could take today to demonstrate excellence or real value is:**

**One bold action I could take today is:**

**An overseeing high performance coach would tell me today that:**

**The big projects I should keep in mind, even if I don't work on them today, are:**

**I know today would be successful if I did or felt this by the end:**

## Reflection

### Rating

```meta-bind
INPUT[progressBar(minValue(1), maxValue(10)):Rating]
```

### Summary

`INPUT[textArea():Summary]`
### Story

%% What was a moment today that provided immense emotion, insight, or meaning? %%

`INPUT[textArea():Story]`

### Accomplishments

%% What did I get done today? %%

```tasks
done on <%tp.file.title%>
group by path
sort by priority
```

### Obstacles
%% What was an obstacle I faced, how did I deal with it, and what can I learn from for the future? %%
%% Any bullet list with `#log/obstacle` will show up below %%
````datacorejsx
const { DailyLogsWithTags } = await dc.require("Hidden/Datacore/Views/DailyLogs.jsx");

const tags = ["#log/obstacle"];

function View() {
return <DailyLogsWithTags tags={tags}/>
}
return View
````
### Content Log
%% What were some insightful inputs and sources that I could process now? %%

```dataview
table Status, Links, Source
FROM  #input AND !"Hidden"
WHERE contains(dateformat(Created, "yyyy-MM-dd"), this.file.name)
SORT Created desc
```
### Thoughts
%% What ideas was I pondering on or were lingering in my mind? %%
### Conversations
%% Create sub-headers for any mini conversation you had or want to prepare for here, linking it to the respective `Conversations` header for the person %%
#### Meetings

```dataview
TABLE Attendees, Summary
FROM #meeting AND !"Hidden"
WHERE contains(dateformat(MeetingDate, "yyyy-MM-dd"), this.file.name)
SORT Created asc
```

### Trackers
- [ ] Check off any habits from [[#Reminders]] or via the "My Habit Tracker" note for tracking purposes

#### Energies

> Rate from 1-10

**What did I do to re-energize? How did it go?**

- 

##### Physical

```meta-bind
INPUT[progressBar(minValue(1), maxValue(10)):Physical]
```

##### Mental

```meta-bind
INPUT[progressBar(minValue(1), maxValue(10)):Mental]
```

##### Emotional

```meta-bind
INPUT[progressBar(minValue(1), maxValue(10)):Emotional]
```

##### Spiritual

```meta-bind
INPUT[progressBar(minValue(1), maxValue(10)):Spiritual]
```

### Improvements
%% What can I do tomorrow to be 1% better? %%

## Today's Notes

```datacorejsx

const { NotesCreatedInTimeframe } = await dc.require("Hidden/Datacore/Views/PeriodicNotes.jsx");

return function View() {

return <NotesCreatedInTimeframe/>;

}

```
