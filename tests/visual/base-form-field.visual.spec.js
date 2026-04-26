/**
 * Visual regression тесты для BaseFormField.
 */
import { expect, test } from '@playwright/test';
const COMPONENT = 'baseformfield';
const STORIES = ['default', 'with-label', 'with-description', 'with-error', 'required', 'dark-theme'];
for (const story of STORIES) {
    test(`BaseFormField — ${story}`, async ({ page }) => {
        await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`);
        const root = page.locator('.base-form-field');
        await expect(root).toHaveScreenshot(`base-form-field--${story}.png`);
    });
}
//# sourceMappingURL=base-form-field.visual.spec.js.map