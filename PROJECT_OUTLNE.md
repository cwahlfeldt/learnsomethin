# Astro Personal Learning Hub - Build Specification

## Project Overview

Build an Astro-based personal learning hub for organizing tutorials and articles written in Markdown. The site serves as a structured knowledge base supporting both single-page tutorials and multi-page tutorial series, with a central dashboard for browsing and discovering content.

## Technical Stack

- **Framework**: Astro (latest stable)
- **Styling**: CSS with custom properties (variables) for theming, no CSS framework
- **Components**: Astro components (`.astro`) for static, vanilla JS for interactivity
- **Data**: Astro Content Collections with typed schemas
- **Search**: Pagefind (static search, integrates well with Astro)

## Directory Structure

```
learning-hub/
├── src/
│   ├── content/
│   │   ├── config.ts              # Content collection schemas
│   │   ├── tutorials/
│   │   │   ├── docker-basics.md   # Standalone tutorials
│   │   │   └── rust-basics/       # Series as subdirectories
│   │   │       ├── index.md
│   │   │       ├── 01-installation.md
│   │   │       └── 02-ownership.md
│   │   └── paths/
│   │       └── rust-developer.md  # Learning path definitions
│   │
│   ├── components/
│   │   ├── TutorialCard.astro
│   │   ├── SeriesCard.astro
│   │   ├── FilterBar.astro
│   │   ├── TutorialGrid.astro
│   │   ├── SeriesNav.astro
│   │   ├── DifficultyBadge.astro
│   │   ├── LearningPathCard.astro
│   │   ├── ThemeToggle.astro
│   │   ├── Header.astro
│   │   └── Footer.astro
│   │
│   ├── layouts/
│   │   ├── BaseLayout.astro       # HTML shell, theme, head
│   │   ├── TutorialLayout.astro   # Single tutorial page
│   │   └── SeriesLayout.astro     # Tutorial within a series
│   │
│   ├── pages/
│   │   ├── index.astro            # Landing page / Dashboard
│   │   ├── tutorials/
│   │   │   ├── index.astro        # Tutorial listing with filters
│   │   │   └── [...slug].astro    # Dynamic tutorial pages
│   │   └── paths/
│   │       ├── index.astro        # Learning paths listing
│   │       └── [slug].astro       # Individual path pages
│   │
│   ├── styles/
│   │   ├── global.css             # CSS variables, reset, base styles
│   │   └── components.css         # Shared component styles
│   │
│   └── lib/
│       └── tutorials.ts           # Helper functions for content queries
│
├── public/
│   └── images/
│
├── astro.config.mjs
├── package.json
└── README.md
```

## Content Collections Configuration

### /src/content/config.ts

Define typed schemas for all content collections:

```typescript
import { defineCollection, z, reference } from 'astro:content';

const tutorials = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
    tags: z.array(z.string()).default([]),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    status: z.enum(['draft', 'in-progress', 'complete']),
    series: z.string().optional(),
    seriesOrder: z.number().optional(),
    dateCreated: z.coerce.date(),
    dateUpdated: z.coerce.date().optional(),
    estimatedTime: z.string().optional(),
  }),
});

const paths = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tutorials: z.array(z.string()), // Array of tutorial slugs
    estimatedTime: z.string().optional(),
  }),
});

export const collections = { tutorials, paths };
```

## Frontmatter Schema

All tutorial markdown files use the following frontmatter (validated by Zod schema above):

```yaml
---
title: string              # Required: Display title
description: string        # Required: Short description for cards
category: string           # Required: Primary category (e.g., "programming", "devops")
tags: string[]             # Optional: Array of tags for filtering (defaults to [])
difficulty: string         # Required: "beginner" | "intermediate" | "advanced"
status: string             # Required: "draft" | "in-progress" | "complete"
series: string             # Optional: Series identifier slug
seriesOrder: number        # Optional: Position in series (1-indexed)
dateCreated: string        # Required: ISO date (YYYY-MM-DD)
dateUpdated: string        # Optional: ISO date of last update
estimatedTime: string      # Optional: Reading time (e.g., "15 min", "1 hour")
---
```

