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

test('панель прячется во время воспроизведения без движения мыши, возвращается при движении и сразу уходит вместе с мышью', async ({
	page,
}) => {
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
	await page.mouse.move(400, 555, { steps: 4 })
	await expect(player).toHaveClass(/base-media-player--idle/, { timeout: 500 })
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
		'Точная перемотка',
		'Выключить звук',
		'Громкость',
		'Автовоспроизведение',
		'Скорость воспроизведения',
		'Качество',
		'Субтитры',
		'Озвучка',
		'Совместный просмотр',
		'Поделиться',
		'Трансляция на телевизор',
		'Серии',
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

test('совместный просмотр: вкладка по ссылке подключается, запуск, перемотка и пауза общие', async ({ page, context }) => {
	await openPlayer(page, 'watch-party')
	const link = await page.getByRole('textbox', { name: 'Ссылка-приглашение' }).inputValue()
	const guest = await context.newPage()
	await guest.goto(link)
	await expect(page.locator('.base-media-player__watch-member').filter({ hasText: 'Смотрит' })).toHaveCount(1)
	await page.keyboard.press('Escape')
	const media = (target: Page) => target.locator('video.base-media-player__media')

	await media(guest).evaluate(video => {
		;(video as HTMLVideoElement).muted = true
	})
	await media(page).evaluate(video => {
		;(video as HTMLVideoElement).muted = true
		return (video as HTMLVideoElement).play()
	})
	await expect.poll(() => media(guest).evaluate(video => (video as HTMLVideoElement).paused)).toBe(false)
	await media(page).evaluate(video => {
		;(video as HTMLVideoElement).currentTime = 8
	})
	await expect.poll(() => media(guest).evaluate(video => Math.round((video as HTMLVideoElement).currentTime))).toBeGreaterThanOrEqual(8)
	await media(guest).evaluate(video => (video as HTMLVideoElement).pause())
	await expect.poll(() => media(page).evaluate(video => (video as HTMLVideoElement).paused)).toBe(true)
	await guest.close()
	await page.getByRole('button', { name: 'Совместный просмотр' }).click()
	await expect(page.locator('.base-media-player__watch-member').filter({ hasText: 'Смотрит' })).toHaveCount(0)
})

test('подгонка панели: панель глав и меню не прячут кнопки первого ряда', async ({ page }) => {
	await openPlayer(page, 'episodes')
	await page.setViewportSize({ width: 1000, height: 640 })
	const bar = page.locator('.base-media-player__bar').first()
	await expect(bar).toHaveAttribute('data-fit', '')
	await bar.evaluate(element => {
		const log: string[] = []
		Object.assign(window, { fitLog: log })
		new MutationObserver(() => log.push(element.dataset.fit ?? '')).observe(element, { attributeFilter: ['data-fit'] })
	})

	await page.locator('.base-media-player__chapter').click()
	await expect(page.getByRole('region', { name: 'Главы' })).toBeVisible()
	await page.keyboard.press('Escape')
	await expect(page.getByRole('region', { name: 'Главы' })).toHaveCount(0)
	await page.getByRole('button', { name: 'Скорость воспроизведения' }).click()
	await page.keyboard.press('Escape')
	await page.waitForTimeout(400)
	const log = await page.evaluate(() => (window as unknown as { fitLog: string[] }).fitLog)
	expect(new Set(log)).toEqual(new Set(log.length > 0 ? [''] : []))
	await expect(page.getByRole('button', { name: 'Следующая серия' })).toBeVisible()
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
