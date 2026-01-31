---
title: Introduction to SDL3 Development in C
description: Learn the fundamentals of SDL3 for creating cross-platform games and multimedia applications in C
category: programming
tags: ["c", "sdl3", "gamedev", "graphics"]
difficulty: beginner
status: complete
dateCreated: 2025-01-31
estimatedTime: "30 min"
---

# Introduction to SDL3 Development in C

SDL (Simple DirectMedia Layer) is a cross-platform development library that provides low-level access to audio, keyboard, mouse, joystick, and graphics hardware. SDL3 is the latest major version, bringing modern improvements while maintaining the simplicity that made SDL popular.

## What You'll Learn

- Setting up SDL3 in your development environment
- Creating a window and renderer
- Handling events (keyboard, mouse, quit)
- Drawing basic shapes and colors
- Building a simple game loop

## Prerequisites

- Basic C programming knowledge
- A C compiler (GCC, Clang, or MSVC)
- CMake (recommended for building)

## Installing SDL3

### Linux (Ubuntu/Debian)

Build from source (SDL3 is still new and may not be in package managers):

```bash
# Install build dependencies
sudo apt install build-essential cmake git

# Clone and build SDL3
git clone https://github.com/libsdl-org/SDL.git
cd SDL
git checkout main  # SDL3 is on main branch
mkdir build && cd build
cmake ..
cmake --build . --parallel
sudo cmake --install .

# Update library cache
sudo ldconfig
```

### macOS

```bash
# Using Homebrew
brew install sdl3

# Or build from source similar to Linux
```

### Windows

