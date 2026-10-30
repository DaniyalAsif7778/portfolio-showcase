import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    restoreMocks: true,
    clearMocks: true,
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'src/pages/**/*.tsx',
        'src/components/ProjectVideoPreview.tsx',
        'src/components/ProjectVideoScrub.tsx',
        'src/components/SEO.tsx',
        'src/hooks/useSiteSettings.ts',
        'src/hooks/useSkills.ts',
        'src/lib/projectVideo.ts',
        'src/lib/featuredProjectContent.ts',
      ],
      exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/pages/GitHub.tsx'],
    },
  },
});
