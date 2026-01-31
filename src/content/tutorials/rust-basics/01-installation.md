---
title: Installing Rust
description: Set up your Rust development environment
category: programming
tags: ["rust", "setup"]
difficulty: beginner
status: complete
series: rust-basics
seriesOrder: 1
dateCreated: 2025-01-10
estimatedTime: "10 min"
---

# Installing Rust

Let's get Rust installed on your system and verify everything is working correctly.

## Using rustup

The recommended way to install Rust is using `rustup`, the official Rust toolchain installer.

### macOS and Linux

Open a terminal and run:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Follow the on-screen instructions. The installer will:
- Download and install `rustc` (the Rust compiler)
- Install `cargo` (Rust's package manager and build tool)
- Configure your PATH

### Windows

Download and run the installer from [rustup.rs](https://rustup.rs).

You may need to install the Visual Studio C++ Build Tools if you don't have them already.

## Verify Installation

After installation completes, restart your terminal and verify:

```bash
rustc --version
cargo --version
```

You should see version numbers for both tools.

## Your First Rust Program

Let's make sure everything works by creating a simple program:

```bash
cargo new hello_rust
cd hello_rust
```

This creates a new Rust project with the following structure:

```
hello_rust/
├── Cargo.toml
└── src/
    └── main.rs
```

The `src/main.rs` file contains a "Hello, world!" program:

```rust
fn main() {
    println!("Hello, world!");
}
```

## Build and Run

```bash
cargo run
```

You should see:

```
   Compiling hello_rust v0.1.0
    Finished dev [unoptimized + debuginfo] target(s) in 0.50s
     Running `target/debug/hello_rust`
Hello, world!
```

Congratulations! You've successfully installed Rust and run your first program.

## IDE Setup (Optional)

For the best development experience, consider using:

- **VS Code** with the rust-analyzer extension
- **IntelliJ IDEA** with the Rust plugin
- **Vim/Neovim** with rust.vim and coc-rust-analyzer

Next, we'll dive into Rust's most important feature: the ownership system!
