import { expect, test } from '@playwright/test'
import type { CDPSession, Page } from '@playwright/test'

test.use({ hasTouch: true, viewport: { width: 900, height: 700 } })

type TouchPoint = { x: number; y: number; id: number }

async function openViewer(page: Page): Promise<void> {
	await page.goto('/iframe.html?id=element-baseimage--with-zoom')
	await page.getByRole('button', { name: 'Горы на рассвете' }).click()
	await page.getByRole('dialog').waitFor()
}

async function zoomInTimes(page: Page, times: number): Promise<void> {
	for (let i = 0; i < times; i++) await page.getByRole('button', { name: 'Увеличить' }).click()
}

async function dispatch(session: CDPSession, type: 'touchStart' | 'touchMove' | 'touchEnd', points: TouchPoint[]): Promise<void> {
	await session.send('Input.dispatchTouchEvent', { type, touchPoints: points.map(point => ({ ...point, radiusX: 1, radiusY: 1 })) })
}

async function imageCenter(page: Page): Promise<{ x: number; y: number }> {
	const box = (await page.locator('.base-image__zoom-container').boundingBox())!
	return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
}

function translateOf(transform: string): { x: number; y: number } {
	const [, x, y] = /translate\((-?[\d.]+)px, (-?[\d.]+)px\)/.exec(transform)!
	return { x: Number(x), y: Number(y) }
}

test('просмотр: палец двигает увеличенное изображение, клик после сдвига окно не закрывает', async ({ page }) => {
	await openViewer(page)
	await zoomInTimes(page, 8)
	const session = await page.context().newCDPSession(page)
	const center = await imageCenter(page)
	const image = page.locator('.base-image__zoom-img')
	expect(translateOf((await image.getAttribute('style'))!)).toEqual({ x: 0, y: 0 })

	await dispatch(session, 'touchStart', [{ ...center, id: 1 }])
	await dispatch(session, 'touchMove', [{ x: center.x - 80, y: center.y - 40, id: 1 }])
	await dispatch(session, 'touchMove', [{ x: center.x - 160, y: center.y - 80, id: 1 }])
	await dispatch(session, 'touchEnd', [])

	await expect.poll(async () => translateOf((await image.getAttribute('style'))!).x).toBeLessThan(-100)
	expect(translateOf((await image.getAttribute('style'))!).y).toBeLessThan(-40)
	await expect(page.getByRole('dialog')).toBeVisible()
})

test('просмотр: щипок двумя пальцами меняет масштаб', async ({ page }) => {
	await openViewer(page)
	const session = await page.context().newCDPSession(page)
	const center = await imageCenter(page)
	const scale = page.locator('.base-image__zoom-scale')
	await expect(scale).toHaveText('100%')

	await dispatch(session, 'touchStart', [
		{ x: center.x - 40, y: center.y, id: 1 },
		{ x: center.x + 40, y: center.y, id: 2 },
	])
	await dispatch(session, 'touchMove', [
		{ x: center.x - 80, y: center.y, id: 1 },
		{ x: center.x + 80, y: center.y, id: 2 },
	])
	await dispatch(session, 'touchEnd', [])

	await expect(scale).toHaveText('200%')
})

test('просмотр: мышь двигает увеличенное изображение перетаскиванием по нему, окно остаётся открытым', async ({ page }) => {
	await openViewer(page)
	await zoomInTimes(page, 8)
	const center = await imageCenter(page)
	const image = page.locator('.base-image__zoom-img')

	await page.mouse.move(center.x, center.y)
	await page.mouse.down()
	await page.mouse.move(center.x + 120, center.y + 60, { steps: 4 })
	await page.mouse.up()

	await expect.poll(async () => translateOf((await image.getAttribute('style'))!).x).toBeGreaterThan(100)
	await expect(page.getByRole('dialog')).toBeVisible()
})

async function stageBackground(page: Page): Promise<{ x: number; y: number }> {
	const box = (await page.locator('.base-image__zoom-container').boundingBox())!
	return { x: box.x + 6, y: box.y + 6 }
}

test('просмотр: клик мышью по изображению окно не закрывает — при 100% и при увеличении', async ({ page }) => {
	await openViewer(page)
	const image = page.locator('.base-image__zoom-img')
	const box = (await image.boundingBox())!
	await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
	await expect(page.getByRole('dialog')).toBeVisible()

	await zoomInTimes(page, 4)
	const center = await imageCenter(page)
	await page.mouse.click(center.x, center.y)
	await expect(page.getByRole('dialog')).toBeVisible()
})

test('просмотр: клик мышью по фону закрывает окно, после перетаскивания первый клик по фону окно закрывает', async ({ page }) => {
	await openViewer(page)
	await zoomInTimes(page, 8)
	const center = await imageCenter(page)
	await page.mouse.move(center.x, center.y)
	await page.mouse.down()
	await page.mouse.move(center.x + 60, center.y + 30, { steps: 4 })
	await page.mouse.up()
	await expect(page.getByRole('dialog')).toBeVisible()

	await page.getByRole('button', { name: 'Сбросить' }).click()
	const background = await stageBackground(page)
	await expect
		.poll(() => page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.className, background))
		.toContain('base-image__zoom-container')
	await page.mouse.click(background.x, background.y)
	await expect(page.getByRole('dialog')).toBeHidden()
})

test('просмотр: касание изображения окно не закрывает, касание фона закрывает', async ({ page }) => {
	await openViewer(page)
	const session = await page.context().newCDPSession(page)
	const center = await imageCenter(page)
	await dispatch(session, 'touchStart', [{ ...center, id: 1 }])
	await dispatch(session, 'touchEnd', [])
	await expect(page.getByRole('dialog')).toBeVisible()

	const background = await stageBackground(page)
	await dispatch(session, 'touchStart', [{ ...background, id: 1 }])
	await dispatch(session, 'touchEnd', [])
	await expect(page.getByRole('dialog')).toBeHidden()
})
