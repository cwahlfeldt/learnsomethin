# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Astro-based personal learning hub for organizing tutorials and articles. It supports both standalone tutorials and multi-part tutorial series, with filtering, dark mode, and learning paths.

## Development Commands

```bash
# Start development server (localhost:4321)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture

### Content Collections

The project uses Astro Content Collections with Zod schemas defined in [src/content/config.ts](src/content/config.ts). There are two collections:

- **tutorials** - Individual tutorial files (.md or .mdx). Can be standalone or part of a series.
- **paths** - Learning path definitions that reference sequences of tutorials.

Tutorial files can be organized two ways:
1. **Standalone**: Single `.md`/`.mdx` file in `src/content/tutorials/`
2. **Series**: Directory in `src/content/tutorials/` containing `index.md` (seriesOrder: 0) and numbered parts

### Tutorial Schema

Required frontmatter fields:
- `title`, `description`, `category`, `difficulty` (beginner/intermediate/advanced)
- `status` (draft/in-progress/complete), `dateCreated`

Optional fields:
- `tags` (array), `series` (slug), `seriesOrder` (number)
- `dateUpdated`, `estimatedTime`

Drafts are filtered out in production builds via `getPublishedTutorials()` in [src/lib/tutorials.ts](src/lib/tutorials.ts).

### Helper Functions (src/lib/tutorials.ts)

Core data-fetching utilities:
- `getPublishedTutorials()` - Fetches all non-draft tutorials (in dev, shows all)
- `getOrganizedTutorials()` - Returns `{ standalone, series, categories, tags }`
  - Groups tutorials by series, calculates highest difficulty per series
  - Sorts standalone by date (newest first), series by seriesOrder
- `getSeriesTutorials(seriesSlug)` - Gets all tutorials in a specific series
- `getSeriesNavigation(tutorial)` - Returns prev/next/current index for series navigation

### Client-Side Filtering

[FilterBar.astro](src/components/FilterBar.astro) implements vanilla JS filtering on tutorial cards using data attributes:
- Cards have `data-category`, `data-difficulty`, `data-tags`, `data-title` attributes
- Filters show/hide cards by adding/removing `.hidden` class
- URL query params sync filter state for shareable URLs
- Search filters by title/description text matching

### Theming

Theme system uses CSS custom properties in [src/styles/global.css](src/styles/global.css):
- `[data-theme="light"]` and `[data-theme="dark"]` variants
- Theme toggle in [ThemeToggle.astro](src/components/ThemeToggle.astro) persists to localStorage
- Initialize theme on page load in BaseLayout script tag

### Layouts

- **BaseLayout** - Root HTML shell, includes Header/Footer, theme initialization
- **TutorialLayout** - For standalone tutorials, includes prose styling
- **SeriesLayout** - Extends TutorialLayout, adds SeriesNav component

### Dynamic Routes

- `src/pages/tutorials/[...slug].astro` - Renders individual tutorials using `getCollection()`
  - Chooses SeriesLayout if tutorial has series metadata, otherwise TutorialLayout
- `src/pages/paths/[slug].astro` - Renders learning path pages, resolves tutorial slugs to full entries

## MDX Support

`.mdx` files can import and use Astro components:
```mdx
import CodePlayground from '../../components/CodePlayground.astro';

<CodePlayground code={`console.log('example')`} />
```

See [javascript-arrays.mdx](src/content/tutorials/javascript-arrays.mdx) for examples.

## Adding New Content

### Standalone Tutorial
Create `src/content/tutorials/my-tutorial.md` with valid frontmatter. It will automatically appear in listings.

### Tutorial Series
1. Create directory `src/content/tutorials/my-series/`
2. Add `index.md` with `series: my-series` and `seriesOrder: 0`
3. Add parts with `seriesOrder: 1`, `2`, etc.

### Learning Path
Create `src/content/paths/my-path.md` with `tutorials` array containing tutorial slugs. For series, use the series slug (e.g., "rust-basics" not "rust-basics/01-installation").

## Code Style

- Use TypeScript for type safety (types are auto-generated from Zod schemas)
- Astro components for static markup, vanilla JS for client-side interactivity
- CSS custom properties for theming - avoid hardcoded colors
- Follow existing patterns in `src/lib/tutorials.ts` for content queries
