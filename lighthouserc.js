module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run start', // Assumes a start script that serves the built app on port 5173
      url: [
        'http://localhost:5173/',
        'http://localhost:5173/insights',
        'http://localhost:5173/insights/the-ultimate-guide-to-mindful-eating', // Placeholder slug, ensure it exists for tests
        'http://localhost:5173/picks',
        'http://localhost:5173/picks/organic-ashwagandha-root-powder', // From fixtures
      ],
      numberOfRuns: 3,
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'uses-rel-preconnect': 'warn',
        'uses-responsive-images': 'warn',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
