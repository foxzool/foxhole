---
Status: ""
tags:
  - note
  - wheeloflife
Links: 
Created: 2024-12-27T21:07:54
---
## Habits
Habits will be automatically shown on [[My Habit Tracker]] if their `Status` is set to 🟨
## Functions

> [!INFO] Customize to fit your needs
> I've exposed some of the customizable properties of the tracker for you to 

### GOALS
A perfect day is achieved by completing 100% of your active habits. Feel free to change the number below to set your own goal for perfect days.

```js
return {
	perfectDays: {
		quarterly: 45,
		yearly: 225
	}
};
```
  
### DAYS
This is just to label the days in the habit tracker view, changing the order will not affect the ordering of the days and will instead break the system.

```js
return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
```
### formatMetricValue
Each case in the code below is the possible values for the `HabitUnit` property in a habit note.

Feel free to add more custom metrics, and make sure your habit has `HabitUnit` set to that value.

I recommend setting all habits of type `checkbox` to unit type `checkbox`.

```js
function formatMetricValue(value, habit) {
	if (value === null || value === undefined) return '0';
	switch(habit.unit) {
		case 'minutes':
			return value === 1 ? '1 Minute' : `${value} Minutes`;
		case 'hours':
			return value === 1 ? '1 Hour' : `${value} Hours`;
		case 'dollars':
			return `$${Number(value).toLocaleString()}`;
		case 'checkbox':
			return value
		default:
			return value;
	}
};

return {formatMetricValue}
```