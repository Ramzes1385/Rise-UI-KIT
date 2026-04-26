/**
 * Visual Regression тесты для BaseTextarea.
 * Снимают baseline-скриншоты ключевых состояний через Storybook.
 */
import { expect, test } from '@playwright/test';
/** Базовый путь к stories BaseTextarea в Storybook */
const STORY_PATH = '/iframe.html?id=ui-basetextarea';
test.describe('BaseTextarea visual regression', () => {
    test('Default: визуальный baseline', async ({ page }) => {
        await page.goto(`${STORY_PATH}--default`);
        await page.setViewportSize({ width: 800, height: 300 });
        await expect(page.locator('#storybook-root')).toHaveScreenshot('base-textarea-default.png', {
            animations: 'disabled',
            caret: 'hide',
            scale: 'css',
        });
    });
    test('WithError: визуальный baseline', async ({ page }) => {
        await page.goto(`${STORY_PATH}--with-error`);
        await page.setViewportSize({ width: 800, height: 300 });
        await expect(page.locator('#storybook-root')).toHaveScreenshot('base-textarea-error.png', {
            animations: 'disabled',
            caret: 'hide',
            scale: 'css',
        });
    });
    test('Disabled: визуальный baseline', async ({ page }) => {
        await page.goto(`${STORY_PATH}--disabled`);
        await page.setViewportSize({ width: 800, height: 300 });
        await expect(page.locator('#storybook-root')).toHaveScreenshot('base-textarea-disabled.png', {
            animations: 'disabled',
            caret: 'hide',
            scale: 'css',
        });
    });
    test('DarkTheme: визуальный baseline', async ({ page }) => {
        await page.goto(`${STORY_PATH}--dark-theme`);
        await page.setViewportSize({ width: 800, height: 300 });
        await expect(page.locator('#storybook-root')).toHaveScreenshot('base-textarea-dark.png', {
            animations: 'disabled',
            caret: 'hide',
            scale: 'css',
        });
    });
});
//# sourceMappingURL=base-textarea.visual.spec.js.map