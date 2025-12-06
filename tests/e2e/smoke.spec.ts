import { test, expect, devices } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { validateBreadcrumbs, validateArticleSchema, validateProductSchema } from './structured-data.helper';

// Use placeholder slugs that are likely to exist based on fixtures or common patterns
const ARTICLE_SLUG = 'the-ultimate-guide-to-mindful-eating'; // Placeholder, ensure an article with this slug exists for testing
const PRODUCT_SLUG = 'organic-ashwagandha-root-powder'; // From fixtures

test.describe('Accessibility Checks (Axe)', () => {
  test('Homepage should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/');
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Article page should not have any automatically detectable accessibility issues', async ({ page }) => {
    // This test requires an article with the specified slug to exist.
    await page.goto(`/insights/${ARTICLE_SLUG}`);
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Picks page should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/picks');
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe('Desktop Navigation', () => {
  test.use({ viewport: devices['Desktop Chrome'].viewport });

  test('should allow keyboard navigation through header links', async ({ page }) => {
    await page.goto('/');
    const insightsLink = page.getByRole('link', { name: 'Insights' });
    const picksLink = page.getByRole('link', { name: 'Our Picks' });
    const aboutLink = page.getByRole('link', { name: 'About' });
    const adminLink = page.getByRole('link', { name: 'Admin' });

    await page.keyboard.press('Tab'); // Focus logo
    await page.keyboard.press('Tab'); // Focus Insights
    await expect(insightsLink).toBeFocused();

    await page.keyboard.press('Tab'); // Focus Our Picks
    await expect(picksLink).toBeFocused();

    await page.keyboard.press('Tab'); // Focus About
    await expect(aboutLink).toBeFocused();

    await page.keyboard.press('Tab'); // Focus Search button
    await page.keyboard.press('Tab'); // Focus Admin button
    await expect(adminLink).toBeFocused();
  });
});

test.describe('Mobile Navigation', () => {
  test.use({ viewport: devices['Pixel 5'].viewport });

  test('should open and close the mobile drawer', async ({ page }) => {
    await page.goto('/');
    const menuButton = page.getByRole('button', { name: 'Open menu' });
    const drawer = page.getByRole('dialog');
    const insightsLink = drawer.getByRole('link', { name: 'Insights' });

    await expect(drawer).not.toBeVisible();
    await menuButton.click();
    await expect(drawer).toBeVisible();
    await expect(insightsLink).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(drawer).not.toBeVisible();
  });
});

test.describe('Article Page Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/insights/${ARTICLE_SLUG}`);
  });

  test('TOC links should jump to the correct section', async ({ page }) => {
    // This test assumes the article has a TOC and a heading with this text.
    const tocLink = page.getByRole('link', { name: 'Key Benefits' });
    const heading = page.getByRole('heading', { name: 'Key Benefits' });

    await tocLink.click();
    await expect(page).toHaveURL(new RegExp(`#key-benefits`));
    await expect(heading).toBeInViewport();
  });

  test('should have valid Article and BreadcrumbList structured data', async ({ page }) => {
    await validateArticleSchema(page);
    await validateBreadcrumbs(page);
  });
});

test.describe('Product Page Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/picks/${PRODUCT_SLUG}`);
  });

  test('Affiliate CTA should open in a new tab with correct rel attributes', async ({ page }) => {
    const affiliateLink = page.getByRole('link', { name: 'View on Amazon' });

    const newPagePromise = page.waitForEvent('popup');
    await affiliateLink.click();
    const newPage = await newPagePromise;

    await expect(newPage).not.toBeNull();
    expect(newPage.url()).toContain('amazon.co.uk');

    const rel = await affiliateLink.getAttribute('rel');
    expect(rel).toContain('nofollow');
    expect(rel).toContain('sponsored');
  });

  test('should have valid Product and BreadcrumbList structured data', async ({ page }) => {
    await validateProductSchema(page);
    await validateBreadcrumbs(page);
  });
});
