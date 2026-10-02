import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import BaseMediaPlayer from '../../ui/BaseMediaPlayer.vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import type { FakeMediaValues } from '../utils/BaseMediaPlayer.test-utils'
import { fakeMedia, playerMenu } from '../utils/BaseMediaPlayer.test-utils'
import type { BaseMediaPlayerProps } from '../../types/BaseMediaPlayer.types'

const SOURCE = '/media/demo.webm'

const mountedWrappers: VueWrapper[] = []

afterEach(() => {
	for (const wrapper of mountedWrappers.splice(0)) wrapper.unmount()
})

function mountPlayer(props: BaseMediaPlayerProps): VueWrapper {
	const wrapper = mount(BaseMediaPlayer, { props, attachTo: document.body })
	mountedWrappers.push(wrapper)
	return wrapper
}

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
		vi.unstubAllGlobals()
		vi.restoreAllMocks()
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

	it('панель скорости: «+» на пределе — aria-disabled, фокус остаётся, нажатие не меняет скорость', async () => {
		const wrapper = mountPlayer({ sources: SOURCE, title: 'Демо' })
		await nextTick()
		const video = wrapper.get('video').element as HTMLVideoElement
		const rate = async (value: number): Promise<void> => {
			video.playbackRate = value
			video.dispatchEvent(new Event('ratechange'))
			await nextTick()
		}
		await wrapper.get('button[aria-label="Скорость воспроизведения"]').trigger('click')
		await rate(3.95)
		const faster = wrapper.get('button[aria-label="Быстрее"]')
		const slower = wrapper.get('button[aria-label="Медленнее"]')

		;(faster.element as HTMLButtonElement).focus()
		await faster.trigger('click')
		expect(video.playbackRate).toBe(4)
		await rate(4)

		expect(faster.attributes('aria-disabled')).toBe('true')
		expect(faster.attributes('disabled')).toBeUndefined()
		expect(document.activeElement).toBe(faster.element)
		await faster.trigger('click')
		expect(video.playbackRate).toBe(4)

		await rate(0.25)
		expect(slower.attributes('aria-disabled')).toBe('true')
		await slower.trigger('click')
		expect(video.playbackRate).toBe(0.25)
	})

	it('панель скорости: ползунок, «−» и «+», готовые значения по порядку; меню качества — источники с подписью', async () => {
		vi.spyOn(HTMLMediaElement.prototype, 'canPlayType').mockReturnValue('maybe')
		const sources = [
			{ src: '/media/hd.webm', type: 'video/webm', label: '720p' },
			{ src: '/media/sd.webm', type: 'video/webm', label: '360p' },
			{ src: '/media/raw.webm', type: 'video/webm' },
		]
		const wrapper = mountPlayer({ sources, title: 'Демо', playbackRates: [2, 1, 0.5] })
		await nextTick()
		const video = wrapper.get('video').element as HTMLVideoElement
		const rate = async (value: number): Promise<void> => {
			video.playbackRate = value
			video.dispatchEvent(new Event('ratechange'))
			await nextTick()
		}
		const quality = playerMenu(wrapper, 'Качество')

		await wrapper.get('button[aria-label="Скорость воспроизведения"]').trigger('click')
		const panel = wrapper.get('[role="group"][aria-label="Скорость воспроизведения"]')
		expect(panel.findAll('.base-media-player__speed-preset').map(chip => chip.text())).toEqual(['0,5', '1', '2'])
		expect(panel.get('.base-media-player__speed-value').text()).toBe('1,00×')
		expect(document.activeElement).toBe(panel.get('input[type="range"]').element)
		await panel.findAll('.base-media-player__speed-preset')[2].trigger('click')
		expect(video.playbackRate).toBe(2)
		await rate(2)
		expect(panel.get('.base-media-player__speed-preset--active').text()).toBe('2')
		await panel.get('button[aria-label="Медленнее"]').trigger('click')
		expect(video.playbackRate).toBe(1.95)
		await rate(4)
		expect(panel.get('button[aria-label="Быстрее"]').attributes('aria-disabled')).toBe('true')
		await panel.get('button[aria-label="Быстрее"]').trigger('click')
		await panel.get('input[type="range"]').setValue('0.35')
		expect(video.playbackRate).toBe(0.35)
		await rate(0.25)
		await panel.get('button[aria-label="Медленнее"]').trigger('click')
		expect(video.playbackRate).toBe(0.25)
		await rate(1)
		await panel.get('button[aria-label="Быстрее"]').trigger('click')
		expect(video.playbackRate).toBe(1.05)
		await rate(0.25)
		expect(wrapper.get('button[aria-label="Скорость воспроизведения"]').text()).toBe('0,25×')

		expect(quality.options()).toEqual(['Авто (720p)', '720p', '360p'])
		expect(quality.checked()).toBe('Авто (720p)')
		quality.pick('360p')
		await nextTick()
		expect(video.getAttribute('src')).toBe('/media/sd.webm')
		expect(wrapper.get('button[aria-label="Качество"]').text()).toBe('360p')
		expect(quality.options()[0]).toBe('Авто')
		quality.pick('Авто')
		await nextTick()
		expect(video.getAttribute('src')).toBe('/media/hd.webm')
		expect(wrapper.get('button[aria-label="Качество"]').text()).toBe('720p')
	})

	it('меню качества без высоты кадра: подписи в порядке источников, без «Авто»', async () => {
		vi.spyOn(HTMLMediaElement.prototype, 'canPlayType').mockReturnValue('maybe')
		const sources = [
			{ src: '/media/cut.webm', type: 'video/webm', label: 'Режиссёрская' },
			{ src: '/media/tv.webm', type: 'video/webm', label: 'Телеверсия' },
		]
		const wrapper = mountPlayer({ sources, title: 'Демо' })
		await nextTick()
		const quality = playerMenu(wrapper, 'Качество')

		expect(quality.options()).toEqual(['Режиссёрская', 'Телеверсия'])
		expect(quality.checked()).toBe('Режиссёрская')
	})

	it('высота кадра без подписи — «<height>p»; «Авто» по размеру плеера', async () => {
		vi.spyOn(HTMLMediaElement.prototype, 'canPlayType').mockReturnValue('maybe')
		vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(400)
		const sources = [
			{ src: '/media/a.webm', type: 'video/webm', height: 1080 },
			{ src: '/media/b.webm', type: 'video/webm', height: 480 },
		]
		const wrapper = mountPlayer({ sources, title: 'Демо' })
		await nextTick()
		const quality = playerMenu(wrapper, 'Качество')

		expect(quality.options()).toEqual(['Авто (480p)', '1080p', '480p'])
		expect(wrapper.get('video').attributes('src')).toBe('/media/b.webm')
	})

	it('без ResizeObserver «Авто» выбирает качество по высоте плеера при монтировании; devicePixelRatio 0 считается за 1', async () => {
		vi.stubGlobal('ResizeObserver', undefined)
		vi.stubGlobal('devicePixelRatio', 0)
		vi.spyOn(HTMLMediaElement.prototype, 'canPlayType').mockReturnValue('maybe')
		vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(700)
		const sources = [
			{ src: '/media/a.webm', type: 'video/webm', height: 1080 },
			{ src: '/media/b.webm', type: 'video/webm', height: 720 },
			{ src: '/media/c.webm', type: 'video/webm', height: 480 },
		]
		const wrapper = mountPlayer({ sources, title: 'Демо' })
		await nextTick()

		expect(playerMenu(wrapper, 'Качество').options()).toEqual(['Авто (720p)', '1080p', '720p', '480p'])
		expect(wrapper.get('video').attributes('src')).toBe('/media/b.webm')
	})

	it('меню открываются кнопками и закрываются выбором: качество, субтитры, озвучка, главы; серии — в панели', async () => {
		vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()
		vi.spyOn(HTMLMediaElement.prototype, 'canPlayType').mockReturnValue('maybe')
		const sources = [
			{ src: '/media/hd.webm', type: 'video/webm', label: '720p' },
			{ src: '/media/sd.webm', type: 'video/webm', label: '360p' },
		]
		const chapters = [
			{ start: 0, title: 'Пролог' },
			{ start: 10, title: 'Опенинг' },
		]
		const playlists = [
			{
				id: 's1',
				title: 'Сезон 1',
				episodes: [
					{ id: 'e1', title: 'Серия 1', sources, chapters },
					{ id: 'e2', title: 'Серия 2', sources },
				],
			},
			{ id: 's2', title: 'Сезон 2', episodes: [{ id: 'e3', title: 'Серия 3', sources }] },
		]
		const audioTracks = [{ label: 'Оригинал' }, { src: '/media/dub.m4a', label: 'Студия' }]
		const wrapper = mountPlayer({ title: 'Демо', playlists, audioTracks })
		const video = wrapper.get('video').element as HTMLVideoElement
		const fake = fakeMedia(video, { duration: 60 })
		await nextTick()
		fake.emit('loadedmetadata')
		await nextTick()
		const isOpen = (): boolean => wrapper.find('.base-media-player__menu').exists()
		const choose = async (opener: string, ...labels: string[]): Promise<void> => {
			await wrapper.get(opener).trigger('click')
			for (const label of labels) {
				await wrapper
					.findAll('[role^="menuitem"]')
					.find(item => item.text().startsWith(label))
					?.trigger('click')
				await nextTick()
			}
		}

		await choose('button[aria-label="Качество"]', '360p')
		expect(isOpen()).toBe(false)
		expect(video.getAttribute('src')).toBe('/media/sd.webm')
		await choose('button[aria-label="Субтитры"]', 'Выкл')
		expect(isOpen()).toBe(false)
		await choose('button[aria-label="Озвучка"]', 'Студия')
		expect(isOpen()).toBe(false)
		expect(wrapper.get('button[aria-label="Озвучка"]').text()).toBe('')
		expect(wrapper.get('button[aria-label="Озвучка"]').attributes('data-tooltip')).toBe('Озвучка: Студия')
		await wrapper.get('.base-media-player__chapter').trigger('click')
		await wrapper
			.findAll('.base-media-player__chapter-item')
			.find(item => item.text().startsWith('Опенинг'))
			?.trigger('click')
		expect(wrapper.find('.base-media-player__chapters').exists()).toBe(false)
		expect(fake.values.currentTime).toBe(10)
		await wrapper.get('button[aria-label="Серии"]').trigger('click')
		await wrapper
			.findAll('.base-media-player__episodes-tab')
			.find(tab => tab.text() === 'Сезон 2')
			?.trigger('click')
		await wrapper.get('.base-media-player__episode-card').trigger('click')
		expect(wrapper.find('.base-media-player__episodes').exists()).toBe(false)
		expect(wrapper.emitted('update:episode')).toEqual([['e3']])
	})

	it('кнопки перемотки: ±30, ±10 и ±5 с — во втором ряду, он раскрывается кнопкой «Точная перемотка»', async () => {
		const { fake } = await setup({}, { currentTime: 40 })
		const seekBy = async (name: string, expected: number): Promise<void> => {
			await fireEvent.click(screen.getByRole('button', { name }))
			expect(fake.values.currentTime).toBe(expected)
		}

		expect(screen.queryByRole('button', { name: 'Назад на 10 с' })).toBeNull()
		await fireEvent.click(screen.getByRole('button', { name: 'Точная перемотка' }))
		expect(screen.getByRole('button', { name: 'Точная перемотка' })).toHaveAttribute('aria-expanded', 'true')
		const row = document.querySelector('.base-media-player__bar--secondary') as HTMLElement
		expect([...row.querySelectorAll('button')].map(button => button.getAttribute('aria-label'))).toEqual([
			'Назад на 30 с',
			'Назад на 10 с',
			'Назад на 5 с',
			'Вперёд на 5 с',
			'Вперёд на 10 с',
			'Вперёд на 30 с',
			'Подсветка',
		])
		await seekBy('Назад на 30 с', 10)
		await seekBy('Вперёд на 10 с', 20)
		await seekBy('Назад на 5 с', 15)
		await seekBy('Вперёд на 5 с', 20)
		await seekBy('Назад на 10 с', 10)
		await seekBy('Вперёд на 30 с', 40)
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
