function DailyLogsWithTags({ tags = ["#log"] }) {
  const tag = tags[0];

  const currentFile = dc.useCurrentFile();

  const useFilteredItems = (currentFile, tag) => {
    const [startDate, endDate] = dc.useMemo(() => {
      if (!currentFile.$name.match(/\d{4}(-[QM]\d{2})?/)) {
        return [null, null];
      }

      const [year, period] = currentFile.$name.split("-");
      const parsedYear = parseInt(year);

      if (!period) {
        // Yearly timeframe
        return [new Date(parsedYear, 0, 1), new Date(parsedYear + 1, 0, 0)];
      } else if (period.startsWith("Q")) {
        // Quarterly timeframe
        const quarter = parseInt(period[1]);
        const quarterStartMonth = (quarter - 1) * 3;
        return [
          new Date(parsedYear, quarterStartMonth, 1),
          new Date(parsedYear, quarterStartMonth + 3, 0),
        ];
      } else if (period.startsWith("M")) {
        // Monthly timeframe
        const month = parseInt(period.substring(1)) - 1;
        return [
          new Date(parsedYear, month, 1),
          new Date(parsedYear, month + 1, 0),
        ];
      } else if (period.startsWith("W")) {
        // Weekly timeframe
        const week = parseInt(period.substring(1));
        const startOfYear = new Date(parsedYear, 0, 1);
        const weekStart = new Date(startOfYear);
        weekStart.setDate(startOfYear.getDate() + (week - 1) * 7);
        // Adjust to Monday if not already
        const dayOfWeek = weekStart.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        weekStart.setDate(weekStart.getDate() + diff);
        // Set end date to next Monday
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        return [weekStart, weekEnd];
      }

      return [null, null];
    }, [currentFile]);

    const listItems = dc.useQuery(
      `${tag} and path("My Calendar") and childof(@page) and @list-item and !path("Hidden")`
    );

    const filtered = dc.useArray(listItems, (array) =>
      array.where((item) => {
        if (!currentFile.$name.match(/\d{4}(-[QM]\d{2})?/)) {
          return true;
        }
        let match = item.$file.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (!match) return false;
        let year = parseInt(match[1]);
        let month = parseInt(match[2] - 1); // month is 0-indexed
        let day = parseInt(match[3]);
        let pageDate = new Date(year, month, day);
        return pageDate >= startDate && pageDate < endDate;
      })
    );

    const groupedItems = filtered.reduce((acc, page) => {
      let parentLink = null;
      let currentPage = page;

      while (currentPage && !parentLink) {
        if (currentPage.$parent && currentPage.$parent.$link) {
          parentLink = currentPage.$parent.$link;
        } else {
          currentPage = currentPage.$parent;
        }
      }

      if (parentLink) {
        if (!acc[parentLink.path]) {
          acc[parentLink.path] = {
            $link: parentLink,
            items: [],
          };
        }
        acc[parentLink.path].items.push(page);
      }

      return acc;
    }, {});

    return groupedItems;
  };

  const groupedItems = useFilteredItems(currentFile, tag);

  const sortedListItems = dc.useMemo(
    () =>
      Object.keys(groupedItems).sort((a, b) => {
        const nameB = groupedItems[b].$link.path.split("/").pop();
        const nameA = groupedItems[a].$link.path.split("/").pop();
        return nameB.localeCompare(nameA);
      }),
    [groupedItems]
  );

  const sortedListItemsArray = dc.useMemo(
    () =>
      sortedListItems.map((key) => ({
        ...groupedItems[key],
        path: key,
      })),
    [sortedListItems, groupedItems]
  );

  const COLUMNS = [
    { id: "Note", value: (page) => page.$link },
    {
      id: "Logs",
      value: (page) => page.items,
      render: (value) => (
        <ul>
          {value.map((page, pageIndex) => {
            const collectChildren = (page) => {
              let children = [];
              if (page.$elements) {
                page.$elements.forEach((child) => {
                  children.push(child);
                  children = children.concat(collectChildren(child));
                });
              }
              return children;
            };

            const allChildren = collectChildren(page);
            // Create regex to match exact tag or nested tags (e.g., #log or #log/something but not #loggedin)
            const tagRegex = new RegExp(`${tag}(/[\\w-]+)*\\b`, "g");

            return (
              <li key={pageIndex}>
                <dc.Markdown content={page.$text.replace(tagRegex, "")} />
                <ul>
                  {allChildren.map((child, childIndex) => (
                    <li key={childIndex}>
                      <dc.Markdown
                        content={child.$text.replace(tagRegex, "")}
                      />
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      ),
    },
  ];

  return (
    <dc.VanillaTable
      columns={COLUMNS}
      rows={sortedListItemsArray}
      paging={true}
    />
  );
}

return { DailyLogsWithTags };
