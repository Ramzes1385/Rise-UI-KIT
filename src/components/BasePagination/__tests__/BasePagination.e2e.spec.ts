import { expect, test } from '@playwright/test'

test('пагинация: Enter на «Вперёд» до последней страницы — фокус остаётся на кнопке, Shift+Tab идёт к номерам', async ({ page }) => {
	await page.goto('/iframe.html?id=navigation-basepagination--keyboard-at-edge')
	const next = page.getByRole('button', { name: 'Следующая страница' })
	await expect(next).toBeVisible({ timeout: 25_000 })
	await expect(next).toHaveAttribute('aria-disabled', 'true', { timeout: 25_000 })

	await page.getByRole('button', { name: 'Страница 11' }).click()
	await expect(next).not.toHaveAttribute('aria-disabled')
	await next.focus()
	await page.keyboard.press('Enter')

	await expect(page.getByRole('button', { name: 'Страница 12' })).toHaveAttribute('aria-current', 'page')
	await expect(next).toHaveAttribute('aria-disabled', 'true')
	await expect(next).not.toHaveAttribute('disabled')
	await expect(next).toBeFocused()
	expect(await page.evaluate(() => document.activeElement?.tagName)).toBe('BUTTON')

	await page.keyboard.press('Enter')
	await expect(page.getByRole('button', { name: 'Страница 12' })).toHaveAttribute('aria-current', 'page')
	await page.keyboard.press('Shift+Tab')
	await expect(page.getByRole('button', { name: 'Страница 12' })).toBeFocused()
})