Download the development libraries from [libsdl.org](https://libsdl.org) or use vcpkg:

```bash
vcpkg install sdl3
```

## Your First SDL3 Program

Let's create a simple window. Create a file called `main.c`:

```c
#include <SDL3/SDL.h>
#include <SDL3/SDL_main.h>
#include <stdio.h>

int main(int argc, char *argv[]) {
    // Initialize SDL
    if (!SDL_Init(SDL_INIT_VIDEO)) {
        printf("SDL_Init failed: %s\n", SDL_GetError());
        return 1;
    }

    // Create a window
    SDL_Window *window = SDL_CreateWindow(
        "My First SDL3 Window",
        800, 600,
        SDL_WINDOW_RESIZABLE
    );

    if (!window) {
        printf("SDL_CreateWindow failed: %s\n", SDL_GetError());
        SDL_Quit();
        return 1;
    }

    // Create a renderer
    SDL_Renderer *renderer = SDL_CreateRenderer(window, NULL);
    if (!renderer) {
        printf("SDL_CreateRenderer failed: %s\n", SDL_GetError());
        SDL_DestroyWindow(window);
        SDL_Quit();
        return 1;
    }

    // Main loop
    bool running = true;
    while (running) {
        // Handle events
        SDL_Event event;
        while (SDL_PollEvent(&event)) {
            if (event.type == SDL_EVENT_QUIT) {
                running = false;
            }
        }

        // Clear screen with a color (dark blue)
        SDL_SetRenderDrawColor(renderer, 25, 25, 112, 255);
        SDL_RenderClear(renderer);

        // Present the rendered frame
        SDL_RenderPresent(renderer);
    }

    // Cleanup
    SDL_DestroyRenderer(renderer);
    SDL_DestroyWindow(window);
    SDL_Quit();

    return 0;
}
```

## Building Your Program

Create a `CMakeLists.txt` file:

```cmake
cmake_minimum_required(VERSION 3.16)
project(sdl3_intro C)

find_package(SDL3 REQUIRED)

add_executable(game main.c)
target_link_libraries(game PRIVATE SDL3::SDL3)
```

Build and run:

```bash
mkdir build && cd build
cmake ..
cmake --build .
./game
```

You should see a dark blue window that you can close with the X button!

## Understanding the Code

### Initialization

```c
if (!SDL_Init(SDL_INIT_VIDEO)) {
    printf("SDL_Init failed: %s\n", SDL_GetError());
    return 1;
}
```

SDL3 changed from SDL2's pattern - `SDL_Init()` now returns `true` on success. We only initialize the video subsystem here, but you can combine flags like `SDL_INIT_VIDEO | SDL_INIT_AUDIO`.

### Creating a Window

```c
SDL_Window *window = SDL_CreateWindow(
    "My First SDL3 Window",  // Title
    800, 600,                // Width, height
    SDL_WINDOW_RESIZABLE     // Flags
);
```

SDL3 simplified window creation - no more position parameters (use `SDL_SetWindowPosition()` if needed).

### The Renderer

The renderer handles all drawing operations. SDL3 uses GPU-accelerated rendering by default:

```c
SDL_Renderer *renderer = SDL_CreateRenderer(window, NULL);
```

Pass `NULL` to let SDL choose the best available rendering driver.

### Event Handling

```c
SDL_Event event;
while (SDL_PollEvent(&event)) {
    if (event.type == SDL_EVENT_QUIT) {
        running = false;
    }
}
```

SDL3 renamed events with the `SDL_EVENT_` prefix. Common events include:
- `SDL_EVENT_QUIT` - Window close button clicked
- `SDL_EVENT_KEY_DOWN` / `SDL_EVENT_KEY_UP` - Keyboard input
- `SDL_EVENT_MOUSE_MOTION` - Mouse movement
- `SDL_EVENT_MOUSE_BUTTON_DOWN` - Mouse clicks

## Adding Keyboard Input

Let's extend our program to handle keyboard input:

```c
// Inside the event loop
if (event.type == SDL_EVENT_KEY_DOWN) {
    switch (event.key.scancode) {
        case SDL_SCANCODE_ESCAPE:
            running = false;
            break;
        case SDL_SCANCODE_SPACE:
            printf("Space pressed!\n");
            break;
    }
}
```

## Drawing Shapes

Let's draw some basic shapes. Add this after `SDL_RenderClear()`:

```c
// Draw a filled red rectangle
SDL_SetRenderDrawColor(renderer, 255, 0, 0, 255);
SDL_FRect rect = {100.0f, 100.0f, 200.0f, 150.0f};
SDL_RenderFillRect(renderer, &rect);

// Draw a green outlined rectangle
SDL_SetRenderDrawColor(renderer, 0, 255, 0, 255);
SDL_FRect outline = {350.0f, 100.0f, 200.0f, 150.0f};
SDL_RenderRect(renderer, &outline);

// Draw a yellow line
SDL_SetRenderDrawColor(renderer, 255, 255, 0, 255);
SDL_RenderLine(renderer, 100.0f, 300.0f, 500.0f, 400.0f);
```

SDL3 uses `SDL_FRect` (floating point) as the default rectangle type for rendering operations.

## A Moving Rectangle

Here's a complete example with a moving rectangle you can control:

```c
#include <SDL3/SDL.h>
#include <SDL3/SDL_main.h>
#include <stdio.h>

int main(int argc, char *argv[]) {
    if (!SDL_Init(SDL_INIT_VIDEO)) {
        printf("SDL_Init failed: %s\n", SDL_GetError());
        return 1;
    }

    SDL_Window *window = SDL_CreateWindow("Moving Rectangle", 800, 600, 0);
    SDL_Renderer *renderer = SDL_CreateRenderer(window, NULL);

    // Rectangle position and speed
    float x = 400.0f, y = 300.0f;
    float speed = 300.0f;

    Uint64 lastTime = SDL_GetTicks();
    bool running = true;

    while (running) {
        // Calculate delta time
        Uint64 currentTime = SDL_GetTicks();
        float deltaTime = (currentTime - lastTime) / 1000.0f;
        lastTime = currentTime;

        // Handle events
        SDL_Event event;
        while (SDL_PollEvent(&event)) {
            if (event.type == SDL_EVENT_QUIT) {
                running = false;
            }
        }

        // Get keyboard state for smooth movement
        const bool *keys = SDL_GetKeyboardState(NULL);

        if (keys[SDL_SCANCODE_W] || keys[SDL_SCANCODE_UP])
            y -= speed * deltaTime;
        if (keys[SDL_SCANCODE_S] || keys[SDL_SCANCODE_DOWN])
            y += speed * deltaTime;
        if (keys[SDL_SCANCODE_A] || keys[SDL_SCANCODE_LEFT])
            x -= speed * deltaTime;
        if (keys[SDL_SCANCODE_D] || keys[SDL_SCANCODE_RIGHT])
            x += speed * deltaTime;
        if (keys[SDL_SCANCODE_ESCAPE])
            running = false;

        // Clear screen
        SDL_SetRenderDrawColor(renderer, 30, 30, 30, 255);
        SDL_RenderClear(renderer);

        // Draw player rectangle
        SDL_SetRenderDrawColor(renderer, 0, 200, 255, 255);
        SDL_FRect player = {x - 25.0f, y - 25.0f, 50.0f, 50.0f};
        SDL_RenderFillRect(renderer, &player);

        SDL_RenderPresent(renderer);
    }

    SDL_DestroyRenderer(renderer);
    SDL_DestroyWindow(window);
    SDL_Quit();
    return 0;
}
```

This demonstrates:
- **Delta time** - Frame-rate independent movement
- **Continuous input** - Using `SDL_GetKeyboardState()` for smooth controls
- **Game loop structure** - Input, update, render

## Key Differences from SDL2

If you're coming from SDL2, here are the major changes in SDL3:

| SDL2 | SDL3 |
|------|------|
| `SDL_Init()` returns 0 on success | Returns `true` on success |
| `SDL_QUIT` event | `SDL_EVENT_QUIT` |
| `SDL_Rect` for rendering | `SDL_FRect` (float) |
| `SDL_GetTicks()` returns Uint32 | Returns Uint64 |
| `SDL_GetKeyboardState()` returns Uint8* | Returns bool* |
| Position in `SDL_CreateWindow()` | Use `SDL_SetWindowPosition()` |

## Next Steps

Now that you have the basics, explore these topics:

- **Textures and Images** - Load and display images with SDL_image
- **Audio** - Play sounds with SDL_mixer or SDL3's built-in audio
- **Text Rendering** - Display text with SDL_ttf
- **Game State Management** - Organize your code into states (menu, playing, paused)
- **Collision Detection** - Make objects interact

## Resources

- [SDL3 Wiki](https://wiki.libsdl.org/SDL3) - Official documentation
- [SDL3 Migration Guide](https://wiki.libsdl.org/SDL3/README/migration) - Moving from SDL2
- [SDL GitHub](https://github.com/libsdl-org/SDL) - Source code and examples

SDL3 provides a solid foundation for game development and multimedia applications. Start simple, experiment with the examples, and gradually build more complex projects!
