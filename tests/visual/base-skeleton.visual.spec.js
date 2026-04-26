/**
 * Visual regression тесты для BaseSkeleton.
 */
import { expect, test } from '@playwright/test';
const COMPONENT = 'baseskeleton';
const STORIES = ['default', 'text', 'circle', 'no-animation', 'pulse', 'dark-theme'];
for (const story of STORIES) {
    test(`BaseSkeleton — ${story}`, async ({ page }) => {
        await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`);
        const root = page.locator('.base-skeleton');
        await expect(root).toHaveScreenshot(`base-skeleton--${story}.png`);
    });
}
//# sourceMappingURL=base-skeleton.visual.spec.js.map