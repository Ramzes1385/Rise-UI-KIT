/**
 * Visual regression тесты для BaseCard.
 */
import { expect, test } from '@playwright/test';
const COMPONENT = 'basecard';
const STORIES = ['default', 'with-title', 'with-image', 'outline', 'ghost', 'hoverable', 'dark-theme'];
for (const story of STORIES) {
    test(`BaseCard — ${story}`, async ({ page }) => {
        await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`);
        const root = page.locator('.base-card');
        await expect(root).toHaveScreenshot(`base-card--${story}.png`);
    });
}
//# sourceMappingURL=base-card.visual.spec.js.map