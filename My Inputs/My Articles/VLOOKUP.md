---
Status: 
tags:
  - input/articles
Links: ["[[Productivity]]"]
Created: 2024-06-28T11:38:06
Source:
  - ""
Author: 
Collection: 
Finished: 
Rating:
---
## Summary
# excel 如何用vlookup查找多个sheet
```
=IFERROR(VLOOKUP(A1, Sheet1!A:B, 2, FALSE), IFERROR(VLOOKUP(A1, Sheet2!A:B, 2, FALSE), VLOOKUP(A1, Sheet3!A:B, 2, FALSE)))
```

在这个公式中：

- `A1` 是你要查找的值。
- `Sheet1!A:B` 是你在 `Sheet1` 中查找的范围，其中 `A` 列是查找列，`B` 列是返回值列。
- `2` 表示返回值在查找范围的第二列。
- `FALSE` 表示精确匹配。

这个公式会首先在 `Sheet1` 中查找，如果找不到，则继续在 `Sheet2` 中查找，最后在 `Sheet3` 中查找。
## Notes
## Highlights
