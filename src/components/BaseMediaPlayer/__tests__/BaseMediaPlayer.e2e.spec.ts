import { expect, test, type Page } from '@playwright/test'

const PLAYED_PHASES = ['played', 'completed', 'finished']

type PreviewWindow = { __STORYBOOK_PREVIEW__?: { currentRender?: { phase?: string } } }

type Metrics = Record<string, number>

async function openPlayer(page: Page, story: string): Promise<void> {
	await page.setViewportSize({ width: 800, height: 560 })
	await page.goto(`/iframe.html?id=media-basemediaplayer--${story}&viewMode=story`)
	await page.waitForFunction(
		phases => phases.includes((window as PreviewWindow).__STORYBOOK_PREVIEW__?.currentRender?.phase ?? ''),
		PLAYED_PHASES,
		{ timeout: 25_000 },
	)
}

async function setTime(page: Page, seconds: number): Promise<void> {
	await page.evaluate(async time => {
		const video = document.querySelector('video') as HTMLVideoElement
		video.pause()
		await new Promise(resolve => {
			video.addEventListener('seeked', resolve, { once: true })
			video.currentTime = time
		})
	}, seconds)
}

const seek = (page: Page) => page.getByRole('slider', { name: 'Перемотка' }).first()

test('жесты: двойной клик по краям перематывает на 10 с, удержание ускоряет до ×2', async ({ page }) => {
	await openPlayer(page, 'default')
	await setTime(page, 1)
	const box = (await page.locator('video').first().boundingBox()) as { x: number; y: number; width: number; height: number }
	const middle = box.y + box.height / 2

	await page.mouse.dblclick(box.x + box.width * 0.9, middle)
	await expect(seek(page)).toHaveAttribute('aria-valuetext', '0:11 из 0:12')
	await expect(page.locator('.base-media-player__seek-hint--right')).toBeVisible()
	await page.mouse.dblclick(box.x + box.width * 0.1, middle)
	await expect(seek(page)).toHaveAttribute('aria-valuetext', '0:01 из 0:12')

	await page.evaluate(() => (document.querySelector('video') as HTMLVideoElement).play())
	await page.mouse.move(box.x + box.width / 2, middle)
	await page.mouse.down()
	await expect(page.locator('.base-media-player__boost')).toHaveText('2×')
	expect(await page.evaluate(() => (document.querySelector('video') as HTMLVideoElement).playbackRate)).toBe(2)
	await page.mouse.up()
	await expect(page.locator('.base-media-player__boost')).toHaveCount(0)
	const after = await page.evaluate(() => {
		const video = document.querySelector('video') as HTMLVideoElement
		return { rate: video.playbackRate, paused: video.paused }
	})
	expect(after).toEqual({ rate: 1, paused: false })
})

test('панель прячется во время воспроизведения без движения мыши и возвращается при движении', async ({ page }) => {
	await openPlayer(page, 'default')
	const player = page.locator('.base-media-player')
	await page.mouse.move(5, 550)
	await page.evaluate(() => {
		;(document.activeElement as HTMLElement | null)?.blur()
		const video = document.querySelector('video') as HTMLVideoElement
		video.loop = true
		return video.play()
	})
	await expect(player).toHaveClass(/base-media-player--idle/, { timeout: 6000 })
	await page.mouse.move(400, 200)
	await expect(player).not.toHaveClass(/base-media-player--idle/)
})

test('субтитры: блок перетаскивается мышью в верх кадра', async ({ page }) => {
	await openPlayer(page, 'subtitles')
	await setTime(page, 1)
	const caption = page.locator('.base-media-player__caption-box')
	const before = (await caption.boundingBox()) as { x: number; y: number; width: number; height: number }
	await page.mouse.move(before.x + before.width / 2, before.y + before.height / 2)
	await page.mouse.down()
	await page.mouse.move(before.x + before.width / 2, before.y - 150, { steps: 8 })
	await page.mouse.up()
	const after = (await caption.boundingBox()) as { y: number }
	expect(before.y - after.y).toBeGreaterThan(120)
})