## Helper Functions

### /src/lib/tutorials.ts

Utility functions for querying and organizing tutorial content:

```typescript
import { getCollection, type CollectionEntry } from 'astro:content';

export type Tutorial = CollectionEntry<'tutorials'>;

export interface Series {
  slug: string;
  title: string;
  description: string;
  tutorials: Tutorial[];
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  totalTime?: string;
}

export interface TutorialData {
  standalone: Tutorial[];
  series: Series[];
  categories: string[];
  tags: string[];
}

// Get all published tutorials (filter out drafts in production)
export async function getPublishedTutorials(): Promise<Tutorial[]> {
  const tutorials = await getCollection('tutorials', ({ data }) => {
    return import.meta.env.PROD ? data.status !== 'draft' : true;
  });
  return tutorials;
}

// Get all unique categories from tutorials
export async function getCategories(): Promise<string[]> {
  const tutorials = await getPublishedTutorials();
  const categories = [...new Set(tutorials.map(t => t.data.category))];
  return categories.sort();
}

// Get all unique tags from tutorials
export async function getTags(): Promise<string[]> {
  const tutorials = await getPublishedTutorials();
  const tags = [...new Set(tutorials.flatMap(t => t.data.tags))];
  return tags.sort();
}

// Separate standalone tutorials from series, group series together
export async function getOrganizedTutorials(): Promise<TutorialData> {
  const tutorials = await getPublishedTutorials();
  
  const standalone = tutorials
    .filter(t => !t.data.series)
    .sort((a, b) => {
      const dateA = a.data.dateUpdated || a.data.dateCreated;
      const dateB = b.data.dateUpdated || b.data.dateCreated;
      return dateB.getTime() - dateA.getTime();
    });
  
  // Group series
  const seriesMap = new Map<string, Tutorial[]>();
  tutorials
    .filter(t => t.data.series)
    .forEach(t => {
      const seriesSlug = t.data.series!;
      if (!seriesMap.has(seriesSlug)) {
        seriesMap.set(seriesSlug, []);
      }
      seriesMap.get(seriesSlug)!.push(t);
    });
  
  const series: Series[] = [];
  for (const [slug, items] of seriesMap) {
    // Sort by seriesOrder
    items.sort((a, b) => (a.data.seriesOrder || 0) - (b.data.seriesOrder || 0));
    
    // Series index is the one with seriesOrder 0 or the first item
    const index = items.find(t => t.data.seriesOrder === 0) || items[0];
    
    // Calculate highest difficulty
    const difficulties = ['beginner', 'intermediate', 'advanced'] as const;
    const highestDifficulty = items.reduce((max, t) => {
      const current = difficulties.indexOf(t.data.difficulty);
      const maxIdx = difficulties.indexOf(max);
      return current > maxIdx ? t.data.difficulty : max;
    }, 'beginner' as const);
    
    series.push({
      slug,
      title: index.data.title,
      description: index.data.description,
      tutorials: items,
      category: index.data.category,
      difficulty: highestDifficulty,
    });
  }
  
  const categories = [...new Set(tutorials.map(t => t.data.category))].sort();
  const tags = [...new Set(tutorials.flatMap(t => t.data.tags))].sort();
  
  return { standalone, series, categories, tags };
}

// Get tutorials in a specific series
export async function getSeriesTutorials(seriesSlug: string): Promise<Tutorial[]> {
  const tutorials = await getPublishedTutorials();
  return tutorials
    .filter(t => t.data.series === seriesSlug)
    .sort((a, b) => (a.data.seriesOrder || 0) - (b.data.seriesOrder || 0));
}

// Get prev/next tutorials in a series
export async function getSeriesNavigation(tutorial: Tutorial) {
  if (!tutorial.data.series) return null;
  
  const seriesTutorials = await getSeriesTutorials(tutorial.data.series);
  const currentIndex = seriesTutorials.findIndex(t => t.slug === tutorial.slug);
  
  return {
    series: seriesTutorials,
    current: currentIndex,
    prev: currentIndex > 0 ? seriesTutorials[currentIndex - 1] : null,
    next: currentIndex < seriesTutorials.length - 1 ? seriesTutorials[currentIndex + 1] : null,
  };
}
```

