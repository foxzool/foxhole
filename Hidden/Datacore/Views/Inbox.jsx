const { multiSort } = await dc.require("Hidden/Datacore/Utilities/sort.js");

function Inbox() {
  const pages = dc.useQuery(`@page and path("My Inbox")`);
  const COLUMNS = [
    { id: "Note", value: (page) => page.$link },
    { id: "Status", value: (page) => page.value("Status") },
    { id: "Created", value: (page) => page.value("created") },
  ];
  const sortedPages = pages.sort(
    multiSort([
      {
        fieldName: "created",
        sortOrder: "desc",
        type: "date",
      },
      {
        fieldName: "$ctime",
        sortOrder: "desc",
        type: "date",
      },
    ])
  );
  return <dc.VanillaTable columns={COLUMNS} rows={sortedPages} />;
}

return { Inbox };