test('клавиатура: все элементы панели доступны по Tab, у каждого есть имя и видимый фокус', async ({ page }) => {
	await openPlayer(page, 'default')
	await page.mouse.click(5, 550)
	const visited: string[] = []
	for (let step = 0; step < 30; step++) {
		await page.keyboard.press('Tab')
		const focused = await page.evaluate(() => {
			const element = document.activeElement as HTMLElement | null
			if (!element?.closest('.base-media-player')) return null
			const style = getComputedStyle(element)
			return {
				name: element.getAttribute('aria-label') ?? '',
				outline: style.outlineStyle !== 'none' && style.outlineWidth !== '0px',
			}
		})
		if (!focused && visited.length > 0) break
		if (!focused) continue
		expect(focused.outline, focused.name).toBe(true)
		visited.push(focused.name)
	}
	expect(visited).toEqual([
		'Перемотка',
		'Воспроизвести',
		'Назад на 10 с',
		'Вперёд на 10 с',
		'Точная перемотка',
		'Выключить звук',
		'Громкость',
		'Скорость воспроизведения',
		'Субтитры',
		'Картинка в картинке',
		'Широкий экран',
		'Во весь экран',
	])
})

test('трансляция (эмуляция Cast): отказ от выбора устройства — без ошибки и без трансляции', async ({ page }) => {
	await openPlayer(page, 'cast')
	await page.getByRole('button', { name: 'Трансляция на телевизор' }).click()
	const picker = page.getByRole('dialog', { name: 'Трансляция' })
	await expect(picker.getByRole('button', { name: /Телевизор в гостиной/ })).toBeFocused()
	await page.keyboard.press('Escape')
	await expect(picker).toHaveCount(0)
	await page.getByRole('button', { name: 'Трансляция на телевизор' }).click()
	await picker.getByRole('button', { name: 'Отмена' }).click()
	await expect(picker).toHaveCount(0)
	await expect(page.locator('.base-media-player__cast')).toHaveCount(0)
	await expect(page.locator('.base-media-player__flash')).toHaveText('')
})

test('трансляция (эмуляция Cast): выбор устройства, клавиши управляют телевизором, после остановки просмотр продолжается здесь', async ({
	page,
}) => {
	await openPlayer(page, 'cast')
	await page.getByRole('button', { name: 'Трансляция на телевизор' }).click()
	const picker = page.getByRole('dialog', { name: 'Трансляция' })
	await expect(picker.getByRole('status')).toHaveText('Поиск устройств в сети…')
	await picker.getByRole('button', { name: /Проектор в кабинете/ }).click()
	await expect(picker).toHaveCount(0)
	await expect(page.getByText('Воспроизводится на «Проектор в кабинете»')).toBeVisible()
	const controls = page.locator('.base-media-player__cast-controls')
	await expect(controls.getByRole('button', { name: 'Пауза' })).toBeVisible()

	await page.locator('.base-media-player').focus()
	await page.keyboard.press('Space')
	await expect(controls.getByRole('button', { name: 'Воспроизвести' })).toBeVisible()
	await controls.getByRole('slider', { name: 'Перемотка' }).press('Home')
	await page.locator('.base-media-player').focus()
	await page.keyboard.press('ArrowRight')
	await expect(controls.locator('.base-media-player__time')).toHaveText('0:05 / 0:12')

	await controls.getByRole('button', { name: 'Остановить трансляцию' }).click()
	await expect(controls).toHaveCount(0)
	await expect(seek(page)).toHaveAttribute('aria-valuetext', '0:05 из 0:12')
	expect(await page.evaluate(() => (document.querySelector('video') as HTMLVideoElement).paused)).toBe(true)
})

test('производительность: панель обновляется реже кадра при воспроизведении и не работает на паузе', async ({ page }) => {
	await openPlayer(page, 'default')
	const cdp = await page.context().newCDPSession(page)
	await cdp.send('Performance.enable')
	const metrics = async (): Promise<Metrics> =>
		Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(({ name, value }) => [name, value]))
	const measure = async (milliseconds: number): Promise<Metrics> => {
		const start = await metrics()
		await page.waitForTimeout(milliseconds)
		const end = await metrics()
		return Object.fromEntries(Object.keys(end).map(name => [name, end[name] - (start[name] ?? 0)]))
	}

	await page.evaluate(() => {
		const video = document.querySelector('video') as HTMLVideoElement
		video.loop = true
		video.muted = true
		return video.play()
	})
	await page.waitForTimeout(500)
	const playing = await measure(3000)
	expect(playing.LayoutCount).toBeLessThan(90)
	expect(playing.ScriptDuration).toBeLessThan(0.3)

	await page.evaluate(() => (document.querySelector('video') as HTMLVideoElement).pause())
	await page.waitForTimeout(500)
	const paused = await measure(2000)
	expect(paused.LayoutCount).toBe(0)
	expect(paused.RecalcStyleCount).toBeLessThanOrEqual(2)
})
