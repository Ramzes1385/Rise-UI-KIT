/**
 * Visual regression тесты для BaseAnimation.
 */
import { expect, test } from '@playwright/test';
const COMPONENT = 'baseanimation';
const STORIES = ['default', 'fade', 'slide-up', 'scale', 'dark-theme'];
for (const story of STORIES) {
    test(`BaseAnimation — ${story}`, async ({ page }) => {
        await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`);
        const root = page.locator('.base-animation');
        await expect(root).toHaveScreenshot(`base-animation--${story}.png`);
    });
}
//# sourceMappingURL=base-animation.visual.spec.js.map