import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import userEvent from '@testing-library/user-event'
import BaseMediaPlayer from '../../ui/BaseMediaPlayer.vue'
import { fakeMedia } from '../utils/BaseMediaPlayer.test-utils'
import { fireEvent, render, screen, within } from '@testing-library/vue'
import type { BaseMediaPlayerProps } from '../../types/BaseMediaPlayer.types'

const SOURCE = '/media/demo.webm'

async function setup(props: Partial<BaseMediaPlayerProps> = {}) {
	vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()
	const result = render(BaseMediaPlayer, { props: { sources: SOURCE, title: 'Демо', ...props } })
	const video = result.container.querySelector('video') as HTMLVideoElement
	const root = result.container.querySelector('.base-media-player') as HTMLElement
	const fake = fakeMedia(video, { duration: 60, currentTime: 12 })
	await nextTick()
	fake.emit('loadedmetadata')
	await nextTick()
	return { ...result, video, root, fake }
}

function rightClick(target: HTMLElement): boolean {
	const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 20, clientY: 20 })
	target.dispatchEvent(event)
	return event.defaultPrevented
}

async function openContextMenu(video: HTMLVideoElement) {
	const isPrevented = rightClick(video)
	return { isPrevented, menu: await screen.findByRole('menu') }
}

describe('BaseMediaPlayer: меню, ссылки, жесты, позиция', () => {
	let writeText: ReturnType<typeof vi.fn>

	beforeEach(() => {
		writeText = vi.fn(async () => undefined)
		Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
	})

	afterEach(() => {
		vi.useRealTimers()
		Reflect.deleteProperty(navigator, 'clipboard')
		localStorage.clear()
		window.history.replaceState({}, '', '/')
	})

	it('правый клик открывает меню плеера, повторный — меню браузера; «Повторять» включает повтор', async () => {
		const { video } = await setup()
		const { isPrevented, menu } = await openContextMenu(video)

		expect(isPrevented).toBe(true)
		expect(rightClick(video)).toBe(false)
		await fireEvent.click(within(menu).getByRole('menuitemcheckbox', { name: 'Повторять' }))
		expect(video.loop).toBe(true)
	})

	it('копирование ссылки и ссылки с таймкодом из меню', async () => {
		const { video } = await setup({ shareUrl: 'https://example.com/watch/7' })

		await fireEvent.click(within((await openContextMenu(video)).menu).getByRole('menuitem', { name: 'Копировать ссылку на видео' }))
		await fireEvent.click(
			within((await openContextMenu(video)).menu).getByRole('menuitem', { name: 'Копировать ссылку с привязкой ко времени' }),
		)
		await vi.waitFor(() => expect(writeText).toHaveBeenCalledTimes(2))
		expect(writeText.mock.calls).toEqual([['https://example.com/watch/7'], ['https://example.com/watch/7?t=12']])
		expect(await screen.findByText('Ссылка скопирована')).toHaveAttribute('role', 'status')
	})

	it('данные для отладки: показатели, лог событий элемента и плеера, отчёт в буфер обмена', async () => {
		const { video, fake } = await setup()
		fake.emit('play')
		await nextTick()

		await fireEvent.click(within((await openContextMenu(video)).menu).getByRole('menuitem', { name: 'Данные для отладки' }))
		const panel = screen.getByRole('region', { name: 'Данные для отладки' })
		expect(panel).toHaveTextContent('Позиция0:12 / 1:00')
		await fireEvent.click(within(panel).getByRole('button', { name: /^События/ }))
		const types = [...panel.querySelectorAll('.base-media-player__stats-type')].map(item => item.textContent)
		expect(types).toEqual(expect.arrayContaining(['play', 'loadedmetadata']))
		await fireEvent.click(within(panel).getByRole('button', { name: 'Скопировать отчёт' }))
		await vi.waitFor(() => expect(writeText).toHaveBeenCalledWith(expect.stringContaining('Позиция: 0:12 / 1:00')))
		expect(writeText.mock.calls[0][0]).toMatch(/\[0:12\.0\] play/)
		await fireEvent.click(within(panel).getByRole('button', { name: 'Закрыть' }))
		expect(screen.queryByRole('region', { name: 'Данные для отладки' })).toBeNull()
	})

	it('«Сообщить о проблеме» отправляет событие report с позицией и сведениями', async () => {
		const user = userEvent.setup()
		const { video, emitted } = await setup()

		await fireEvent.click(within((await openContextMenu(video)).menu).getByRole('menuitem', { name: 'Сообщить о проблеме' }))
		await user.click(await screen.findByRole('button', { name: 'Отправить' }))
		expect(emitted('report')?.[0]).toEqual([
			expect.objectContaining({ reason: 'no-sound', comment: '', time: 12, details: expect.stringContaining('Скорость') }),
		])
		expect(await screen.findByText('Спасибо, сообщение отправлено')).toBeInTheDocument()
	})

	it('двойной клик по краю перематывает с подсказкой; удержание ускоряет', async () => {
		const { video, root, fake } = await setup()

		await fireEvent.dblClick(video, { clientX: 95 })
		expect(fake.values.currentTime).toBe(22)
		expect(root.querySelector('.base-media-player__seek-hint--right')).toHaveTextContent('+10 с')

		vi.useFakeTimers()
		fake.emit('play')
		await nextTick()
		await fireEvent.pointerDown(video, { button: 0 })
		vi.advanceTimersByTime(500)
		await nextTick()
		expect(root.querySelector('.base-media-player__boost')).toHaveTextContent('2×')
		expect(rightClick(video)).toBe(false)
		await fireEvent.pointerUp(video)
		expect(fake.values.playbackRate).toBe(1)
		await fireEvent.pointerCancel(video)
		await fireEvent.pointerLeave(video)
		expect(root.querySelector('.base-media-player__boost')).toBeNull()
		vi.useRealTimers()
	})

	it('предлагает продолжить с сохранённой позиции', async () => {
		localStorage.setItem('rise-media:ep1', '42')
		const { fake } = await setup({ storageKey: 'ep1' })

		expect(screen.getByText('Продолжить с 0:42?')).toBeInTheDocument()
		await fireEvent.click(screen.getByRole('button', { name: 'Продолжить' }))
		expect(fake.values.currentTime).toBe(42)
		expect(screen.queryByText('Продолжить с 0:42?')).toBeNull()
	})

	it('«Сначала» убирает предложение; позиция из адреса страницы', async () => {
		localStorage.setItem('rise-media:ep1', '42')
		await setup({ storageKey: 'ep1' })
		await fireEvent.click(screen.getByRole('button', { name: 'Сначала' }))
		expect(screen.queryByText('Продолжить с 0:42?')).toBeNull()

		window.history.replaceState({}, '', '/?t=30')
		const fromUrl = await setup()
		expect(fromUrl.fake.values.currentTime).toBe(30)
		const ignored = await setup({ hasUrlTime: false, isLoop: true })
		expect(ignored.fake.values.currentTime).toBe(12)
		await ignored.rerender({ isLoop: false })
		expect(ignored.video.loop).toBe(false)
	})
})
