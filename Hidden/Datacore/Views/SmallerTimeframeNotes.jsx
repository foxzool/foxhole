function SmallerTimeframeNotes() {
  const data = dc.useCurrentFile();
  const fileName = data.$name;

  // Determine the timeframe from the note's path or tags
  const getTimeframeInfo = () => {
    if (fileName.match(/^\d{4}-Q[1-4]$/))
      return { current: "quarterly", children: "monthly" };
    if (fileName.match(/^\d{4}-W\d{2}$/))
      return { current: "weekly", children: "daily" };
    if (fileName.match(/^\d{4}-\d{2}$/))
      return { current: "monthly", children: "weekly" };
    if (fileName.match(/^\d{4}$/))
      return { current: "yearly", children: "quarterly" };
    return { current: "daily", children: null };
  };

  const { current, children } = getTimeframeInfo();

  // If this is a daily note or we can't determine the timeframe, don't show anything
  if (!children) return null;

  // Query for child timeframe notes
  const notes = dc.useQuery(
    `@page and path("My Calendar") and #reviews/${children} and !path("Hidden")`
  );

  // Sort notes by name in descending order
  const sortedNotes = dc.useMemo(() => {
    return [...notes].sort((a, b) => b.$name.localeCompare(a.$name));
  }, [notes]);

  // Calculate date range based on current timeframe
  const getDateRange = () => {
    const date = dc.luxon.DateTime.fromISO(fileName);

    switch (current) {
      case "yearly":
        return {
          start: date.startOf("year"),
          end: date.endOf("year"),
        };
      case "quarterly":
        return {
          start: date.startOf("quarter"),
          end: date.endOf("quarter"),
        };
      case "monthly":
        return {
          start: date.startOf("month"),
          end: date.endOf("month"),
        };
      case "weekly":
        return {
          start: date.startOf("week"),
          end: date.endOf("week"),
        };
      default:
        return {
          start: date,
          end: date,
        };
    }
  };

  // Filter notes based on date range
  const { start, end } = getDateRange();
  const filteredNotes = dc.useMemo(() => {
    return sortedNotes.filter((note) => {
      const noteDate = dc.luxon.DateTime.fromISO(note.$name);
      return noteDate >= start.startOf("day") && noteDate <= end.endOf("day");
    });
  }, [sortedNotes, start, end]);

  const COLUMNS = [{ id: "Note", value: (page) => page.$link }];

  return (
    <dc.VanillaTable columns={COLUMNS} rows={filteredNotes} paging={true} />
  );
}

return { SmallerTimeframeNotes };
