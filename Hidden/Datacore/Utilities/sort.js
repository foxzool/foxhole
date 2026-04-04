/**
 * Returns a comparator function to sort objects by multiple criteria.
 *
 * @param {Array<{
 *   fieldName: string,
 *   sortOrder: "asc" | "desc",
 *   type: "date" | "number" | "string" | "boolean" | "custom",
 *   nullsPosition?: "first" | "last"
 * }>} criteria - An array of sorting criteria objects
 * @param {Object<string, Array<any>>} customOrders - An object defining custom orders for fields
 * @returns {(a: any, b: any) => number} A comparator function to be used with Array.sort()
 */
const multiSort = (criteria, customOrders = {}) => {
  // Input validation
  if (!Array.isArray(criteria) || criteria.length === 0) {
    throw new Error("Criteria must be a non-empty array");
  }

  // Validate each criterion
  criteria.forEach((criterion) => {
    if (!criterion.fieldName || !criterion.sortOrder || !criterion.type) {
      throw new Error(
        "Each criterion must have fieldName, sortOrder, and type properties"
      );
    }
    if (!["asc", "desc"].includes(criterion.sortOrder)) {
      throw new Error('sortOrder must be either "asc" or "desc"');
    }
    if (
      !["date", "number", "string", "boolean", "custom"].includes(
        criterion.type
      )
    ) {
      throw new Error(
        'type must be one of: "date", "number", "string", "boolean", "custom"'
      );
    }
    if (criterion.type === "custom" && !customOrders[criterion.fieldName]) {
      throw new Error(
        `Custom order for field "${criterion.fieldName}" must be provided`
      );
    }
  });

  // Comparison helper function
  const cmp = (a, b) => (a > b) - (a < b);

  // Value extraction with type handling
  const getValue = (obj, fieldName, type) => {
    let value;
    if (fieldName.startsWith("$")) {
      value = obj[fieldName];
    } else {
      value = obj.value(fieldName);
    }

    if (value == null) return null;

    if (Array.isArray(value)) {
      value = value[0];
    }

    switch (type) {
      case "date":
        const date = new Date(value);
        return isNaN(date.getTime()) ? null : date.getTime();
      case "number":
        return typeof value === "number" ? value : null;
      case "boolean":
        return typeof value === "boolean" ? value : null;
      case "string":
        return String(value).toLowerCase();
      case "custom":
        return customOrders[fieldName].indexOf(value);
      default:
        return null;
    }
  };

  return (a, b) => {
    for (const {
      fieldName,
      sortOrder,
      type,
      nullsPosition = "last",
    } of criteria) {
      const valueA = getValue(a, fieldName, type);
      const valueB = getValue(b, fieldName, type);

      // Handle null values
      if (valueA === null && valueB === null) continue;
      if (valueA === null) return nullsPosition === "first" ? -1 : 1;
      if (valueB === null) return nullsPosition === "first" ? 1 : -1;

      const result =
        sortOrder === "asc" ? cmp(valueA, valueB) : cmp(valueB, valueA);
      if (result !== 0) return result;
    }
    return 0;
  };
};

// Example usage:
const testData = [
  {
    name: "Alice",
    created: "2021-01-01",
    value: 10,
    active: true,
    status: "in progress",
  },
  {
    name: "Bob",
    created: "2020-01-02",
    value: 20,
    active: false,
    status: "todo",
  },
  {
    name: "Charlie",
    created: "2021-01-01",
    value: 15,
    active: true,
    status: "finished",
  },
  {
    name: "Grok",
    created: "2021-01-01",
    value: 10,
    active: true,
    status: "in progress",
  },
  { name: "David", created: null, value: 25, active: true, status: "todo" },
  {
    name: "Eve",
    created: "2021-01-01",
    value: null,
    active: false,
    status: "finished",
  },
];

// const criteria = [
//   {
//     fieldName: "created",
//     sortOrder: "asc",
//     type: "date",
//     nullsPosition: "last",
//   },
//   {
//     fieldName: "value",
//     sortOrder: "desc",
//     type: "number",
//     nullsPosition: "last",
//   },
//   { fieldName: "name", sortOrder: "asc", type: "string" },
//   { fieldName: "status", sortOrder: "asc", type: "custom" },
// ];

// const customOrders = {
//   status: ["todo", "in progress", "finished"],
// };

// const sorted = [...testData].sort(multiSort(criteria, customOrders));
// console.log(sorted);

return { multiSort };
