# Learning Hub

A personal learning hub built with Astro for organizing tutorials and articles written in Markdown. The site serves as a structured knowledge base supporting both single-page tutorials and multi-page tutorial series.

## Features

- **Tutorial Management** - Organize standalone tutorials and multi-part series
- **Learning Paths** - Curated sequences of tutorials for structured learning
- **MDX Support** - Use components and JSX in your tutorials
- **Interactive Components** - Live code playgrounds and interactive examples
- **Content Collections** - Type-safe content with Zod schemas
- **Advanced Filtering** - Filter by category, difficulty, tags, and search
- **Dark Mode** - Full theme support with persistent preferences
- **Responsive Design** - Mobile-first, works on all devices
- **SEO Friendly** - Proper meta tags and semantic HTML

## Project Structure

```
learning-hub/
├── src/
│   ├── content/
│   │   ├── config.ts              # Content collection schemas
│   │   ├── tutorials/             # Tutorial markdown files
│   │   │   ├── docker-basics.md   # Standalone tutorials
│   │   │   └── rust-basics/       # Series as subdirectories
│   │   │       ├── index.md
│   │   │       ├── 01-installation.md
│   │   │       └── 02-ownership.md
│   │   └── paths/
│   │       └── rust-developer.md  # Learning path definitions
│   │
│   ├── components/               # Astro components
│   │   ├── TutorialCard.astro
│   │   ├── SeriesCard.astro
│   │   ├── FilterBar.astro
│   │   └── ...
│   │
│   ├── layouts/                  # Page layouts
│   │   ├── BaseLayout.astro
│   │   ├── TutorialLayout.astro
│   │   └── SeriesLayout.astro
│   │
│   ├── pages/                    # Route pages
│   │   ├── index.astro
│   │   ├── tutorials/
│   │   └── paths/
│   │
│   ├── styles/                   # Global styles
│   │   └── global.css
│   │
│   └── lib/                      # Helper functions
│       └── tutorials.ts
│
└── public/                       # Static assets
```

## Commands

| Command | Action |
| :------------------------ | :----------------------------------------------- |
| `npm install` | Installs dependencies |
| `npm run dev` | Starts local dev server at `localhost:4321` |
| `npm run build` | Build your production site to `./dist/` |
| `npm run preview` | Preview your build locally, before deploying |

## Adding Content

### Create a Standalone Tutorial

Create a new `.md` or `.mdx` file in `src/content/tutorials/`:

**Markdown (.md):**
```markdown
---
title: Your Tutorial Title
description: Brief description
category: programming
tags: ["tag1", "tag2"]
difficulty: beginner
status: complete
dateCreated: 2025-01-31
estimatedTime: "15 min"
---

# Your Tutorial Title

Your content here...
```

**MDX (.mdx) with interactive components:**
```mdx
---
title: Interactive Tutorial
description: Tutorial with live examples
category: programming
tags: ["javascript", "interactive"]
difficulty: intermediate
status: complete
dateCreated: 2025-01-31
estimatedTime: "20 min"
---

import CodePlayground from '../../components/CodePlayground.astro';

# Interactive Tutorial

Try this live example:

<CodePlayground code={`console.log('Hello, world!');`} />
```

### Create a Tutorial Series

1. Create a directory in `src/content/tutorials/` (e.g., `my-series/`)
2. Create an `index.md` with `seriesOrder: 0`
3. Add additional parts with `seriesOrder: 1`, `2`, etc.

Each file should include:
```yaml
series: my-series
seriesOrder: 0  # or 1, 2, 3...
```

### Create a Learning Path

Create a `.md` file in `src/content/paths/`:

```markdown
---
title: Path Title
description: Path description
tutorials:
  - tutorial-slug-1
  - tutorial-slug-2
estimatedTime: "5 hours"
---

# Path Title

Additional path content...
```

## Content Schema

All tutorials use this frontmatter schema (enforced by Zod):

- `title` (required): Display title
- `description` (required): Short description for cards
- `category` (required): Primary category
- `tags` (optional): Array of tags for filtering
- `difficulty` (required): "beginner" | "intermediate" | "advanced"
- `status` (required): "draft" | "in-progress" | "complete"
- `series` (optional): Series identifier slug
- `seriesOrder` (optional): Position in series (0-indexed)
- `dateCreated` (required): ISO date (YYYY-MM-DD)
- `dateUpdated` (optional): ISO date of last update
- `estimatedTime` (optional): Reading time (e.g., "15 min")

## Features in Detail

### Filtering

The tutorials page includes:
- Category dropdown filter
- Difficulty level filter
- Full-text search
- Tag chips for multi-select filtering
- URL params for shareable filter states

### Series Navigation

Tutorials in a series include:
- Previous/Next navigation
- Series progress indicator
- Link to series overview
- Visual distinction from standalone tutorials

### Dark Mode

Theme toggle with:
- Respects system preferences
- Persists user choice to localStorage
- Smooth transitions between themes
- Custom CSS variables for easy theming

## Tech Stack

- **Astro** - Static site generator
- **MDX** - Markdown with JSX components
- **TypeScript** - Type safety
- **CSS Custom Properties** - Theming
- **Content Collections** - Type-safe content with Zod
- **Vanilla JavaScript** - Client-side interactivity

## Interactive Components

### CodePlayground

The `CodePlayground` component allows you to create interactive, executable code examples in your tutorials:

```mdx
import CodePlayground from '../../components/CodePlayground.astro';

<CodePlayground code={`
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log(doubled);
`} />
```

Features:
- Live code execution in the browser
- Console.log output capture
- Error handling and display
- Syntax highlighting
- Clear output button

See [javascript-arrays.mdx](src/content/tutorials/javascript-arrays.mdx) for examples.

## Using MDX

MDX files (`.mdx`) support all standard Markdown syntax plus:

1. **Import Components:**
   ```mdx
   import MyComponent from '../../components/MyComponent.astro';
   ```

2. **Use Components Inline:**
   ```mdx
   <MyComponent prop="value" />
   ```

3. **JavaScript Expressions:**
   ```mdx
   The year is {new Date().getFullYear()}
   ```

4. **HTML with Styling:**
   ```mdx
   <div style="padding: 1rem; background: var(--color-bg-soft);">
     Custom content here
   </div>
   ```

See [mdx-example.mdx](src/content/tutorials/mdx-example.mdx) for more examples.

## License

MIT
