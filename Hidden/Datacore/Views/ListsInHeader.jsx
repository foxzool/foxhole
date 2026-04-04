function ListsInHeader({ header = "Today" }) {
  const data = dc.useCurrentFile();
  const fileName = data.$name;

  //TODO: use regex to allow for alias and folder path via `\\[\\[(?:[^\\[\\]|/]*?/)?${value}(?:\\|[^\\]]*)?\\]\\]`;

  const COLUMNS = [
    { id: "Note", value: (page) => page.$ },
    { id: "Type", value: (page) => page.$tags },
    { id: "Created", value: (page) => page.value("Created") },
  ];
  // const regex = `\\[\\[(?:[^\\[\\]|]*?/)*${value}(?:\\|[^\\]]*)?\\]\\]`;
  const pages = dc.useQuery(
    `childof(@section and $name = "Today") and @list-item and !path("Hidden") and contains($text, "[[${fileName}]]")`
    // `@list-item and !path("Hidden") and regextest("${regex}", "$text")`
  );

  const blocks = dc.useQuery(
    `childof(@section and $name = "Today") and @block and !path("Hidden") and #tagged`
    // `@list-item and !path("Hidden") and regextest("${regex}", "$text")`
  );

  pages.forEach((page) => console.log("page.$text", page.$text));

  return (
    <p>
      {blocks.map((block) => (
        <dc.SpanEmbed
          path={block.$file}
          start={block.$position.start}
          end={block.$position.end}
          explain={block.$file}
        />
      ))}
      {pages.map((page, index) => {
        let parentLink = null;
        let currentPage = page;
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
        console.log("allChildren", allChildren);

        while (currentPage && !parentLink) {
          if (currentPage.$parent && currentPage.$parent.$link) {
            parentLink = currentPage.$parent.$link;
          } else {
            currentPage = currentPage.$parent;
          }
        }
        return (
          <div>
            <dc.Link link={parentLink.path} />{" "}
            <dc.Markdown key={index} content={page.$text} />
          </div>
        );
      })}
    </p>
  );
}

function ListWithoutTag() {
  const data = dc.useCurrentFile();
  const fileName = data.$name;

  //TODO: use regex to allow for alias and folder path via `\\[\\[(?:[^\\[\\]|/]*?/)?${value}(?:\\|[^\\]]*)?\\]\\]`;

  const COLUMNS = [
    { id: "Note", value: (page) => page.$ },
    { id: "Type", value: (page) => page.$tags },
    { id: "Created", value: (page) => page.value("Created") },
  ];
  // const regex = `\\[\\[(?:[^\\[\\]|]*?/)*${value}(?:\\|[^\\]]*)?\\]\\]`;
  const pages = dc.useQuery(
    `!childof(@section and $name = "Log") and @list-item and !path("Hidden") and contains($text, "[[${fileName}]]")`
    // `@list-item and !path("Hidden") and regextest("${regex}", "$text")`
  );
  console.log("pages", pages);

  pages.forEach((page) => console.log("page.$text", page.$text));

  return (
    <p>
      {pages.map((page, index) => {
        let parentLink = null;
        let currentPage = page;
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
        console.log("allChildren", allChildren);

        while (currentPage && !parentLink) {
          if (currentPage.$parent && currentPage.$parent.$link) {
            parentLink = currentPage.$parent.$link;
          } else {
            currentPage = currentPage.$parent;
          }
        }
        return (
          <div>
            <dc.Link link={parentLink.path} />{" "}
            <dc.Markdown key={index} content={page.$text} />
          </div>
        );
      })}
    </p>
  );
}

return { ListWithTag, ListWithoutTag };
