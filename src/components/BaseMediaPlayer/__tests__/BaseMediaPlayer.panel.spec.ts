import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import BaseMediaPlayer from '../ui/BaseMediaPlayer.vue'
import { fakeMedia } from './BaseMediaPlayer.test-utils'
import MediaSettingsMenu from '../ui/MediaSettingsMenu.vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import type { FakeMediaValues } from './BaseMediaPlayer.test-utils'
import type { BaseMediaPlayerProps } from '../types/BaseMediaPlayer.types'

const SOURCE = '/media/demo.webm'

async function setup(props: Partial<BaseMediaPlayerProps> = {}, initial: Partial<FakeMediaValues> = {}) {
	vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()
	const result = render(BaseMediaPlayer, { props: { sources: SOURCE, title: 'Демо', ...props } })
	const video = result.container.querySelector('video') as HTMLVideoElement
	const root = result.container.querySelector('.base-media-player') as HTMLElement
	const fake = fakeMedia(video, { duration: 60, ...initial })
	await nextTick()
	fake.emit('loadedmetadata')
	await nextTick()
	return { ...result, video, root, fake }
}

describe('BaseMediaPlayer: панель', () => {
	afterEach(() => {
		vi.useRealTimers()
	})

	it('тёмная тема внутри плеера и слой для меню, который удаляется вместе с плеером', async () => {
		const { root, unmount } = await setup()
		const layer = root.querySelector('.base-media-player__layer')

		expect(root).toHaveAttribute('data-theme', 'dark')
		expect(layer).not.toBeNull()
		unmount()
		expect(layer?.isConnected).toBe(false)
	})

	it('название и логотип-ссылка поверх кадра', async () => {
		const { root } = await setup({ logo: '/logo.svg', logoAlt: 'Rise', logoHref: 'https://example.com', logoPosition: 'top-left' })
		const link = screen.getByRole('link', { name: 'Rise' })

		expect(root.querySelector('.base-media-player__title')).toHaveTextContent('Демо')
		expect(link).toHaveAttribute('href', 'https://example.com')
		expect(link).toHaveAttribute('rel', 'noopener noreferrer')
		expect(link.querySelector('img')).toHaveAttribute('src', '/logo.svg')
		expect(root.querySelector('.base-media-player__top')).toHaveClass('base-media-player__top--logo-top-left')
	})

	it('логотип без ссылки; небезопасные адреса не выводятся; без названия и логотипа верхней полосы нет', async () => {
		const { root, rerender } = await setup({ logo: '/logo.svg', logoAlt: 'Rise', logoHref: 'javascript:alert(1)', hasTitle: false })

		expect(screen.queryByRole('link')).toBeNull()
		expect(screen.getByRole('img', { name: 'Rise' })).toHaveAttribute('src', '/logo.svg')
		expect(root.querySelector('.base-media-player__title')).toBeNull()

		await rerender({ logo: 'javascript:alert(1)', logoAlt: undefined })
		expect(root.querySelector('.base-media-player__top')).toBeNull()
		await rerender({ logo: 'data:image/png;base64,AAAA', logoHref: undefined })
		expect(root.querySelector('.base-media-player__logo')).toHaveAttribute('alt', '')
	})

	it('большая кнопка видна до первого запуска и не возвращается после паузы', async () => {
		const { root, fake } = await setup()
		const start = () => root.querySelector('.base-media-player__start')

		expect(start()).not.toBeNull()
		await fireEvent.click(root.querySelector('.base-media-player__big-play') as HTMLElement)
		expect(fake.play).toHaveBeenCalledOnce()
		expect(start()).toBeNull()
		await fireEvent.click(screen.getByRole('button', { name: 'Пауза' }))
		expect(start()).toBeNull()
	})

	it('индикатор загрузки — через 500 мс ожидания во время воспроизведения', async () => {
		const { fake } = await setup()
		vi.useFakeTimers()

		fake.emit('play')
		fake.emit('waiting')
		await nextTick()
		vi.advanceTimersByTime(499)
		await nextTick()
		expect(screen.queryByRole('status', { name: 'Загрузка' })).toBeNull()
		vi.advanceTimersByTime(1)
		await nextTick()
		expect(screen.getByRole('status', { name: 'Загрузка' })).toBeInTheDocument()

		fake.emit('playing')
		await nextTick()
		expect(screen.queryByRole('status', { name: 'Загрузка' })).toBeNull()
	})

	it('широкий экран: кнопка, клавиша T и v-model:is-theater', async () => {
		const { root, emitted, rerender } = await setup()

		await fireEvent.click(screen.getByRole('button', { name: 'Широкий экран' }))
		expect(root).toHaveClass('base-media-player--theater')
		expect(screen.getByRole('button', { name: 'Обычный режим' })).toBeInTheDocument()
		await fireEvent.keyDown(root, { code: 'KeyT' })
		expect(root).not.toHaveClass('base-media-player--theater')
		expect(emitted('update:isTheater')).toEqual([[true], [false]])

		await rerender({ isTheater: false })
		await fireEvent.click(screen.getByRole('button', { name: 'Широкий экран' }))
		expect(root).not.toHaveClass('base-media-player--theater')
		await rerender({ isTheater: true })
		expect(root).toHaveClass('base-media-player--theater')
	})

	it('v-model: начальные значения из props; автозапуск оставляет звук выключенным', () => {
		vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()
		const props = { sources: SOURCE, title: 'Демо', currentTime: 12, volume: 0.4, isMuted: true, playbackRate: 1.5 }
		const video = render(BaseMediaPlayer, { props }).container.querySelector('video') as HTMLVideoElement
		expect([video.currentTime, video.volume, video.muted, video.playbackRate]).toEqual([12, 0.4, true, 1.5])

		const autoplay = render(BaseMediaPlayer, { props: { sources: SOURCE, title: 'Автозапуск', isAutoplay: true, isMuted: false } })
		expect((autoplay.container.querySelector('video') as HTMLVideoElement).muted).toBe(true)
	})

	it('v-model: новые значения props уходят в элемент, изменения элемента — в события', async () => {
		const { fake, emitted, rerender } = await setup()
		vi.useFakeTimers()

		await rerender({ volume: 0.2, isMuted: true, playbackRate: 2, currentTime: 30 })
		expect(fake.values).toMatchObject({ volume: 0.2, muted: true, playbackRate: 2, currentTime: 30 })
		expect(emitted('update:volume')?.at(-1)).toEqual([0.2])
		expect(emitted('update:isMuted')?.at(-1)).toEqual([true])
		expect(emitted('update:playbackRate')?.at(-1)).toEqual([2])
		expect(emitted('update:currentTime')?.at(-1)).toEqual([30])

		fake.update({ currentTime: 30.1 }, 'seeked')
		fake.update({ currentTime: 30.2 }, 'seeked')
		await nextTick()
		expect(emitted('update:currentTime')).toHaveLength(1)
		vi.advanceTimersByTime(250)
		expect(emitted('update:currentTime')?.at(-1)).toEqual([30.2])
	})

	it('меню настроек получает скорости по порядку и качества с подписью; выбор меняет элемент', async () => {
		vi.spyOn(HTMLMediaElement.prototype, 'canPlayType').mockReturnValue('maybe')
		const sources = [
			{ src: '/media/hd.webm', type: 'video/webm', label: '720p' },
			{ src: '/media/sd.webm', type: 'video/webm', label: '360p' },
			{ src: '/media/raw.webm', type: 'video/webm' },
		]
		const wrapper = mount(BaseMediaPlayer, { props: { sources, title: 'Демо', playbackRates: [2, 1, 0.5] }, attachTo: document.body })
		await nextTick()
		const settings = wrapper.findComponent(MediaSettingsMenu)

		expect(settings.props()).toMatchObject({ rates: [0.5, 1, 2], rate: 1, activeQualityId: '/media/hd.webm' })
		expect(settings.props('qualities')).toEqual([
			{ id: '/media/hd.webm', label: '720p' },
			{ id: '/media/sd.webm', label: '360p' },
		])
		settings.vm.$emit('select-rate', 2)
		settings.vm.$emit('select-quality', '/media/unknown.webm')
		settings.vm.$emit('select-quality', '/media/sd.webm')
		await nextTick()
		const video = wrapper.get('video').element as HTMLVideoElement
		expect(video.playbackRate).toBe(2)
		expect(video.getAttribute('src')).toBe('/media/sd.webm')
		wrapper.unmount()
	})

	it('событие fullscreen-change', async () => {
		const screenState = { element: null as Element | null }
		Object.defineProperty(document, 'fullscreenEnabled', { configurable: true, value: true })
		Object.defineProperty(document, 'fullscreenElement', { configurable: true, get: () => screenState.element })
		Object.defineProperty(Element.prototype, 'requestFullscreen', {
			configurable: true,
			value: async function requestFullscreen(this: Element) {
				screenState.element = this
				document.dispatchEvent(new Event('fullscreenchange'))
			},
		})
		const { emitted } = await setup()

		await fireEvent.click(await screen.findByRole('button', { name: 'Во весь экран' }))
		expect(emitted('fullscreen-change')).toEqual([[true]])
		expect(screen.queryByRole('button', { name: 'Широкий экран' })).toBeNull()

		Reflect.deleteProperty(document, 'fullscreenEnabled')
		Reflect.deleteProperty(document, 'fullscreenElement')
		Reflect.deleteProperty(Element.prototype, 'requestFullscreen')
	})

	it('панель не скрывается, пока фокус в открытом меню', async () => {
		const { root, fake } = await setup({ idleTimeout: 1000 })
		const layer = root.querySelector('.base-media-player__layer') as HTMLElement
		const item = document.createElement('button')
		layer.append(item)
		vi.useFakeTimers()

		fake.emit('play')
		item.focus()
		await nextTick()
		vi.advanceTimersByTime(1000)
		await nextTick()
		expect(root).not.toHaveClass('base-media-player--idle')
	})
})
