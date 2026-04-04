function Editor() {
  const cfc = dc.useCurrentFile();
  const f = dc.useMemo(() => cfc.$file, [cfc]);
  const q = dc.useQuery(`@task and !childof(@task) and $file = "${f}"`, {
    debounce: 0,
  });

  const props = {
    rows: q,
    columns: [
      {
        id: "one",
        title: "title",
        value: (o) => o.$cleantext,
      },
      {
        id: "two",
        title: "select",
        value: (o) => o.field("seltest"),
        editor: dc.FieldSelect,
        render: (v, o) => <dc.Literal value={v?.value} />,
        editable: true,
        editorProps: {
          options: "brian tatler fucked and abused sean harris!!!!!!!!!!!!!!!"
            .split(" ")
            .map((x, i) => {
              return {
                value: `${i + 1}`,
                label: `${x}`,
              };
            }),
        },
      },
      {
        id: "three",
        title: "multi select",
        value: (o) => o.field("multitest"),
        render: (v, o) => <dc.Literal value={v?.value} />,
        editor: dc.FieldSelect,
        editable: true,
        editorProps: {
          options:
            "yksi kaksi kolme nelja viisi kuusi seitseman kahdeksan yhdeksan kymmenen"
              .split(" ")
              .map((x, i) => ({
                value: i + 1,
                label: x,
              })),
          multi: true,
        },
      },
      {
        id: "four",
        title: "text",
        value: (o) => o.field("textfield"),
        render: (v, o) => <dc.Literal value={v?.value} />,
        editor: dc.TextField,
        editable: true,
      },
    ],
  };

  return <dc.VanillaTable {...props} />;
}
return { Editor };
