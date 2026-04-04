const { multiSort } = await dc.require("Hidden/Datacore/Utilities/sort.js");

function NotesCreatedInTimeframe() {
  const data = dc.useCurrentFile();
  const fileName = data.$name;
  console.log("Processing file for NotesCreatedInTimeframe:", fileName);

  // Reuse getTimeframeInfo logic from PeriodicRecap
  const getTimeframeInfo = (name) => {
    if (name.match(/^\d{4}-Q[1-4]$/)) {
      console.log("Detected quarterly note");
      return { current: "quarterly", children: "monthly" };
    }
    if (name.match(/^\d{4}-W\d{2}$/)) {
      console.log("Detected weekly note");
      return { current: "weekly", children: "daily" };
    }
    if (name.match(/^\d{4}-(M\d{2}|\d{2})$/)) {
      console.log("Detected monthly note");
      return { current: "monthly", children: "weekly" };
    }
    if (name.match(/^\d{4}$/)) {
      console.log("Detected yearly note");
      return { current: "yearly", children: "quarterly" };
    }
    console.log("Detected daily note or unknown format");
    return { current: "daily", children: null };
  };

  // Parse custom date formats
  const parseCustomDate = (dateStr) => {
    const DateTime = dc.luxon.DateTime;
    console.log("Parsing date:", dateStr);

    // Handle yearly format (e.g., "2025")
    if (dateStr.match(/^\d{4}$/)) {
      const year = parseInt(dateStr);
      return {
        start: DateTime.fromObject({ year }).startOf("year"),
        end: DateTime.fromObject({ year }).endOf("year"),
      };
    }

    if (dateStr.includes("W")) {
      const dt = DateTime.fromISO(dateStr);
      return {
        start: dt.startOf("week"),
        end: dt.endOf("week"),
      };
    }

    if (dateStr.match(/^\d{4}-Q[1-4]$/)) {
      const [year, quarterStr] = dateStr.split("-Q");
      const quarter = parseInt(quarterStr);
      const dt = DateTime.fromObject({
        year: parseInt(year),
        month: (quarter - 1) * 3 + 1,
        day: 1,
      });
      return {
        start: dt.startOf("quarter"),
        end: dt.endOf("quarter"),
      };
    }

    if (dateStr.match(/^\d{4}-(M\d{2}|\d{2})$/)) {
      const [year, monthStr] = dateStr.split("-");
      const month = parseInt(monthStr.replace("M", ""));
      const dt = DateTime.fromObject({
        year: parseInt(year),
        month: month,
        day: 1,
      });
      return {
        start: dt.startOf("month"),
        end: dt.endOf("month"),
      };
    }

    const dt = DateTime.fromISO(dateStr);
    return {
      start: dt.startOf("day"),
      end: dt.endOf("day"),
    };
  };

  // Get timeframe info and date range
  const { current } = getTimeframeInfo(fileName);
  const { start, end } = parseCustomDate(fileName);

  // Format dates for query - using start of day for start and end of day for end
  const startDate = start.toFormat("yyyy-MM-dd");
  const endDate = end.toFormat("yyyy-MM-dd'T'HH:mm:ss");

  console.log(`Timeframe: ${current}, Date range: ${startDate} to ${endDate}`);

  // Create query for notes created in the timeframe - using date() for start but datetime for end
  const queryString = `@page and !path("Hidden") and date(${startDate}) <= Created and Created <= date("${endDate}")`;
  console.log("Query:", queryString);

  const pages = dc.useQuery(queryString);
  console.log("Found", pages?.length || 0, "notes created in this timeframe");
  const criteria = [
    {
      fieldName: "Created",
      sortOrder: "desc", // newest first
      type: "date",
      nullsPosition: "last",
    },
    { fieldName: "$name", sortOrder: "asc", type: "string" }, // Secondary sort by name
  ];
  pages.sort(multiSort(criteria));

  // Define columns
  const COLUMNS = [
    { id: "Note", value: (page) => page.$link },
    { id: "Type", value: (page) => page.$tags },
    { id: "Created", value: (page) => page.value("Created") },
    { id: "Path", value: (page) => page.$path },
  ];

  return <dc.VanillaTable columns={COLUMNS} rows={pages} paging={true} />;
}

return { NotesCreatedInTimeframe };
