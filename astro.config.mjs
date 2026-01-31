// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  site: 'https://your-domain.com',
  integrations: [mdx()],

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
