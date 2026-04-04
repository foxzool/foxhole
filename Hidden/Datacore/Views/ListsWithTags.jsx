function ListsWithTags({ tags = ["#log"] }) {
  const data = dc.useCurrentFile();
  const tag = tags[0];

  const listItems = dc.useQuery(
    `${tag} and path("My Calendar") and childof(@page) and @list-item and !path("Hidden")`
  );

  const groupedItems = listItems.reduce((acc, page) => {
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

return { ListsWithTags };
