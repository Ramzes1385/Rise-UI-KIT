/**
 * Visual regression тесты для BasePin.
 * Скриншоты всех состояний через Playwright + Storybook.
 */
import { expect, test } from '@playwright/test';
const COMPONENT = 'basepin';
const STORIES = [
    'default',
    'password',
    'number',
    'six-digits',
    'two-digits',
    'with-error',
    'disabled',
    'hover-state',
    'active-state',
    'focus-state',
    'interactive-states',
    'dark-theme',
];
for (const story of STORIES) {
    test(`BasePin — ${story}`, async ({ page }) => {
        await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`);
        const root = page.locator('.base-pin');
        await expect(root).toHaveScreenshot(`base-pin--${story}.png`);
    });
}
//# sourceMappingURL=base-pin.visual.spec.js.map