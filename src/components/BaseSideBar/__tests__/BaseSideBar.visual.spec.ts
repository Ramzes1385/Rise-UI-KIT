import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

const STORY_PATH = '/iframe.html?id=ui-basesidebar'

async function openStory(page: Page, storyId: string): Promise<void> {
	await page.goto(`${STORY_PATH}--${storyId}`)
	await page.waitForSelector('.base-sidebar', { timeout: 25000 })
}

async function expectStoryScreenshot(page: Page, name: string): Promise<void> {
	await expect(page.locator('#storybook-root')).toHaveScreenshot(name, {
		animations: 'disabled',
		caret: 'hide',
		scale: 'css',
	})
}

test.describe('BaseSideBar visual regression', () => {
	test('Default: визуальный baseline', async ({ page }) => {
		await page.setViewportSize({ width: 900, height: 640 })
		await openStory(page, 'default')

		await expectStoryScreenshot(page, 'base-sidebar-default.png')
	})

	test('WithItemsApi: визуальный baseline', async ({ page }) => {
		await page.setViewportSize({ width: 900, height: 640 })
		await openStory(page, 'with-items-api')

		await expectStoryScreenshot(page, 'base-sidebar-with-items-api.png')
	})

	test('CollapsedItems: визуальный baseline', async ({ page }) => {
		await page.setViewportSize({ width: 420, height: 640 })
		await openStory(page, 'collapsed-items')

		await expectStoryScreenshot(page, 'base-sidebar-collapsed-items.png')
	})

	test('DarkTheme: визуальный baseline', async ({ page }) => {
		await page.setViewportSize({ width: 900, height: 640 })
		await openStory(page, 'dark-theme')

		await expectStoryScreenshot(page, 'base-sidebar-dark-theme.png')
	})

	test('DarkCollapsed: визуальный baseline', async ({ page }) => {
		await page.setViewportSize({ width: 420, height: 640 })
		await openStory(page, 'dark-collapsed')

		await expectStoryScreenshot(page, 'base-sidebar-dark-collapsed.png')
	})

	test('ActiveByKey: визуальный baseline', async ({ page }) => {
		await page.setViewportSize({ width: 900, height: 640 })
		await openStory(page, 'active-by-key')

		await expectStoryScreenshot(page, 'base-sidebar-active-by-key.png')
	})

	test('ActiveByItemFlag: визуальный baseline', async ({ page }) => {
		await page.setViewportSize({ width: 900, height: 640 })
		await openStory(page, 'active-by-item-flag')

		await expectStoryScreenshot(page, 'base-sidebar-active-by-item-flag.png')
	})

	test('ControlledVModel: визуальный baseline', async ({ page }) => {
		await page.setViewportSize({ width: 1000, height: 640 })
		await openStory(page, 'controlled-v-model')

		await expectStoryScreenshot(page, 'base-sidebar-controlled-v-model.png')
	})

	test('ItemClickEvent: визуальный baseline', async ({ page }) => {
		await page.setViewportSize({ width: 900, height: 640 })
		await openStory(page, 'item-click-event')

		await expectStoryScreenshot(page, 'base-sidebar-item-click-event.png')
	})

	test('WithItemSlots: визуальный baseline', async ({ page }) => {
		await page.setViewportSize({ width: 900, height: 640 })
		await openStory(page, 'with-item-slots')

		await expectStoryScreenshot(page, 'base-sidebar-with-item-slots.png')
	})

	test('WithCustomItemSlot: визуальный baseline', async ({ page }) => {
		await page.setViewportSize({ width: 900, height: 640 })
		await openStory(page, 'with-custom-item-slot')

		await expectStoryScreenshot(page, 'base-sidebar-with-custom-item-slot.png')
	})

	test('NavigationSlotPriority: визуальный baseline', async ({ page }) => {
		await page.setViewportSize({ width: 900, height: 640 })
		await openStory(page, 'navigation-slot-priority')

		await expectStoryScreenshot(page, 'base-sidebar-navigation-slot-priority.png')
	})

	test('WithAllSlots: визуальный baseline', async ({ page }) => {
		await page.setViewportSize({ width: 900, height: 640 })
		await openStory(page, 'with-all-slots')

		await expectStoryScreenshot(page, 'base-sidebar-with-all-slots.png')
	})

	test('Loading: визуальный baseline', async ({ page }) => {
		await page.setViewportSize({ width: 900, height: 640 })
		await openStory(page, 'loading')

		await expectStoryScreenshot(page, 'base-sidebar-loading.png')
	})

	test('NotCollapsible: визуальный baseline', async ({ page }) => {
		await page.setViewportSize({ width: 900, height: 640 })
		await openStory(page, 'not-collapsible')

		await expectStoryScreenshot(page, 'base-sidebar-not-collapsible.png')
	})

	test('Variants: визуальный baseline', async ({ page }) => {
		await page.setViewportSize({ width: 1400, height: 760 })
		await openStory(page, 'variants')

		await expectStoryScreenshot(page, 'base-sidebar-variants.png')
	})

	test('CollapsedVariants: визуальный baseline', async ({ page }) => {
		await page.setViewportSize({ width: 900, height: 640 })
		await openStory(page, 'collapsed-variants')

		await expectStoryScreenshot(page, 'base-sidebar-collapsed-variants.png')
	})

	test('WidthVariants: визуальный baseline', async ({ page }) => {
		await page.setViewportSize({ width: 1200, height: 640 })
		await openStory(page, 'width-variants')

		await expectStoryScreenshot(page, 'base-sidebar-width-variants.png')
	})

	test('GapVariants: визуальный baseline', async ({ page }) => {
		await page.setViewportSize({ width: 1200, height: 640 })
		await openStory(page, 'gap-variants')

		await expectStoryScreenshot(page, 'base-sidebar-gap-variants.png')
	})

	test('SizeScaleVariants: визуальный baseline', async ({ page }) => {
		await page.setViewportSize({ width: 1200, height: 640 })
		await openStory(page, 'size-scale-variants')

		await expectStoryScreenshot(page, 'base-sidebar-size-scale-variants.png')
	})

	test('LongContent: визуальный baseline', async ({ page }) => {
		await page.setViewportSize({ width: 900, height: 640 })
		await openStory(page, 'long-content')

		await expectStoryScreenshot(page, 'base-sidebar-long-content.png')
	})

	test('SideMirror: визуальный baseline', async ({ page }) => {
		await page.setViewportSize({ width: 1200, height: 640 })
		await openStory(page, 'side-mirror')

		await expectStoryScreenshot(page, 'base-sidebar-side-mirror.png')
	})
})
