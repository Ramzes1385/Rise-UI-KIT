/**
 * Visual regression тесты для BaseChat.
 */
import { expect, test } from '@playwright/test';
const COMPONENT = 'basechat';
const STORIES = ['default', 'modern', 'support', 'with-header', 'dark-theme'];
for (const story of STORIES) {
    test(`BaseChat — ${story}`, async ({ page }) => {
        await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`);
        const root = page.locator('.base-chat');
        await expect(root).toHaveScreenshot(`base-chat--${story}.png`);
    });
}
//# sourceMappingURL=base-chat.visual.spec.js.map