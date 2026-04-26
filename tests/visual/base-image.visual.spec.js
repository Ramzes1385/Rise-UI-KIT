/**
 * Visual regression тесты для BaseImage.
 */
import { expect, test } from '@playwright/test';
const COMPONENT = 'baseimage';
const STORIES = ['default', 'cover', 'contain', 'rounded', 'placeholder', 'dark-theme'];
for (const story of STORIES) {
    test(`BaseImage — ${story}`, async ({ page }) => {
        await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`);
        const root = page.locator('.base-image');
        await expect(root).toHaveScreenshot(`base-image--${story}.png`);
    });
}
//# sourceMappingURL=base-image.visual.spec.js.map