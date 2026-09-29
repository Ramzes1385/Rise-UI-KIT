import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import userEvent from '@testing-library/user-event'
import BaseMediaPlayer from '../ui/BaseMediaPlayer.vue'
import { fakeMedia } from './BaseMediaPlayer.test-utils'
import { fireEvent, render, screen } from '@testing-library/vue'
import type { FakeMediaValues } from './BaseMediaPlayer.test-utils'
import type { BaseMediaPlayerProps } from '../types/BaseMediaPlayer.types'

async function setup(props: Partial<BaseMediaPlayerProps> = {}, initial: Partial<FakeMediaValues> = {}) {
	vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()
	const result = render(BaseMediaPlayer, { props: { sources: '/media/demo.webm', title: 'Демо', ...props } })
	const video = result.container.querySelector('video') as HTMLVideoElement
	const root = result.container.querySelector('.base-media-player') as HTMLElement
	const fake = fakeMedia(video, { duration: 60, ...initial })
	await nextTick()
	fake.emit('loadedmetadata')
	await nextTick()
	return { ...result, video, root, fake }
}

describe('BaseMediaPlayer: клавиатура и мышь', () => {
	it('Tab проходит по контролам: перемотка, воспроизведение, ±10 с, звук, громкость, скорость', async () => {
		const user = userEvent.setup()
		await setup()

		for (const [role, name] of [
			['slider', 'Перемотка'],
			['button', 'Воспроизвести'],
			['button', 'Назад на 10 с'],
			['button', 'Вперёд на 10 с'],
			['button', 'Выключить звук'],
			['slider', 'Громкость'],
			['button', 'Скорость воспроизведения'],
		] as const) {
			await user.tab()
			expect(screen.getByRole(role, { name })).toHaveFocus()
		}
	})

	it('горячие клавиши работают, пока фокус внутри плеера', async () => {
		const user = userEvent.setup()
		const { fake } = await setup({}, { volume: 0.5 })
		screen.getByRole('button', { name: 'Выключить звук' }).focus()

		await user.keyboard('k')
		expect(fake.play).toHaveBeenCalledOnce()
		await user.keyboard('{ArrowRight}')
		expect(fake.values.currentTime).toBe(5)
		await user.keyboard('l')
		expect(fake.values.currentTime).toBe(15)
		await user.keyboard('5')
		expect(fake.values.currentTime).toBe(30)
		await user.keyboard('{End}')
		expect(fake.values.currentTime).toBe(60)
		await user.keyboard('{Home}')
		expect(fake.values.currentTime).toBe(0)

		await user.keyboard('{ArrowUp}')
		expect(fake.values.volume).toBe(0.55)
		await user.keyboard('m')
		expect(fake.values.muted).toBe(true)
		await user.keyboard('f')
	})

	it('Shift+. и Shift+, переключают скорость по списку playbackRates', async () => {
		const user = userEvent.setup()
		const { fake } = await setup({ playbackRates: [2, 1, 1.5] })
		screen.getByRole('button', { name: 'Воспроизвести' }).focus()

		await user.keyboard('{Shift>}[Period]{/Shift}')
		expect(fake.values.playbackRate).toBe(1.5)
		await user.keyboard('{Shift>}[Period]{/Shift}{Shift>}[Period]{/Shift}')
		expect(fake.values.playbackRate).toBe(2)
		await user.keyboard('{Shift>}[Comma]{/Shift}')
		expect(fake.values.playbackRate).toBe(1.5)
	})

	it('Space на кнопке нажимает кнопку один раз; hasKeyboardShortcuts=false отключает клавиши', async () => {
		const user = userEvent.setup()
		const { fake, rerender } = await setup()
		screen.getByRole('button', { name: 'Воспроизвести' }).focus()

		await user.keyboard(' ')
		expect(fake.play).toHaveBeenCalledOnce()

		await rerender({ hasKeyboardShortcuts: false })
		await user.keyboard('{ArrowRight}')
		expect(fake.values.currentTime).toBe(0)
	})

	it('клик по кадру переключает воспроизведение, двойной клик не ломает плеер без Fullscreen API', async () => {
		const { fake, video } = await setup()

		await fireEvent.click(video)
		expect(fake.play).toHaveBeenCalledOnce()
		await fireEvent.dblClick(video)
		expect(screen.queryByRole('button', { name: 'Во весь экран' })).toBeNull()
	})

	it('кнопка полноэкранного режима разворачивает весь плеер', async () => {
		const screenState = { element: null as Element | null }
		Object.defineProperty(document, 'fullscreenEnabled', { configurable: true, value: true })
		Object.defineProperty(document, 'fullscreenElement', { configurable: true, get: () => screenState.element })
		Object.defineProperty(Element.prototype, 'requestFullscreen', {
			configurable: true,
			value: vi.fn(async function requestFullscreen(this: Element) {
				screenState.element = this
				document.dispatchEvent(new Event('fullscreenchange'))
			}),
		})
		const { root } = await setup()

		await fireEvent.click(await screen.findByRole('button', { name: 'Во весь экран' }))
		expect(screenState.element).toBe(root)
		expect(root).toHaveClass('base-media-player--fullscreen')
		expect(screen.getByRole('button', { name: 'Выйти из полноэкранного режима' })).toBeInTheDocument()

		Reflect.deleteProperty(document, 'fullscreenEnabled')
		Reflect.deleteProperty(document, 'fullscreenElement')
		Reflect.deleteProperty(Element.prototype, 'requestFullscreen')
	})

	it('во время воспроизведения панель скрывается после бездействия, но не при фокусе внутри', async () => {
		const { fake, root } = await setup({ idleTimeout: 1000 })
		vi.useFakeTimers()

		fake.emit('play')
		await nextTick()
		vi.advanceTimersByTime(1000)
		await nextTick()
		expect(root).toHaveClass('base-media-player--idle')

		await fireEvent.pointerMove(root)
		expect(root).not.toHaveClass('base-media-player--idle')
		screen.getByRole('button', { name: 'Пауза' }).focus()
		vi.advanceTimersByTime(1000)
		await nextTick()
		expect(root).not.toHaveClass('base-media-player--idle')
		vi.useRealTimers()
	})
})
