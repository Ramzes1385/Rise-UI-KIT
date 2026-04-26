/**
 * Visual regression тесты для BaseBadge.
 */
import { expect, test } from '@playwright/test';
const COMPONENT = 'basebadge';
const STORIES = [
    'default',
    'primary',
    'secondary',
    'success',
    'warning',
    'error',
    'info',
    'small',
    'large',
    'dark-theme',
];
for (const story of STORIES) {
    test(`BaseBadge — ${story}`, async ({ page }) => {
        await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`);
        const root = page.locator('.base-badge');
        await expect(root).toHaveScreenshot(`base-badge--${story}.png`);
    });
}
//# sourceMappingURL=base-badge.visual.spec.js.map