## Component Specifications

All components are Astro components (`.astro`). For client-side interactivity (filtering), use vanilla JavaScript with `<script>` tags or inline scripts.

### TutorialCard.astro

Displays a single standalone tutorial in a card format.

**Props:**
```typescript
interface Props {
  tutorial: CollectionEntry<'tutorials'>;
}
```

**Display:**
- Title (linked to tutorial)
- Description (truncated to 2 lines via CSS)
- Category badge
- Difficulty badge (color-coded)
- Tags (show first 3, "+N more" if needed)
- Estimated time (if present)
- Status indicator (subtle, for draft/in-progress)

**Styling:**
- Card with subtle border and hover elevation
- Use CSS variables for colors to support theming
- Responsive: full width on mobile, grid item on desktop

### SeriesCard.astro

Displays a multi-part tutorial series as a cohesive card.

**Props:**
```typescript
interface Props {
  series: Series;
}
```

**Display:**
- Series title (linked to series index)
- Series description
- Number of parts (e.g., "5-part series")
- Category badge
- Difficulty badge (highest in series)
- Total estimated time
- Visual indicator that it's a series (icon or label)
- List first 3 part titles with subtle styling

**Styling:**
- Slightly larger/more prominent than TutorialCard
- Visual distinction indicating it's a series (border style, icon, or background)

### FilterBar.astro

Provides filtering controls for the tutorial listing. Uses client-side JavaScript for interactivity.

**Props:**
```typescript
interface Props {
  categories: string[];
  tags: string[];
}
```

**Display:**
- Category dropdown/select
- Difficulty dropdown (Beginner, Intermediate, Advanced, All)
- Tag multi-select or clickable tag chips
- Search input field
- Clear filters button (shown when filters active)

**Client-side Behavior (vanilla JS):**
- Filter cards by showing/hiding based on data attributes
- Update URL query params for shareable filter states
- Show active filter count
- Dispatch custom events for filter changes

**Implementation Notes:**
- Add data attributes to cards: `data-category`, `data-difficulty`, `data-tags`, `data-title`
- FilterBar script listens to input changes and filters `.tutorial-card` elements
- Use CSS classes like `.hidden` to show/hide cards

### TutorialGrid.astro

Container for rendering a grid of tutorial and series cards.

**Props:**
```typescript
interface Props {
  tutorials: CollectionEntry<'tutorials'>[];
  series: Series[];
}
```

**Display:**
- Mixed grid of TutorialCard and SeriesCard components
- Results count (e.g., "Showing 12 tutorials")
- Empty state when no results match filters

**Markup:**
- Wrap each card in a container with data attributes for filtering
- Include a `<div id="empty-state">` that shows when all cards are hidden

### SeriesNav.astro

Previous/next navigation for tutorials within a series.

**Props:**
```typescript
interface Props {
  seriesSlug: string;
  tutorials: CollectionEntry<'tutorials'>[];
  currentIndex: number;
}
```

**Display:**
- Previous tutorial link (if not first)
- Series overview link (center)
- Next tutorial link (if not last)
- Progress indicator (e.g., "Part 2 of 5")

**Styling:**
- Full-width bar at bottom of tutorial content
- Clear visual hierarchy
- Mobile-friendly touch targets

### DifficultyBadge.astro

Reusable badge component for difficulty levels.

**Props:**
```typescript
interface Props {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  size?: 'sm' | 'md';
}
```

