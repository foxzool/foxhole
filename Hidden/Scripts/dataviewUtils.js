// dataviewUtils.js
module.exports = {
  parseValue(value) {
    if (value === undefined || value === null || value === "") return 0;
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = parseFloat(value.replace(/[^\d.-]/g, ""));
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  },

  debug(message, data) {
    console.log(`DEBUG: ${message}`, JSON.stringify(data, null, 2));
  },

  initializeDailyData(startTimeframe, endTimeframe, fields) {
    const dailyData = {};
    const startDate = new Date(startTimeframe);
    const endDate = new Date(endTimeframe);

    for (
      let date = new Date(startDate);
      date <= endDate;
      date.setDate(date.getDate() + 1)
    ) {
      const dateStr = date.toISOString().split("T")[0];
      dailyData[dateStr] = {};
      fields.forEach((field) => {
        dailyData[dateStr][field] = 0;
      });
    }

    return dailyData;
  },

  generateChartColors(fields) {
    return fields.map((_, index) => {
      const hue = (index * 360) / fields.length;
      return `hsl(${hue}, 70%, 50%)`;
    });
  },

  generateChartConfig(dates, series, colors, calculationType) {
    return `\`\`\`chart
type: bar
labels: [${dates.map((d) => `"${d}"`)}]
series: [
${series
  .map(
    (s, i) => `  {
  title: "${s.title}",
  data: [${s.data}],
  backgroundColor: "${colors[i]}",
  borderColor: "${colors[i]}"
}`
  )
  .join(",\n")}
]
width: 100%
stacked: false
fill: true
beginAtZero: true
legend: true
legendPosition: top
xAxisLabel: Date
yAxisLabel: ${calculationType === "sum" ? "Cumulative Value" : "Daily Value"}
\`\`\``;
  },

  calculateSeriesData(dates, dailyData, fields, calculationType) {
    return fields.map((field) => {
      let runningSum = 0;
      const data = dates.map((date) => {
        if (calculationType === "sum") {
          runningSum += dailyData[date][field];
          return runningSum;
        }
        return dailyData[date][field];
      });

      return {
        title: field,
        data: data,
      };
    });
  },
};
