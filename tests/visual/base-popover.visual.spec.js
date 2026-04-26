/**
 * Visual regression тесты для BasePopover.
 */
import { expect, test } from '@playwright/test';
const COMPONENT = 'basepopover';
const STORIES = ['default', 'accent', 'dark', 'dark-theme'];
for (const story of STORIES) {
    test(`BasePopover — ${story}`, async ({ page }) => {
        await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`);
        const root = page.locator('.base-popover__trigger');
        await expect(root).toHaveScreenshot(`base-popover--${story}.png`);
    });
}
//# sourceMappingURL=base-popover.visual.spec.js.map