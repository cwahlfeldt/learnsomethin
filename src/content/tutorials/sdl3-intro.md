---
title: Introduction to SDL3 Development in C
description: Learn the fundamentals of SDL3 for creating cross-platform games and multimedia applications in C
category: programming
tags: ["c", "sdl3", "gamedev", "graphics"]
difficulty: beginner
status: complete
dateCreated: 2025-01-31
estimatedTime: "45 min"
---

# Introduction to SDL3 Development in C

Have you ever wondered how video games create windows, draw graphics, and respond to your keyboard and mouse? That's exactly what SDL3 helps you do.

**SDL** stands for **Simple DirectMedia Layer**. It's a library (a collection of pre-written code) that handles all the complicated stuff like talking to your graphics card, detecting key presses, and playing sounds. Instead of writing thousands of lines of platform-specific code, you can use SDL3's simple functions to build games and multimedia apps that work on Windows, Mac, and Linux.

## What You'll Learn

By the end of this tutorial, you'll understand how to:

- Install SDL3 on your computer
- Create a window that appears on screen
- Draw colors and shapes
- Respond to keyboard input and the close button
- Build a simple interactive program with a moving rectangle

## Prerequisites

Before starting, you should have:

- **Basic C programming knowledge** - You should understand variables, functions, loops, and pointers
- **A C compiler** - GCC (Linux/Mac), Clang (Mac), or MSVC (Windows)
- **CMake** - A tool that helps build C projects (we'll use this to compile our code)

Don't worry if you haven't used CMake before—we'll walk through it step by step.

## Installing SDL3

SDL3 needs to be installed on your system before you can use it. Choose the instructions for your operating system:

### Linux (Ubuntu/Debian)

Open a terminal and run these commands one at a time:

```bash
# First, install the tools needed to build SDL3
sudo apt install build-essential cmake git

# Download the SDL3 source code
git clone https://github.com/libsdl-org/SDL.git

# Enter the SDL folder
cd SDL

# Create a build folder and enter it
mkdir build && cd build

# Configure the build
cmake ..

# Compile SDL3 (this may take a few minutes)
cmake --build . --parallel

# Install SDL3 to your system
sudo cmake --install .

# Update your system's library list
sudo ldconfig
```

### macOS

The easiest way is using Homebrew (a package manager for Mac):

```bash
brew install sdl3
```

If you don't have Homebrew, you can install it from [brew.sh](https://brew.sh) first.

### Windows

Download the development libraries from [libsdl.org](https://libsdl.org), or use vcpkg (a C++ package manager):

```bash
vcpkg install sdl3
```

## Your First SDL3 Program

Let's create a program that opens a window. This is the foundation of any graphical application.

Create a new file called `main.c` and add this code:

```c
#include <SDL3/SDL.h>
#include <SDL3/SDL_main.h>
#include <stdio.h>

int main(int argc, char *argv[]) {
    // Step 1: Initialize SDL
    // This starts up SDL's video system so we can create windows and draw
    if (!SDL_Init(SDL_INIT_VIDEO)) {
        printf("SDL_Init failed: %s\n", SDL_GetError());
        return 1;
    }

    // Step 2: Create a window
    // This creates a visible window on screen
    SDL_Window *window = SDL_CreateWindow(
        "My First SDL3 Window",  // The title shown in the title bar
        800, 600,                // Width and height in pixels
        SDL_WINDOW_RESIZABLE     // Allow the user to resize the window
    );

    // Check if window creation failed
    if (!window) {
        printf("SDL_CreateWindow failed: %s\n", SDL_GetError());
        SDL_Quit();
        return 1;
    }

    // Step 3: Create a renderer
    // The renderer is what actually draws things to the window
    SDL_Renderer *renderer = SDL_CreateRenderer(window, NULL);
    if (!renderer) {
        printf("SDL_CreateRenderer failed: %s\n", SDL_GetError());
        SDL_DestroyWindow(window);
        SDL_Quit();
        return 1;
    }

    // Step 4: The main loop
    // This keeps running until the user closes the window
    bool running = true;
    while (running) {
        // Check for events (like clicking the X button)
        SDL_Event event;
        while (SDL_PollEvent(&event)) {
            if (event.type == SDL_EVENT_QUIT) {
                running = false;
            }
        }

        // Set the color to draw with (dark blue: R=25, G=25, B=112, A=255)
        SDL_SetRenderDrawColor(renderer, 25, 25, 112, 255);

        // Fill the entire window with that color
        SDL_RenderClear(renderer);

        // Show what we drew on screen
        SDL_RenderPresent(renderer);
    }

    // Step 5: Clean up
    // Always free resources when you're done
    SDL_DestroyRenderer(renderer);
    SDL_DestroyWindow(window);
    SDL_Quit();

    return 0;
}
```

Let's break down what each part does.

## Understanding the Code

### The Include Statements

```c
#include <SDL3/SDL.h>
#include <SDL3/SDL_main.h>
#include <stdio.h>
```

- `SDL3/SDL.h` - This gives us access to all SDL3 functions
- `SDL3/SDL_main.h` - This handles platform-specific entry point differences
- `stdio.h` - Standard C library for `printf()` to print error messages

### Initializing SDL

```c
if (!SDL_Init(SDL_INIT_VIDEO)) {
    printf("SDL_Init failed: %s\n", SDL_GetError());
    return 1;
}
```

Before using any SDL functions, you must initialize the library. `SDL_Init()` returns `true` if it succeeds and `false` if it fails.

The `SDL_INIT_VIDEO` flag tells SDL we want to use the video (graphics) system. If you wanted audio too, you could combine flags: `SDL_INIT_VIDEO | SDL_INIT_AUDIO`.

If something goes wrong, `SDL_GetError()` returns a human-readable error message explaining what happened.

### Creating a Window

```c
SDL_Window *window = SDL_CreateWindow(
    "My First SDL3 Window",  // Title
    800, 600,                // Width, height
    SDL_WINDOW_RESIZABLE     // Flags
);
```

This creates a window on your screen. The parameters are:
- **Title** - The text shown in the window's title bar
- **Width and Height** - The size of the window in pixels
- **Flags** - Options that modify the window's behavior

Common window flags include:
- `SDL_WINDOW_RESIZABLE` - User can resize the window
- `SDL_WINDOW_FULLSCREEN` - Window takes up the entire screen
- `0` - No special flags (fixed-size window)

The function returns a pointer to the window, or `NULL` if it failed.

### The Renderer

```c
SDL_Renderer *renderer = SDL_CreateRenderer(window, NULL);
```

Think of the window as a picture frame, and the renderer as your paintbrush. The **renderer** is what actually draws graphics onto the window.

We pass `NULL` as the second parameter to let SDL automatically choose the best graphics driver for your system (usually your GPU for hardware acceleration).

### The Main Loop

Every interactive program needs a **main loop**—code that runs repeatedly until the user decides to quit. Games typically run this loop 60 times per second (or more).

```c
bool running = true;
while (running) {
    // 1. Handle events
    // 2. Update game state
    // 3. Draw everything
}
```

### Event Handling

```c
SDL_Event event;
while (SDL_PollEvent(&event)) {
    if (event.type == SDL_EVENT_QUIT) {
        running = false;
    }
}
```

**Events** are things that happen—a key press, mouse click, or the user clicking the window's close button.

`SDL_PollEvent()` checks if any events have occurred. If there's an event waiting, it fills in the `event` variable and returns `true`. We use a `while` loop because multiple events might happen in a single frame.

`SDL_EVENT_QUIT` occurs when the user clicks the X button to close the window.

### Drawing

```c
// Set the drawing color to dark blue (RGBA)
SDL_SetRenderDrawColor(renderer, 25, 25, 112, 255);

// Fill the screen with the current color
SDL_RenderClear(renderer);

// Display the result
SDL_RenderPresent(renderer);
```

Colors in SDL use **RGBA** format:
- **R** (Red): 0-255
- **G** (Green): 0-255
- **B** (Blue): 0-255
- **A** (Alpha/transparency): 0-255 (255 = fully opaque)

`SDL_RenderClear()` fills the entire window with the current color. `SDL_RenderPresent()` takes everything you've drawn and displays it on screen.

### Cleanup

```c
SDL_DestroyRenderer(renderer);
SDL_DestroyWindow(window);
SDL_Quit();
```

When your program ends, you should free the resources you created. This prevents memory leaks. Always destroy things in the reverse order you created them.

## Building Your Program

Now let's compile and run your program. Create a file called `CMakeLists.txt` in the same folder:

```cmake
cmake_minimum_required(VERSION 3.16)
project(sdl3_intro C)

find_package(SDL3 REQUIRED)

add_executable(game main.c)
target_link_libraries(game PRIVATE SDL3::SDL3)
```

This tells CMake:
1. We need at least CMake version 3.16
2. Our project is called "sdl3_intro" and uses C
3. Find SDL3 on the system
4. Create an executable called "game" from our main.c file
5. Link it with the SDL3 library

Now build and run:

```bash
# Create a build directory
mkdir build && cd build

# Configure the project
cmake ..

# Compile
cmake --build .

# Run the program
./game
```

You should see a dark blue window appear. Click the X button to close it.

## Adding Keyboard Input

Let's make our program respond to key presses. Modify the event handling section:

```c
SDL_Event event;
while (SDL_PollEvent(&event)) {
    if (event.type == SDL_EVENT_QUIT) {
        running = false;
    }

    // Handle key presses
    if (event.type == SDL_EVENT_KEY_DOWN) {
        switch (event.key.scancode) {
            case SDL_SCANCODE_ESCAPE:
                printf("Escape pressed - exiting!\n");
                running = false;
                break;
            case SDL_SCANCODE_SPACE:
                printf("Space bar pressed!\n");
                break;
            case SDL_SCANCODE_W:
                printf("W key pressed!\n");
                break;
        }
    }
}
```

`SDL_EVENT_KEY_DOWN` triggers when a key is pressed down. The `event.key.scancode` tells you which physical key was pressed.

Common scancodes include:
- `SDL_SCANCODE_ESCAPE`, `SDL_SCANCODE_SPACE`, `SDL_SCANCODE_RETURN`
- `SDL_SCANCODE_W`, `SDL_SCANCODE_A`, `SDL_SCANCODE_S`, `SDL_SCANCODE_D`
- `SDL_SCANCODE_UP`, `SDL_SCANCODE_DOWN`, `SDL_SCANCODE_LEFT`, `SDL_SCANCODE_RIGHT`

## Drawing Shapes

Let's draw some shapes on screen. Add this code after `SDL_RenderClear()` but before `SDL_RenderPresent()`:

```c
// Draw a filled red rectangle
SDL_SetRenderDrawColor(renderer, 255, 0, 0, 255);  // Red
SDL_FRect redBox = {100.0f, 100.0f, 200.0f, 150.0f};  // x, y, width, height
SDL_RenderFillRect(renderer, &redBox);

// Draw a green outline rectangle (not filled)
SDL_SetRenderDrawColor(renderer, 0, 255, 0, 255);  // Green
SDL_FRect greenOutline = {350.0f, 100.0f, 200.0f, 150.0f};
SDL_RenderRect(renderer, &greenOutline);

// Draw a yellow line
SDL_SetRenderDrawColor(renderer, 255, 255, 0, 255);  // Yellow
SDL_RenderLine(renderer, 100.0f, 300.0f, 500.0f, 400.0f);  // x1, y1, x2, y2
```

`SDL_FRect` defines a rectangle using floating-point numbers:
- `x` - Distance from the left edge of the window
- `y` - Distance from the top of the window (y increases downward!)
- `width` - How wide the rectangle is
- `height` - How tall the rectangle is

Key drawing functions:
- `SDL_RenderFillRect()` - Draws a filled rectangle
- `SDL_RenderRect()` - Draws just the outline of a rectangle
- `SDL_RenderLine()` - Draws a line between two points

## A Moving Rectangle

Let's put everything together and create an interactive program where you control a rectangle with the keyboard:

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

    // Create window and renderer
    SDL_Window *window = SDL_CreateWindow("Moving Rectangle", 800, 600, 0);
    SDL_Renderer *renderer = SDL_CreateRenderer(window, NULL);

    if (!window || !renderer) {
        printf("Failed to create window or renderer: %s\n", SDL_GetError());
        SDL_Quit();
        return 1;
    }

    // Player position (center of the rectangle)
    float playerX = 400.0f;
    float playerY = 300.0f;

    // How fast the player moves (pixels per second)
    float speed = 300.0f;

    // For calculating time between frames
    Uint64 lastTime = SDL_GetTicks();

    bool running = true;
    while (running) {
        // Calculate delta time (time since last frame in seconds)
        // This makes movement smooth regardless of frame rate
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

        // Get the current state of all keys
        // This is better for smooth movement than checking individual key events
        const bool *keys = SDL_GetKeyboardState(NULL);

        // Move based on which keys are held down
        if (keys[SDL_SCANCODE_W] || keys[SDL_SCANCODE_UP]) {
            playerY -= speed * deltaTime;  // Move up
        }
        if (keys[SDL_SCANCODE_S] || keys[SDL_SCANCODE_DOWN]) {
            playerY += speed * deltaTime;  // Move down
        }
        if (keys[SDL_SCANCODE_A] || keys[SDL_SCANCODE_LEFT]) {
            playerX -= speed * deltaTime;  // Move left
        }
        if (keys[SDL_SCANCODE_D] || keys[SDL_SCANCODE_RIGHT]) {
            playerX += speed * deltaTime;  // Move right
        }
        if (keys[SDL_SCANCODE_ESCAPE]) {
            running = false;  // Exit the game
        }

        // Clear the screen (dark gray background)
        SDL_SetRenderDrawColor(renderer, 30, 30, 30, 255);
        SDL_RenderClear(renderer);

        // Draw the player as a cyan rectangle
        SDL_SetRenderDrawColor(renderer, 0, 200, 255, 255);
        SDL_FRect player = {
            playerX - 25.0f,  // x (centered on playerX)
            playerY - 25.0f,  // y (centered on playerY)
            50.0f,            // width
            50.0f             // height
        };
        SDL_RenderFillRect(renderer, &player);

        // Show the frame
        SDL_RenderPresent(renderer);
    }

    // Clean up
    SDL_DestroyRenderer(renderer);
    SDL_DestroyWindow(window);
    SDL_Quit();

    return 0;
}
```

### Key Concepts in This Example

**Delta Time**: Games run at different speeds on different computers. By multiplying movement by `deltaTime` (time since last frame), the player moves the same distance per second regardless of frame rate.

**Continuous Input**: For smooth movement, we use `SDL_GetKeyboardState()` which returns an array of all keys and whether each is currently pressed. This is better than checking `SDL_EVENT_KEY_DOWN` events, which only fire once when a key is first pressed.

**The Game Loop Pattern**: Notice how our loop follows a clear structure:
1. Calculate timing
2. Handle events
3. Update game state (move player)
4. Draw everything
5. Present to screen

This pattern is the foundation of virtually every video game.

## What's Next?

You now understand the fundamentals of SDL3! Here are some ideas to explore:

- **Load Images** - Use SDL_image to display sprites and textures
- **Play Sounds** - Add audio with SDL_mixer
- **Display Text** - Render fonts with SDL_ttf
- **Add Boundaries** - Keep the player inside the window
- **Create Enemies** - Add other rectangles that move on their own
- **Collision Detection** - Make objects interact when they touch

## Resources

- [SDL3 Wiki](https://wiki.libsdl.org/SDL3) - Official documentation with detailed function references
- [SDL GitHub](https://github.com/libsdl-org/SDL) - Source code and example programs

Start simple, experiment with the code, and gradually build more complex projects. Game development is learned best by doing!