**Display:**
- Beginner: Green background
- Intermediate: Yellow/amber background
- Advanced: Red/orange background
- Text label

**Styling:**
- Use CSS variables for colors
- Pill/rounded rectangle shape
- Size variants via CSS class

### LearningPathCard.astro

Displays a curated learning path.

**Props:**
```typescript
interface Props {
  path: CollectionEntry<'paths'>;
  tutorialCount: number;
}
```

**Display:**
- Path title and description
- Number of tutorials in path
- Total estimated time
- Visual connector/timeline aesthetic

### ThemeToggle.astro

Dark/light mode toggle button.

**Display:**
- Sun/moon icon button
- Toggles `data-theme` attribute on `<html>` element

**Client-side Behavior:**
- Check `localStorage` for saved preference
- Check `prefers-color-scheme` as fallback
- Persist choice to `localStorage`
- Toggle between light/dark themes

### Header.astro

Site header with navigation.

**Display:**
- Site title/logo (links to home)
- Navigation links: Home, Tutorials, Paths
- Theme toggle
- Mobile hamburger menu (if needed)

### Footer.astro

Site footer.

**Display:**
- Copyright or attribution
- Optional links

## Learning Paths Implementation

Learning paths are curated sequences defined in markdown files in `/src/content/paths/`.

### Path Frontmatter Schema

```yaml
---
title: "Rust Fundamentals to Systems Programming"
description: "A guided path from Rust basics to building system tools"
tutorials:
  - rust-basics           # References tutorial slugs
  - rust-error-handling
  - rust-cli-tools
estimatedTime: "8 hours"
---
```

The markdown body can contain additional context, prerequisites, or learning objectives.

### Path Page Implementation

The `/src/pages/paths/[slug].astro` page will:
1. Fetch the path content
2. Resolve tutorial slugs to full tutorial entries
3. Display path overview with linked tutorial list
4. Show aggregate stats (total time, difficulty range)

## Layouts

### BaseLayout.astro

The root layout wrapping all pages.

```astro
---
interface Props {
  title: string;
  description?: string;
}

const { title, description = 'Personal learning hub' } = Astro.props;
---

<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content={description}>
  <title>{title} | Learning Hub</title>
  <link rel="stylesheet" href="/src/styles/global.css">
</head>
<body>
  <Header />
  <main>
    <slot />
  </main>
  <Footer />
  
  <script>
    // Theme initialization
    const theme = localStorage.getItem('theme') || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  </script>
</body>
</html>
```

### TutorialLayout.astro

Layout for standalone tutorial pages.

