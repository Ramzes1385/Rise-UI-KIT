import { expect, test, type Locator, type Page } from '@playwright/test'

const STORY = '/iframe.html?id=overlay-basetour--target-interaction'

async function mouseClickCenter(page: Page, target: Locator): Promise<void> {
	const box = await target.boundingBox()
	if (!box) throw new Error('цель не видна')
	await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
}

test.describe('BaseTour: клик мышью по подсвеченной цели (TOUR-2)', () => {
	test.beforeEach(async ({ page }) => {
		await page.setViewportSize({ width: 1000, height: 700 })
		await page.goto(STORY)
		await expect(page.getByRole('button', { name: 'Нравится: 1' })).toBeVisible({ timeout: 25_000 })
		await expect(page.getByRole('dialog')).toHaveCount(0)
	})

	test('доступная цель нажимается мышью, тур не закрывается', async ({ page }) => {
		await page.getByRole('button', { name: 'Запустить тур' }).click()
		const dialog = page.getByRole('dialog', { name: 'Попробуйте сами' })
		await expect(dialog).toHaveAttribute('aria-modal', 'false')
		await expect(dialog.getByRole('button', { name: 'Далее' })).toBeFocused()

		await mouseClickCenter(page, page.locator('#tour-like'))

		await expect(page.getByRole('button', { name: 'Нравится: 2' })).toBeVisible()
		await expect(dialog).toBeVisible()
	})

	test('isTargetInteractive: false — клик по цели попадает в подложку, а не в цель', async ({ page }) => {
		await page.getByRole('button', { name: 'Запустить тур' }).click()
		const first = page.getByRole('dialog', { name: 'Попробуйте сами' })
		await first.getByRole('button', { name: 'Далее' }).click()
		const second = page.getByRole('dialog', { name: 'Только посмотреть' })
		await expect(second).toHaveAttribute('aria-modal', 'true')
		await expect(second.getByRole('button', { name: 'Завершить' })).toBeFocused()

		await mouseClickCenter(page, page.locator('#tour-like'))

		await expect(page.getByRole('dialog')).toHaveCount(0)
		await expect(page.getByRole('button', { name: 'Нравится: 1' })).toBeVisible()
	})
})
