/**
 * Visual Regression тесты для BaseButton.
 * Снимают baseline-скриншоты ключевых состояний через Storybook.
 */
import { expect, test } from '@playwright/test';
/** Базовый путь к stories BaseButton в Storybook */
const STORY_PATH = '/iframe.html?id=ui-basebutton';
test.describe('BaseButton visual regression', () => {
    test('Default: визуальный baseline', async ({ page }) => {
        await page.goto(`${STORY_PATH}--default`);
        await page.setViewportSize({ width: 800, height: 200 });
        await expect(page.locator('#storybook-root')).toHaveScreenshot('base-button-default.png', {
            animations: 'disabled',
            caret: 'hide',
            scale: 'css',
        });
    });
    test('Variants: визуальный baseline', async ({ page }) => {
        await page.goto(`${STORY_PATH}--variants`);
        await page.setViewportSize({ width: 800, height: 200 });
        await expect(page.locator('#storybook-root')).toHaveScreenshot('base-button-variants.png', {
            animations: 'disabled',
            caret: 'hide',
            scale: 'css',
        });
    });
    test('Disabled: визуальный baseline', async ({ page }) => {
        await page.goto(`${STORY_PATH}--disabled`);
        await page.setViewportSize({ width: 800, height: 200 });
        await expect(page.locator('#storybook-root')).toHaveScreenshot('base-button-disabled.png', {
            animations: 'disabled',
            caret: 'hide',
            scale: 'css',
        });
    });
    test('Loading: визуальный baseline', async ({ page }) => {
        await page.goto(`${STORY_PATH}--loading`);
        await page.setViewportSize({ width: 800, height: 200 });
        await expect(page.locator('#storybook-root')).toHaveScreenshot('base-button-loading.png', {
            animations: 'disabled',
            caret: 'hide',
            scale: 'css',
        });
    });
    test('InteractiveStates: визуальный baseline', async ({ page }) => {
        await page.goto(`${STORY_PATH}--interactive-states`);
        await page.setViewportSize({ width: 800, height: 400 });
        await expect(page.locator('#storybook-root')).toHaveScreenshot('base-button-interactive-states.png', {
            animations: 'disabled',
            caret: 'hide',
            scale: 'css',
        });
    });
    test('SizeScale: визуальный baseline', async ({ page }) => {
        await page.goto(`${STORY_PATH}--size-scale`);
        await page.setViewportSize({ width: 800, height: 400 });
        await expect(page.locator('#storybook-root')).toHaveScreenshot('base-button-size-scale.png', {
            animations: 'disabled',
            caret: 'hide',
            scale: 'css',
        });
    });
    test('DarkTheme: визуальный baseline', async ({ page }) => {
        await page.goto(`${STORY_PATH}--dark-theme`);
        await page.setViewportSize({ width: 800, height: 200 });
        await expect(page.locator('#storybook-root')).toHaveScreenshot('base-button-dark.png', {
            animations: 'disabled',
            caret: 'hide',
            scale: 'css',
        });
    });
});
//# sourceMappingURL=base-button.visual.spec.js.map