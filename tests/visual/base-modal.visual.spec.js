/**
 * Visual regression тесты для BaseModal.
 */
import { expect, test } from '@playwright/test';
const COMPONENT = 'basemodal';
const STORIES = ['default', 'small', 'large', 'confirm', 'form', 'dark-theme'];
for (const story of STORIES) {
    test(`BaseModal — ${story}`, async ({ page }) => {
        await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`);
        const root = page.locator('.base-modal');
        await expect(root).toHaveScreenshot(`base-modal--${story}.png`);
    });
}
//# sourceMappingURL=base-modal.visual.spec.js.map