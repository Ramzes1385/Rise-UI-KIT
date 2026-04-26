/**
 * Visual regression тесты для BaseSlideover.
 */
import { expect, test } from '@playwright/test';
const COMPONENT = 'baseslideover';
const STORIES = ['default', 'left', 'large', 'with-footer', 'dark-theme'];
for (const story of STORIES) {
    test(`BaseSlideover — ${story}`, async ({ page }) => {
        await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`);
        const root = page.locator('.base-slideover');
        await expect(root).toHaveScreenshot(`base-slideover--${story}.png`);
    });
}
//# sourceMappingURL=base-slideover.visual.spec.js.map