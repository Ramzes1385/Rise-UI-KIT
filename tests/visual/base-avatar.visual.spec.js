/**
 * Visual regression тесты для BaseAvatar.
 */
import { expect, test } from '@playwright/test';
const COMPONENT = 'baseavatar';
const STORIES = ['default', 'with-image', 'with-initials', 'square', 'bordered', 'sizes', 'dark-theme'];
for (const story of STORIES) {
    test(`BaseAvatar — ${story}`, async ({ page }) => {
        await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`);
        const root = page.locator('.base-avatar');
        await expect(root).toHaveScreenshot(`base-avatar--${story}.png`);
    });
}
//# sourceMappingURL=base-avatar.visual.spec.js.map