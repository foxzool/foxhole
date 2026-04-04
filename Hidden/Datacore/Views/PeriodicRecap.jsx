function PeriodicRecap() {
  const data = dc.useCurrentFile();
  const fileName = data.$name;

  console.log("Processing file:", fileName); // Debug log

  // Determine the timeframe from the note's path or tags
  const getTimeframeInfo = () => {
    if (fileName.match(/^\d{4}-Q[1-4]$/)) {
      console.log("Detected quarterly note");
      return { current: "quarterly", children: "monthly" };
    }
    if (fileName.match(/^\d{4}-W\d{2}$/)) {
      console.log("Detected weekly note");
      return { current: "weekly", children: "daily" };
    }
    if (fileName.match(/^\d{4}-(M\d{2}|\d{2})$/)) {
      // Updated pattern
      console.log("Detected monthly note");
      return { current: "monthly", children: "weekly" };
    }
    if (fileName.match(/^\d{4}$/)) {
      console.log("Detected yearly note");
      return { current: "yearly", children: "quarterly" };
    }
    console.log("Detected daily note or unknown format");
    return { current: "daily", children: null };
  };

  const getAvailableViews = (current) => {
    switch (current) {
      case "yearly":
        return [
          { id: "quarterly", emoji: "🌖", label: "Quarters" },
          { id: "monthly", emoji: "🌗", label: "Months" },
          { id: "weekly", emoji: "🌘", label: "Weeks" },
          { id: "daily", emoji: "🌑", label: "Days" },
        ];
      case "quarterly":
        return [
          { id: "monthly", emoji: "🌗", label: "Months" },
          { id: "weekly", emoji: "🌘", label: "Weeks" },
          { id: "daily", emoji: "🌑", label: "Days" },
        ];
      case "monthly":
        return [
          { id: "weekly", emoji: "🌘", label: "Weeks" },
          { id: "daily", emoji: "🌑", label: "Days" },
        ];
      case "weekly":
        return [{ id: "daily", emoji: "🌑", label: "Days" }];
      default:
        return [];
    }
  };

  const { current, children } = getTimeframeInfo();
  const [activeView, setActiveView] = dc.useState(children);
  const availableViews = getAvailableViews(current);

  console.log("Timeframe:", current, "Children:", children);

  // If this is a daily note or we can't determine the timeframe, don't show anything
  if (!children) return null;

  // Reuse button styling from PaxHabitTracker
  const ActionButton = ({ emoji, label, onClick, isActive }) => (
    <button
      onClick={onClick}
      style={{
        padding: "8px 16px",
        borderRadius: "8px",
        border: "none",
        backgroundColor: isActive
          ? "var(--interactive-accent)"
          : "var(--background-secondary)",
        color: isActive ? "var(--text-on-accent)" : "var(--text-normal)",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        fontSize: "14px",
        fontWeight: "500",
      }}
    >
      <span style={{ fontSize: "16px" }}>{emoji}</span>
      <span>{label}</span>
    </button>
  );

  // Updated query to handle both month formats
  const queryString = `@page and path("My Calendar") and #reviews/${activeView} and !path("Hidden")`;
  console.log("Query:", queryString);
  const notes = dc.useQuery(queryString);
  console.log("Query results:", notes?.length || 0, "notes found");

  // Sort notes by name in ascending order
  const sortedNotes = dc.useMemo(() => {
    return [...notes].sort((a, b) => a.$name.localeCompare(b.$name));
  }, [notes]);

  console.log("sorted notes", sortedNotes);

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

  // Helper function to parse custom date formats
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

  // Filter notes based on date range
  const { start, end } = parseCustomDate(fileName);
  const filteredNotes = dc.useMemo(() => {
    return sortedNotes.filter((note) => {
      const noteName = note.$name.replace(/^.*[\\/]/, "").replace(/\.md$/, "");
      const noteDates = parseCustomDate(noteName);

      // Debug logging
      console.log("Comparing:", {
        note: noteName,
        noteStart: noteDates.start.toISO(),
        noteEnd: noteDates.end.toISO(),
        rangeStart: start.toISO(),
        rangeEnd: end.toISO(),
      });

      // A note is within range if:
      // - its start date is before or equal to the range's end AND
      // - its end date is after or equal to the range's start
      return noteDates.start <= end && noteDates.end >= start;
    });
  }, [sortedNotes, start, end]);
  console.log("pages in range", filteredNotes);

  // Define columns based on timeframe
  const getColumns = () => {
    if (activeView === "daily") {
      return [
        { id: "Note", value: (page) => page.$link },
        { id: "Rating ⭐️", value: (page) => page.value("Rating") },
        {
          id: "Summary",
          value: (page) => page.value("Summary"),
          // render: (value) => {
          //   const summarySection = value.$sections.find(
          //     (section) => section.$title === "Summary"
          //   );

          //   if (summarySection) {
          //     // Find the next section at the same level or higher
          //     const currentLevel = summarySection.$level;
          //     const allSections = value.$sections;
          //     const summaryIndex = allSections.indexOf(summarySection);

          //     let endPosition = summarySection.$position.end;

          //     // Look for the next section at the same level or higher
          //     for (let i = summaryIndex + 1; i < allSections.length; i++) {
          //       const nextSection = allSections[i];
          //       if (nextSection.$level <= currentLevel) {
          //         endPosition = nextSection.$position.start;
          //         break;
          //       }
          //     }

          //     return (
          //       <dc.SpanEmbed
          //         path={value.$file}
          //         start={summarySection.$position.start + 1}
          //         end={endPosition}
          //         showExplain={false}
          //       />
          //     );
          //   }
          //   return <></>;
          // },
        },
        { id: "Story", value: (page) => page.value("Story") },
        { id: "✍️", value: (page) => page.value("Headings").join("\n") },
      ];
    } else {
      // For weekly, monthly, quarterly
      return [
        { id: "Note", value: (page) => page.$link },
        { id: "Rating", value: (page) => page.value("Total") },
        { id: "Summary", value: (page) => page.value("Summary") },
        { id: "Personal", value: (page) => page.value("Personal") },
        { id: "Career", value: (page) => page.value("Career") },
      ];
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {availableViews.length > 1 && (
        <div
          style={{
            display: "flex",
            gap: "8px",
            padding: "8px",
            backgroundColor: "var(--background-secondary)",
            borderRadius: "8px",
            justifyContent: "center",
          }}
        >
          {availableViews.map((view) => (
            <ActionButton
              key={view.id}
              emoji={view.emoji}
              label={view.label}
              onClick={() => setActiveView(view.id)}
              isActive={activeView === view.id}
            />
          ))}
        </div>
      )}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          border: "1px solid var(--background-modifier-border)",
          borderRadius: "8px",
          minHeight: "400px", // Set a minimum height to prevent jumping
          maxHeight: "calc(100vh - 200px)", // Set max height
          height: "auto", // Set height to content
        }}
      >
        <dc.VanillaTable
          columns={getColumns()} // Call getColumns() directly here
          rows={filteredNotes}
          paging={filteredNotes.length > 7 ? 7 : false}
        />
      </div>
    </div>
  );
}

return { PeriodicRecap };
