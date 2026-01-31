---
title: Understanding Ownership
description: Master Rust's unique ownership system
category: programming
tags: ["rust", "memory", "ownership"]
difficulty: intermediate
status: complete
series: rust-basics
seriesOrder: 2
dateCreated: 2025-01-12
estimatedTime: "25 min"
---

# Understanding Ownership

Ownership is Rust's most unique feature. It's what enables Rust to make memory safety guarantees without needing a garbage collector.

## The Ownership Rules

Rust's ownership system is built on three simple rules:

1. Each value in Rust has a variable that's called its **owner**
2. There can only be **one owner** at a time
3. When the owner goes out of scope, the value will be **dropped**

## Variable Scope

```rust
{                      // s is not valid here, it's not yet declared
    let s = "hello";   // s is valid from this point forward
    // do stuff with s
}                      // scope is over, s is no longer valid
```

## The String Type

Let's look at a more complex type to understand ownership better:

```rust
let s1 = String::from("hello");
let s2 = s1;  // s1 is moved to s2

// This won't compile!
// println!("{}", s1);  // Error: value borrowed after move
```

When we assign `s1` to `s2`, Rust **moves** the value. The data isn't copied; ownership is transferred.

## Why Moving?

Rust moves instead of copying to avoid expensive deep copies and to ensure memory safety. If both `s1` and `s2` tried to free the same memory when going out of scope, we'd have a **double free** error.

## Cloning

If you really want a deep copy:

```rust
let s1 = String::from("hello");
let s2 = s1.clone();

println!("{}, {}", s1, s2);  // This works!
```

## Stack-Only Data: Copy

Simple types like integers implement the `Copy` trait:

```rust
let x = 5;
let y = x;

println!("{}, {}", x, y);  // This works fine
```

## Ownership and Functions

Passing a value to a function moves or copies it:

```rust
fn main() {
    let s = String::from("hello");
    takes_ownership(s);  // s is moved into the function
    // s is no longer valid here

    let x = 5;
    makes_copy(x);  // x is copied
    // x is still valid here
}

fn takes_ownership(some_string: String) {
    println!("{}", some_string);
}  // some_string is dropped here

fn makes_copy(some_integer: i32) {
    println!("{}", some_integer);
}
```

## Return Values and Scope

Functions can also transfer ownership:

```rust
fn gives_ownership() -> String {
    let some_string = String::from("hello");
    some_string  // Returned and moves out
}

fn takes_and_gives_back(a_string: String) -> String {
    a_string  // Returned and moves out
}
```

## References and Borrowing

What if we want to use a value without taking ownership? We use **references**:

```rust
fn main() {
    let s1 = String::from("hello");
    let len = calculate_length(&s1);  // Borrow s1
    println!("The length of '{}' is {}.", s1, len);  // s1 still valid!
}

fn calculate_length(s: &String) -> usize {
    s.len()
}  // s goes out of scope, but nothing is dropped
```

The `&s1` syntax creates a reference that **borrows** the value without taking ownership.

## Mutable References

References are immutable by default, but you can have mutable references:

```rust
fn main() {
    let mut s = String::from("hello");
    change(&mut s);
    println!("{}", s);  // Prints "hello, world"
}

fn change(some_string: &mut String) {
    some_string.push_str(", world");
}
```

**Important**: You can have only ONE mutable reference to a value in a scope. This prevents data races at compile time!

## Key Takeaways

- Ownership ensures memory safety without garbage collection
- Values are moved by default, preventing accidental copies
- Use references (`&`) to borrow values without taking ownership
- Mutable references (`&mut`) allow modification but enforce exclusivity

Mastering ownership takes practice, but it's the key to writing safe, efficient Rust code!
