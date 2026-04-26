/**
 * Visual regression тесты для BaseNotification.
 */
import { expect, test } from '@playwright/test';
const COMPONENT = 'basenotification';
const STORIES = ['default', 'success', 'error', 'warning', 'dark-theme'];
for (const story of STORIES) {
    test(`BaseNotification — ${story}`, async ({ page }) => {
        await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`);
        const root = page.locator('.base-notification');
        await expect(root).toHaveScreenshot(`base-notification--${story}.png`);
    });
}
//# sourceMappingURL=base-notification.visual.spec.js.map