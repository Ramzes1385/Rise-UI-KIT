import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import BaseMediaPlayer from '../../ui/BaseMediaPlayer.vue'
import { fakeMedia } from '../utils/BaseMediaPlayer.test-utils'
import { fireEvent, render, screen, within } from '@testing-library/vue'
import type { FakeMediaValues } from '../utils/BaseMediaPlayer.test-utils'
import type { BaseMediaPlayerProps } from '../../types/BaseMediaPlayer.types'

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

describe('BaseMediaPlayer: оверлеи в стиле VideoStack', () => {
	afterEach(() => vi.restoreAllMocks())

	it('пауза после запуска: затемнение с белой кнопкой; после конца — «повтор»; при ошибке не показывается', async () => {
		const { root, fake } = await setup()
		const paused = (): HTMLElement | null => root.querySelector('.base-media-player__paused')

		expect(paused()).toBeNull()
		fake.emit('play')
		await nextTick()
		expect(paused()).toBeNull()
		fake.update({ paused: true }, 'pause')
		await nextTick()
		expect(paused()?.querySelector('.base-media-player__icon')).toHaveAttribute('data-icon', 'play')
		await fireEvent.click(paused()?.querySelector('button') as HTMLElement)
		expect(fake.play).toHaveBeenCalledOnce()
		fake.update({ paused: true, ended: true }, 'ended')
		await nextTick()
		expect(paused()?.querySelector('.base-media-player__icon')).toHaveAttribute('data-icon', 'replay')
		fake.update({ error: { code: 2 } }, 'error')
		await nextTick()
		expect(paused()).toBeNull()
	})

	it('обложка до первого запуска: картинка и видео-обложка, щелчок по кадру запускает; после запуска её нет', async () => {
		const { root, video, fake } = await setup({ poster: '/cover.webp', posterVideo: '/cover.webm' })
		const cover = root.querySelector('.base-media-player__cover') as HTMLElement

		expect(cover.querySelector('img')).toHaveAttribute('src', '/cover.webp')
		const teaser = cover.querySelector('video') as HTMLVideoElement
		expect(teaser).toHaveAttribute('src', '/cover.webm')
		expect(teaser.muted).toBe(true)
		expect(teaser.loop).toBe(true)
		await fireEvent.click(video)
		expect(fake.play).toHaveBeenCalledOnce()
		fake.emit('play')
		await nextTick()
		expect(root.querySelector('.base-media-player__cover')).toBeNull()
	})

	it('обложка с опасным адресом не показывается; без обложки слоя нет', async () => {
		const { root } = await setup({ poster: 'javascript:alert(1)', posterVideo: 'javascript:alert(2)' })
		expect(root.querySelector('.base-media-player__cover')).toBeNull()
	})

	it('экран ошибки: значок, заголовок, текст и «Повторить»', async () => {
		const { fake } = await setup()
		fake.update({ error: { code: 2 } }, 'error')
		await nextTick()

		const alert = screen.getByRole('alert')
		expect(alert.querySelector('.base-media-player__overlay-title')).toHaveTextContent('Ошибка воспроизведения')
		expect(alert).toHaveTextContent('Ошибка сети')
		expect(within(alert).getByRole('button', { name: 'Повторить' })).toHaveClass('base-media-player__retry')
	})

	it('индикатор перемотки — белый круг со значком и секундами', async () => {
		const { root, video } = await setup()

		await fireEvent.dblClick(video, { clientX: 0 })
		const hint = root.querySelector('.base-media-player__seek-hint--left') as HTMLElement
		expect(hint.querySelector('.base-media-player__seek-hint-label')).toHaveTextContent('−10 с')
		expect(hint.querySelector('.base-media-player__icon')).toHaveAttribute('data-icon', 'rewind')
	})

	it('мини-плеер: место плеера с подписью, кнопки «Вернуть» и «Закрыть» в углу', async () => {
		let report: IntersectionObserverCallback = () => undefined
		vi.stubGlobal(
			'IntersectionObserver',
			class {
				constructor(callback: IntersectionObserverCallback) {
					report = callback
				}
				observe(): void {}
				disconnect(): void {}
			},
		)
		const { root, fake } = await setup({ hasMiniPlayer: true })
		fake.emit('play')
		report([{ intersectionRatio: 0, boundingClientRect: { top: -500 } } as IntersectionObserverEntry], {} as IntersectionObserver)
		await nextTick()

		expect(root).toHaveClass('base-media-player--mini')
		expect(root.querySelector('.base-media-player__mini-placeholder')).toHaveTextContent('Видео в мини-плеере')
		await fireEvent.click(screen.getByRole('button', { name: 'Вернуть плеер на место' }))
		expect(root.scrollIntoView).toHaveBeenCalled()
		await fireEvent.click(screen.getByRole('button', { name: 'Закрыть мини-плеер' }))
		expect(fake.pause).toHaveBeenCalledOnce()
		expect(root).not.toHaveClass('base-media-player--mini')
		vi.unstubAllGlobals()
	})

	it('подсветка — кнопкой во втором ряду; поворот и подсветка — в контекстном меню', async () => {
		const { root, video } = await setup()

		await fireEvent.click(screen.getByRole('button', { name: 'Точная перемотка' }))
		const ambient = screen.getByRole('button', { name: 'Подсветка' })
		await fireEvent.click(ambient)
		expect(ambient).toHaveAttribute('aria-pressed', 'true')
		expect(root).toHaveClass('base-media-player--ambient')
		video.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 20, clientY: 20 }))
		const menu = await screen.findByRole('menu')
		expect(within(menu).getByRole('menuitemcheckbox', { name: 'Подсветка' })).toHaveAttribute('aria-checked', 'true')
		await fireEvent.click(within(menu).getByRole('menuitem', { name: /Повернуть картинку/ }))
		expect(root).toHaveClass('base-media-player--rotate-90')
		localStorage.clear()
	})
})