**Includes:**
- BaseLayout wrapper
- Article container with prose styling
- Optional table of contents (via Astro's `getHeadings()`)
- Tutorial metadata display (date, reading time, tags)

### SeriesLayout.astro

Layout for tutorials that are part of a series.

**Includes:**
- Everything from TutorialLayout
- SeriesNav component at bottom
- Series sidebar or header showing position in series

## Global Styles

### /src/styles/global.css

```css
/* Reset */
*, *::before, *::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;
  line-height: 1.6;
}

/* Theme Variables */
:root,
[data-theme="light"] {
  /* Colors */
  --color-bg: #ffffff;
  --color-bg-soft: #f8f9fa;
  --color-bg-muted: #f1f3f4;
  --color-text: #1a1a1a;
  --color-text-soft: #4a4a4a;
  --color-text-muted: #6b7280;
  --color-border: #e5e7eb;
  --color-border-soft: #f0f0f0;
  
  /* Brand */
  --color-primary: #3b82f6;
  --color-primary-soft: #dbeafe;
  
  /* Difficulty badges */
  --color-beginner: #10b981;
  --color-beginner-bg: #d1fae5;
  --color-intermediate: #f59e0b;
  --color-intermediate-bg: #fef3c7;
  --color-advanced: #ef4444;
  --color-advanced-bg: #fee2e2;
  
  /* Category colors */
  --color-cat-programming: #8b5cf6;
  --color-cat-devops: #06b6d4;
  --color-cat-webdev: #ec4899;
  --color-cat-systems: #f97316;
  --color-cat-gamedev: #84cc16;
  
  /* Cards */
  --card-bg: var(--color-bg);
  --card-border: var(--color-border);
  --card-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  --card-shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.12);
  --card-radius: 8px;
  
  /* Layout */
  --content-width: 1200px;
  --content-padding: 1.5rem;
}

[data-theme="dark"] {
  --color-bg: #0f0f0f;
  --color-bg-soft: #1a1a1a;
  --color-bg-muted: #262626;
  --color-text: #f5f5f5;
  --color-text-soft: #d4d4d4;
  --color-text-muted: #a3a3a3;
  --color-border: #333333;
  --color-border-soft: #262626;
  
  --color-primary: #60a5fa;
  --color-primary-soft: #1e3a5f;
  
  --color-beginner-bg: #064e3b;
  --color-intermediate-bg: #78350f;
  --color-advanced-bg: #7f1d1d;
  
  --card-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  --card-shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.4);
}

body {
  background: var(--color-bg);
  color: var(--color-text);
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
  line-height: 1.3;
  font-weight: 600;
}

a {
  color: var(--color-primary);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

/* Utility Classes */
.container {
  max-width: var(--content-width);
  margin: 0 auto;
  padding: 0 var(--content-padding);
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}

/* Card Grid */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

/* Prose Styling for Tutorial Content */
.prose {
  max-width: 72ch;
}

.prose h2 {
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.prose h3 {
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.prose p {
  margin-bottom: 1rem;
}

.prose pre {
  background: var(--color-bg-soft);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 1rem;
  overflow-x: auto;
}

.prose code {
  font-family: ui-monospace, monospace;
  font-size: 0.9em;
}

.prose :not(pre) > code {
  background: var(--color-bg-muted);
  padding: 0.2em 0.4em;
  border-radius: 3px;
}

/* Filter transitions */
.tutorial-card {
  transition: opacity 0.2s ease;
}

.tutorial-card.hidden {
  display: none;
}
```

## Page Implementations

### /src/pages/index.astro (Landing Page)

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import TutorialCard from '../components/TutorialCard.astro';
import SeriesCard from '../components/SeriesCard.astro';
import { getOrganizedTutorials } from '../lib/tutorials';

const { standalone, series } = await getOrganizedTutorials();

// Get 6 most recent items (mix of standalone and series)
const recentStandalone = standalone.slice(0, 4);
const recentSeries = series.slice(0, 2);
---

<BaseLayout title="Home">
  <section class="hero">
    <div class="container">
      <h1>Learning Hub</h1>
      <p class="hero-tagline">Personal tutorials and knowledge base</p>
      <div class="hero-actions">
        <a href="/tutorials/" class="btn btn-primary">Browse Tutorials</a>
        <a href="/paths/" class="btn btn-secondary">Learning Paths</a>
      </div>
    </div>
  </section>
  
  <section class="recent container">
    <h2>Recent Tutorials</h2>
    <div class="card-grid">
      {recentSeries.map(s => <SeriesCard series={s} />)}
      {recentStandalone.map(t => <TutorialCard tutorial={t} />)}
    </div>
    <p class="view-all">
      <a href="/tutorials/">View all tutorials →</a>
    </p>
  </section>
</BaseLayout>

<style>
  .hero {
    padding: 4rem 0;
    text-align: center;
    background: var(--color-bg-soft);
    border-bottom: 1px solid var(--color-border);
  }
  
  .hero h1 {
    font-size: 2.5rem;
    margin: 0 0 0.5rem;
  }
  
  .hero-tagline {
    color: var(--color-text-soft);
    font-size: 1.25rem;
    margin: 0 0 2rem;
  }
  
  .hero-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .btn {
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    font-weight: 500;
    text-decoration: none;
  }
  
  .btn-primary {
    background: var(--color-primary);
    color: white;
  }
  
  .btn-secondary {
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    color: var(--color-text);
  }
  
  .recent {
    padding: 3rem 0;
  }
  
  .recent h2 {
    margin: 0 0 1.5rem;
  }
  
  .view-all {
    margin-top: 1.5rem;
    text-align: center;
  }
</style>
```

### /src/pages/tutorials/index.astro (Tutorial Listing)

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import FilterBar from '../../components/FilterBar.astro';
import TutorialGrid from '../../components/TutorialGrid.astro';
import { getOrganizedTutorials } from '../../lib/tutorials';

const { standalone, series, categories, tags } = await getOrganizedTutorials();
---

<BaseLayout title="Tutorials">
  <div class="container page-content">
    <h1>Tutorials</h1>
    
    <FilterBar categories={categories} tags={tags} />
    
    <TutorialGrid tutorials={standalone} series={series} />
  </div>
</BaseLayout>

<style>
  .page-content {
    padding: 2rem 0 4rem;
  }
  
  h1 {
    margin: 0 0 1.5rem;
  }
</style>
```

### /src/pages/tutorials/[...slug].astro (Dynamic Tutorial Pages)

```astro
---
import { getCollection, render } from 'astro:content';
import TutorialLayout from '../../layouts/TutorialLayout.astro';
import SeriesLayout from '../../layouts/SeriesLayout.astro';
import { getSeriesNavigation } from '../../lib/tutorials';

export async function getStaticPaths() {
  const tutorials = await getCollection('tutorials');
  return tutorials.map(tutorial => ({
    params: { slug: tutorial.slug },
    props: { tutorial },
  }));
}

const { tutorial } = Astro.props;
const { Content, headings } = await render(tutorial);

const seriesNav = await getSeriesNavigation(tutorial);
const Layout = seriesNav ? SeriesLayout : TutorialLayout;
---

<Layout 
  title={tutorial.data.title} 
  tutorial={tutorial}
  headings={headings}
  seriesNav={seriesNav}
>
  <Content />
</Layout>
```

### /src/pages/paths/index.astro (Learning Paths Listing)

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import LearningPathCard from '../../components/LearningPathCard.astro';
import { getCollection } from 'astro:content';

const paths = await getCollection('paths');
---

<BaseLayout title="Learning Paths">
  <div class="container page-content">
    <h1>Learning Paths</h1>
    <p class="page-description">Curated sequences of tutorials for structured learning.</p>
    
    <div class="paths-grid">
      {paths.map(path => (
        <LearningPathCard path={path} tutorialCount={path.data.tutorials.length} />
      ))}
    </div>
  </div>
</BaseLayout>

<style>
  .page-content {
    padding: 2rem 0 4rem;
  }
  
  h1 {
    margin: 0 0 0.5rem;
  }
  
  .page-description {
    color: var(--color-text-soft);
    margin: 0 0 2rem;
  }
  
  .paths-grid {
    display: grid;
    gap: 1.5rem;
  }
</style>
```

### /src/pages/paths/[slug].astro (Individual Path Page)

```astro
---
import { getCollection, render } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import TutorialCard from '../../components/TutorialCard.astro';

export async function getStaticPaths() {
  const paths = await getCollection('paths');
  return paths.map(path => ({
    params: { slug: path.slug },
    props: { path },
  }));
}

const { path } = Astro.props;
const { Content } = await render(path);

// Resolve tutorial slugs to full entries
const allTutorials = await getCollection('tutorials');
const pathTutorials = path.data.tutorials
  .map(slug => allTutorials.find(t => t.slug === slug || t.slug.startsWith(slug)))
  .filter(Boolean);
---

<BaseLayout title={path.data.title}>
  <div class="container page-content">
    <header class="path-header">
      <a href="/paths/" class="back-link">← Learning Paths</a>
      <h1>{path.data.title}</h1>
      <p class="path-description">{path.data.description}</p>
      <div class="path-meta">
        <span>{pathTutorials.length} tutorials</span>
        {path.data.estimatedTime && <span>• {path.data.estimatedTime}</span>}
      </div>
    </header>
    
    <div class="path-content prose">
      <Content />
    </div>
    
    <section class="path-tutorials">
      <h2>Tutorials in this path</h2>
      <ol class="tutorial-list">
        {pathTutorials.map((tutorial, index) => (
          <li>
            <span class="step-number">{index + 1}</span>
            <TutorialCard tutorial={tutorial} />
          </li>
        ))}
      </ol>
    </section>
  </div>
</BaseLayout>

<style>
  .page-content {
    padding: 2rem 0 4rem;
  }
  
  .back-link {
    font-size: 0.9rem;
    color: var(--color-text-muted);
  }
  
  .path-header {
    margin-bottom: 2rem;
  }
  
  .path-header h1 {
    margin: 0.5rem 0;
  }
  
  .path-description {
    font-size: 1.125rem;
    color: var(--color-text-soft);
    margin: 0 0 0.75rem;
  }
  
  .path-meta {
    color: var(--color-text-muted);
    font-size: 0.9rem;
  }
  
  .path-content {
    margin-bottom: 3rem;
  }
  
  .tutorial-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .tutorial-list li {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .step-number {
    flex-shrink: 0;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background: var(--color-primary);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 0.875rem;
  }
</style>
```

## Astro Configuration

### /astro.config.mjs

```javascript
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://your-domain.com', // Update when deploying
  
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
    },
  },
  
  vite: {
    css: {
      devSourcemap: true,
    },
  },
});
```

### /package.json

```json
{
  "name": "learning-hub",
  "type": "module",
  "version": "0.0.1",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro"
  },
  "dependencies": {
    "astro": "^5.0.0"
  }
}
```

### /tsconfig.json

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

## Sample Content for Testing

Create sample content to test all features:

### Sample Standalone Tutorial

`/src/content/tutorials/docker-basics.md`:

```markdown
---
title: Docker Basics for Developers
description: Get started with Docker containers for local development
category: devops
tags: ["docker", "containers", "development"]
difficulty: beginner
status: complete
dateCreated: 2025-01-15
estimatedTime: "20 min"
---

