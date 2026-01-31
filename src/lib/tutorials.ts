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
