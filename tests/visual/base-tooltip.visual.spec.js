/**
 * Visual regression тесты для BaseTooltip.
 */
import { expect, test } from '@playwright/test';
const COMPONENT = 'basetooltip';
const STORIES = ['default', 'top', 'bottom', 'left', 'right', 'always-visible', 'dark-theme'];
for (const story of STORIES) {
    test(`BaseTooltip — ${story}`, async ({ page }) => {
        await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`);
        const root = page.locator('.base-tooltip-wrapper');
        await expect(root).toHaveScreenshot(`base-tooltip--${story}.png`);
    });
}
//# sourceMappingURL=base-tooltip.visual.spec.js.map