# Docker Basics for Developers

Tutorial content here...
```

### Sample Series

`/src/content/tutorials/rust-basics/index.md`:

```markdown
---
title: Rust Programming Basics
description: Learn Rust from the ground up with this comprehensive series
category: programming
tags: ["rust", "systems", "memory"]
difficulty: beginner
status: complete
series: rust-basics
seriesOrder: 0
dateCreated: 2025-01-10
estimatedTime: "5 min"
---

# Rust Programming Basics

Series overview and introduction...

## What You'll Learn

- Installation and setup
- Ownership and borrowing
- Structs and enums
```

`/src/content/tutorials/rust-basics/01-installation.md`:

```markdown
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

Content here...
```

`/src/content/tutorials/rust-basics/02-ownership.md`:

```markdown
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

Content here...
```

### Sample Learning Path

`/src/content/paths/rust-developer.md`:

```markdown
---
title: Become a Rust Developer
description: From zero to productive Rust developer
tutorials:
  - rust-basics
  - rust-error-handling
  - rust-cli-tools
estimatedTime: "10 hours"
---

# Become a Rust Developer

This learning path takes you from...

## Prerequisites

- Basic programming knowledge
- Command line familiarity

## What You'll Build

By the end of this path, you'll have built...
```

## Visual Design Guidelines

### Card Design

- Clean, minimal cards with subtle shadows
- Rounded corners (8px)
- Hover state: slight elevation increase, subtle border color change
- Content padding: 1.25rem
- Clear visual hierarchy: title > description > metadata

### Grid Layout

- Desktop: 3-column grid for cards
- Tablet: 2-column grid
- Mobile: Single column
- Gap: 1.5rem

### Typography

- Use VitePress default typography scale
- Tutorial titles: font-weight 600
- Descriptions: slightly muted color (use --vp-c-text-2)
- Metadata: smaller size, muted (use --vp-c-text-3)

### Color Usage

- Difficulty badges: distinct colors as specified
- Category badges: softer colors, can be auto-generated or mapped
- Status indicators: subtle (draft = dashed border, in-progress = dot indicator)
- Maintain dark mode compatibility with all colors

### Interactive States

- All clickable elements need hover states
- Focus states for accessibility
- Smooth transitions (150-200ms)

## Search Integration (Pagefind)

Add static search using Pagefind after build:

### Installation

```bash
npm install -D @pagefind/default-ui
```

### Integration

Add to build script in `package.json`:

```json
{
  "scripts": {
    "build": "astro build && npx pagefind --site dist",
    "postbuild": "npx pagefind --site dist"
  }
}
```

### Search Component

Create `/src/components/Search.astro`:

```astro
---
// Search component using Pagefind
---

