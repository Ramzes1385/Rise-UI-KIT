/**
 * Visual Regression тесты для BaseIcon.
 * Снимают baseline-скриншоты ключевых состояний через Storybook.
 */
import { expect, test } from '@playwright/test';
/** Базовый путь к stories BaseIcon в Storybook */
const STORY_PATH = '/iframe.html?id=ui-baseicon';
test.describe('BaseIcon visual regression', () => {
    test('Default: визуальный baseline', async ({ page }) => {
        await page.goto(`${STORY_PATH}--default`);
        await page.setViewportSize({ width: 400, height: 200 });
        await expect(page.locator('#storybook-root')).toHaveScreenshot('base-icon-default.png', {
            animations: 'disabled',
            caret: 'hide',
            scale: 'css',
        });
    });
    test('Sizes: визуальный baseline', async ({ page }) => {
        await page.goto(`${STORY_PATH}--sizes`);
        await page.setViewportSize({ width: 600, height: 200 });
        await expect(page.locator('#storybook-root')).toHaveScreenshot('base-icon-sizes.png', {
            animations: 'disabled',
            caret: 'hide',
            scale: 'css',
        });
    });
    test('AllIcons: визуальный baseline', async ({ page }) => {
        await page.goto(`${STORY_PATH}--all-icons`);
        await page.setViewportSize({ width: 800, height: 800 });
        await expect(page.locator('#storybook-root')).toHaveScreenshot('base-icon-all-icons.png', {
            animations: 'disabled',
            caret: 'hide',
            scale: 'css',
        });
    });
    test('Rotate: визуальный baseline', async ({ page }) => {
        await page.goto(`${STORY_PATH}--rotate`);
        await page.setViewportSize({ width: 600, height: 200 });
        await expect(page.locator('#storybook-root')).toHaveScreenshot('base-icon-rotate.png', {
            animations: 'disabled',
            caret: 'hide',
            scale: 'css',
        });
    });
    test('Flip: визуальный baseline', async ({ page }) => {
        await page.goto(`${STORY_PATH}--flip`);
        await page.setViewportSize({ width: 400, height: 200 });
        await expect(page.locator('#storybook-root')).toHaveScreenshot('base-icon-flip.png', {
            animations: 'disabled',
            caret: 'hide',
            scale: 'css',
        });
    });
    test('WithColor: визуальный baseline', async ({ page }) => {
        await page.goto(`${STORY_PATH}--with-color`);
        await page.setViewportSize({ width: 400, height: 200 });
        await expect(page.locator('#storybook-root')).toHaveScreenshot('base-icon-color.png', {
            animations: 'disabled',
            caret: 'hide',
            scale: 'css',
        });
    });
    test('DarkTheme: визуальный baseline', async ({ page }) => {
        await page.goto(`${STORY_PATH}--dark-theme`);
        await page.setViewportSize({ width: 400, height: 200 });
        await expect(page.locator('#storybook-root')).toHaveScreenshot('base-icon-dark.png', {
            animations: 'disabled',
            caret: 'hide',
            scale: 'css',
        });
    });
});
//# sourceMappingURL=base-icon.visual.spec.js.map