// metricTracker.js
module.exports = function (dv, currentPage) {
  const utils = require(app.vault.adapter.basePath +
    "/Hidden/Scripts/dataviewUtils.js");
  const {
    TimeframeStyle,
    TimeframeStart,
    TimeframeEnd,
    RecentDays,
    CalculationType,
  } = currentPage;

  const parseDate = (dateStr) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date: ${dateStr}`);
    }
    return date;
  };

  let startDate, endDate;

  if (TimeframeStyle === "fixed") {
    startDate = parseDate(TimeframeStart);
    endDate = parseDate(TimeframeEnd);
  } else {
    endDate = new Date();
    startDate = new Date();
    startDate.setDate(endDate.getDate() - RecentDays);
  }
  console.log("startDate:", startDate);
  console.log("endDate:", endDate);

  const isWithinTimeframe = (date) => {
    return date >= startDate && date <= endDate;
  };
  // Extract KPI fields from current page's frontmatter
  const extractKPIs = (page) => {
    if (!Array.isArray(page.KPIs) || page.KPIs.length === 0) {
      dv.paragraph(
        "⚠️ No KPIs found in the current page's frontmatter. Expected structure:\nKPIs:\n  - KPIName: Hours\n    KPIGoal: 10"
      );
      return [];
    }

    return page.KPIs.map((kpi) => ({
      name: kpi.KPIName,
      goal: utils.parseValue(kpi.KPIGoal),
    }));
  };

  const kpis = extractKPIs(currentPage);
  if (kpis.length === 0) return;

  const fields = kpis.map((kpi) => kpi.name);
  const dailyData = utils.initializeDailyData(startDate, endDate, fields);

  // Process pages
  const pages = dv
    .pages("#calendar/daily")
    .sort((p) => p.file.name, "desc")
    .where((p) => {
      try {
        const pageDate = new Date(p.file.name);
        if (isNaN(pageDate.getTime())) return false;
        return isWithinTimeframe(pageDate);
      } catch (e) {
        return false;
      }
    });

  // Process data
  pages.forEach((page) => {
    try {
      const pageDate = new Date(page.file.name);
      const dateStr = pageDate.toISOString().split("T")[0];

      fields.forEach((field) => {
        if (page[field] !== undefined) {
          dailyData[dateStr][field] = utils.parseValue(page[field]);
          if (dailyData[dateStr][field]) {
            console.log(
              "console.log(dailyData[dateStr][field]);",
              dailyData[dateStr][field]
            );
          }
        }
      });
    } catch (e) {
      utils.debug("Error processing page", {
        page: page.file.name,
        error: e.message,
      });
    }
  });

  // Generate chart data
  const dates = Object.keys(dailyData).sort();
  const series = fields.map((field) => {
    let runningSum = 0;
    const data = dates.map((date) => {
      if (CalculationType === "sum") {
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

  const colors = utils.generateChartColors(fields);

  // Create combined series with both actual values and goals
  const combinedSeries = [];

  // Add actual value series
  series.forEach((s, i) => {
    combinedSeries.push({
      title: s.title,
      data: s.data,
      backgroundColor: colors[i],
      borderColor: colors[i],
    });
  });

  // Build chart configuration string carefully
  const chartLines = [
    "```chart",
    "type: bar",
    `labels: [${dates.map((d) => `"${d}"`)}]`,
    "series:",
    ...combinedSeries.map((s) =>
      [
        "  -",
        `    title: "${s.title}"`,
        `    data: [${s.data}]`,
        `    backgroundColor: "${s.backgroundColor}"`,
        `    borderColor: "${s.borderColor}"`,
        ...(s.type ? [`    type: "${s.type}"`] : []),
        ...(s.borderDash ? [`    borderDash: [${s.borderDash}]`] : []),
      ]
        .filter(Boolean)
        .join("\n")
    ),
    "width: 100%",
    "stacked: false",
    "fill: true",
    "beginAtZero: true",
    "legend: true",
    "legendPosition: top",
    "xAxisLabel: Date",
    `yAxisLabel: ${
      CalculationType === "sum" ? "Cumulative Value" : "Daily Value"
    }`,
    "```",
  ];

  dv.paragraph(chartLines.join("\n"));

  // Display statistics
  kpis.forEach(({ name, goal }, index) => {
    const values = dates.map((date) => dailyData[date][name]);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = (sum / values.length).toFixed(1);

    const totalProgress = ((sum / goal) * 100).toFixed(1);
    dv.paragraph(
      `<div style="margin-bottom: 20px;">
      <span style="color: ${colors[index]}">${name}: ${sum.toFixed(
        1
      )} / ${goal} - ${totalProgress}%</span>
      <div id="myProgress" style="display: flex; align-items: center; width: 100%; background-color: grey; border-radius: 5px; overflow: hidden; margin: 10px 0;">
      <div id="myBar" style="width: ${Math.min(
        totalProgress,
        100
      )}%; height: 30px; background-color: ${
        colors[index]
      }; text-align: center; line-height: 30px; color: white;">
      </div>
      </div>
      <span>Average: ${avg}/day</span>
      </div>`
    );
  });
};
