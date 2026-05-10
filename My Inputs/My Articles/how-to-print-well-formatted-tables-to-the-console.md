---
Status: 
tags:
  - input/articles
  - rust
Links:
  - "[[Rust MOC]]"
Created: 2024-08-16T10:19:36
Source:
  - https://stackoverflow.com/questions/30379341/how-to-print-well-formatted-tables-to-the-console
Author: 
Collection: 
Finished: 
Rating: 
---
## Summary
## Notes
The syntax is like the str.format syntax in Python. This:

```rust
fn main() {
    println!(
        "{0: <10} | {1: <10} | {2: <10} | {3: <10}",
        "total", "blanks", "comments", "code"
    );
    println!("{0: <10} | {1: <10} | {2: <10} | {3: <10}", 0, 0, 0, 0);
    println!("{0: <10} | {1: <10} | {2: <10} | {3: <10}", 77, 0, 3, 74);
    println!("{0: <10} | {1: <10} | {2: <10} | {3: <10}", 112, 0, 6, 106);
    println!(
        "{0: <10} | {1: <10} | {2: <10} | {3: <10}",
        460, 0, 10, 1371
    );
}
```

([playground](https://play.rust-lang.org/?version=stable&mode=debug&edition=2015&gist=926795b7097824f91a4c5b629b4e44ea))

produces the following output:

```
total      | blanks     | comments   | code      
0          | 0          | 0          | 0         
77         | 0          | 3          | 74        
112        | 0          | 6          | 106       
460        | 0          | 10         | 1371  
```
## Highlights
