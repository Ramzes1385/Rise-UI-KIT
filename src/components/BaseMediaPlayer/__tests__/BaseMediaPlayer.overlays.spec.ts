import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import BaseMediaPlayer from '../ui/BaseMediaPlayer.vue'
import { fakeMedia } from './BaseMediaPlayer.test-utils'
import type { FakeMediaValues } from './BaseMediaPlayer.test-utils'
import { fireEvent, render, screen, within } from '@testing-library/vue'
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
		expect(paused()?.querySelector('path')).toHaveAttribute('d', expect.stringMatching(/^M8,5\.14/))
		await fireEvent.click(paused()?.querySelector('button') as HTMLElement)
		expect(fake.play).toHaveBeenCalledOnce()
		fake.update({ paused: true, ended: true }, 'ended')
		await nextTick()
		expect(paused()?.querySelector('path')).toHaveAttribute('d', expect.stringMatching(/^M12,5V1/))
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
		expect(hint.querySelector('path')).toHaveAttribute('d', expect.stringMatching(/^M11\.5,12/))
	})
})