<div id="search"></div>

<script>
  import { PagefindUI } from '@pagefind/default-ui';
  
  window.addEventListener('DOMContentLoaded', () => {
    new PagefindUI({
      element: '#search',
      showSubResults: true,
    });
  });
</script>

<style is:global>
  /* Customize Pagefind UI to match theme */
  :root {
    --pagefind-ui-scale: 0.9;
    --pagefind-ui-primary: var(--color-primary);
    --pagefind-ui-text: var(--color-text);
    --pagefind-ui-background: var(--color-bg);
    --pagefind-ui-border: var(--color-border);
  }
</style>
```

Add search to Header component.

## Build and Development Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Implementation Order

1. Initialize Astro project (`npm create astro@latest`)
2. Create directory structure
3. Set up content collections in `/src/content/config.ts`
4. Create helper functions in `/src/lib/tutorials.ts`
5. Build BaseLayout with theme toggle
6. Build DifficultyBadge component (simplest, used by others)
7. Build TutorialCard component
8. Build SeriesCard component
9. Build TutorialGrid component
10. Build FilterBar component with client-side JS
11. Build SeriesNav component
12. Build LearningPathCard component
13. Create TutorialLayout and SeriesLayout
14. Create all page routes
15. Add sample content
16. Refine styling and dark mode
17. Integrate Pagefind for search
18. Test all filtering and navigation

## Success Criteria

- [ ] Site builds without errors (`npm run build`)
- [ ] Landing page displays with recent tutorials
- [ ] Tutorial listing shows all content with working filters
- [ ] Client-side filtering updates URL params
- [ ] Series are grouped and display correctly
- [ ] Series navigation works within multi-part tutorials
- [ ] Learning paths display and link to correct tutorials
- [ ] Dark mode toggle works and persists preference
- [ ] Mobile responsive layout works
- [ ] Pagefind search finds tutorials
- [ ] Adding new markdown files automatically appears in listings
- [ ] Draft tutorials hidden in production builds
- [ ] TypeScript content schemas catch invalid frontmatter

## Key Differences from VitePress Approach

| Aspect | VitePress | Astro |
|--------|-----------|-------|
| Content handling | `createContentLoader` | Content Collections with Zod schemas |
| Components | Vue SFCs | Astro components (or Vue/React if needed) |
| Interactivity | Vue reactive by default | Islands architecture, explicit client JS |
| Filtering | Vue reactivity | Vanilla JS, data attributes |
| Search | Built-in local search | Pagefind (post-build) |
| Theming | Extend default theme | Full control, CSS variables |
| Type safety | Manual types | Zod schemas, auto-generated types |

The Astro approach gives you more control and better type safety for content, but requires more explicit handling of interactivity since it's static-first.