import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import MediaSlider from '../ui/MediaSlider.vue'
import { fireEvent } from '@testing-library/vue'
import BaseMediaPlayer from '../ui/BaseMediaPlayer.vue'
import { fakeMedia } from './BaseMediaPlayer.test-utils'
import type { MediaPlaylist } from '../types/MediaPlaylist.types'

const SEASONS: MediaPlaylist[] = [
	{
		id: 's1',
		title: 'Сезон 1',
		episodes: [
			{
				id: 'e1',
				title: 'Серия 1',
				sources: '/e1.webm',
				chapters: [
					{ start: 0, title: 'Пролог' },
					{ start: 10, end: 20, title: 'Опенинг', kind: 'intro' },
					{ start: 20, title: 'Серия' },
					{ start: 30, end: 40, title: 'Ранее', kind: 'recap' },
					{ start: 50, title: 'Эндинг', kind: 'outro', color: '#a855f7' },
				],
			},
			{ id: 'e2', title: 'Серия 2', sources: '/e2.webm', poster: '/e2.webp' },
		],
	},
	{ id: 's2', title: 'Сезон 2', episodes: [{ id: 'e3', title: 'Серия 3', sources: '/e3.webm' }] },
]

async function setup(props: Record<string, unknown> = {}) {
	const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()
	const wrapper = mount(BaseMediaPlayer, { props: { title: 'Сериал', playlists: SEASONS, ...props }, attachTo: document.body })
	const video = wrapper.get('video').element as HTMLVideoElement
	const fake = fakeMedia(video, { duration: 60 })
	await nextTick()
	fake.emit('loadedmetadata')
	await nextTick()
	return { wrapper, video, fake, play }
}

describe('BaseMediaPlayer: серии и главы', () => {
	afterEach(() => {
		document.body.innerHTML = ''
		localStorage.clear()
		vi.restoreAllMocks()
	})

	it('первая серия: название, источник; «Следующая серия» переключает и запускает', async () => {
		const { wrapper, video, fake } = await setup()

		expect(wrapper.attributes('aria-label')).toBe('Сериал. Серия 1')
		expect(wrapper.get('.base-media-player__episode').text()).toBe('· Серия 1')
		expect(video.getAttribute('src')).toBe('/e1.webm')
		expect(wrapper.find('button[aria-label="Предыдущая серия"]').exists()).toBe(false)
		await wrapper.get('button[aria-label="Следующая серия"]').trigger('click')
		await nextTick()
		expect(video.getAttribute('src')).toBe('/e2.webm')
		expect(video.getAttribute('poster')).toBe('/e2.webp')
		expect(fake.play).toHaveBeenCalledOnce()
		await wrapper.get('button[aria-label="Предыдущая серия"]').trigger('click')
		expect(wrapper.emitted('update:episode')).toEqual([['e2'], ['e1']])
		wrapper.unmount()
	})

	it('панель серий: вкладки сезонов, карточки с номером, обложкой, описанием и длительностью; Shift+N и Shift+P', async () => {
		const seasons: MediaPlaylist[] = [
			{
				...SEASONS[0],
				episodes: [
					SEASONS[0].episodes[0],
					{ ...SEASONS[0].episodes[1], description: 'Герои в пути', duration: 1450 },
					{ id: 'e2b', title: 'Спешл', sources: '/sp.webm', poster: 'javascript:alert(1)' },
				],
			},
			SEASONS[1],
		]
		const { wrapper } = await setup({ playlists: seasons, episode: 'e2' })
		const button = wrapper.get('button[aria-label="Серии"]')
		const panel = () => wrapper.find('.base-media-player__episodes')
		const cards = () => wrapper.findAll('.base-media-player__episode-card')

		expect(panel().exists()).toBe(false)
		await button.trigger('click')
		await nextTick()
		expect(button.attributes('aria-expanded')).toBe('true')
		expect(panel().attributes('aria-label')).toBe('Серии')
		const tabs = panel().findAll('.base-media-player__episodes-tab')
		expect(tabs.map(tab => [tab.text(), tab.attributes('aria-pressed')])).toEqual([
			['Сезон 1', 'true'],
			['Сезон 2', 'false'],
		])
		expect(cards().map(card => card.find('.base-media-player__episode-number').text())).toEqual(['1', '2', '3'])
		const current = cards()[1]
		expect(current.attributes('aria-current')).toBe('true')
		expect(document.activeElement).toBe(current.element)
		expect(current.get('img').attributes('src')).toBe('/e2.webp')
		expect(current.get('.base-media-player__episode-duration').text()).toBe('24:10')
		expect(current.get('.base-media-player__episode-description').text()).toBe('Герои в пути')
		expect(cards()[2].find('img').exists()).toBe(false)
		await tabs[1].trigger('click')
		expect(cards().map(card => card.get('.base-media-player__episode-name').text())).toEqual(['Серия 3'])
		;(cards()[0].element as HTMLElement).focus()
		await cards()[0].trigger('click')
		expect(panel().exists()).toBe(false)
		expect(document.activeElement).toBe(button.element)
		await wrapper.trigger('keydown', { code: 'KeyN', shiftKey: true })
		await wrapper.trigger('keydown', { code: 'KeyP', shiftKey: true })
		expect(wrapper.emitted('update:episode')).toEqual([['e3'], ['e2b'], ['e1']])
		wrapper.unmount()
	})

	it('панель серий закрывают крестик, Escape (фокус — на кнопку «Серии»), щелчок мимо и повторное нажатие кнопки', async () => {
		const { wrapper } = await setup()
		const button = wrapper.get('button[aria-label="Серии"]')
		const panel = () => wrapper.find('.base-media-player__episodes')
		const open = async (): Promise<void> => {
			await button.trigger('click')
			await nextTick()
		}

		await open()
		await panel().get('button[aria-label="Закрыть"]').trigger('click')
		expect(panel().exists()).toBe(false)
		expect(document.activeElement).toBe(button.element)
		await open()
		await panel().trigger('keydown', { key: 'ArrowDown' })
		expect(panel().exists()).toBe(true)
		await panel().trigger('keydown', { key: 'Escape' })
		expect(panel().exists()).toBe(false)
		await open()
		await fireEvent.pointerDown(panel().element)
		await fireEvent.pointerDown(button.element)
		expect(panel().exists()).toBe(true)
		await fireEvent.pointerDown(wrapper.get('video').element)
		expect(panel().exists()).toBe(false)
		await open()
		await button.trigger('click')
		expect(panel().exists()).toBe(false)
		wrapper.unmount()
	})

	it('панель глав закрывают Escape и щелчок мимо; панели глав и серий не открываются вместе; с открытой панелью панель управления не прячется', async () => {
		vi.useFakeTimers()
		const { wrapper, fake } = await setup({ idleTimeout: 1000 })
		fake.update({ currentTime: 12, paused: false }, 'play')
		await nextTick()
		const chapter = wrapper.get('.base-media-player__chapter')
		const chapters = () => wrapper.find('.base-media-player__chapters')
		const episodes = () => wrapper.find('.base-media-player__episodes')

		await chapter.trigger('click')
		await vi.advanceTimersByTimeAsync(3000)
		expect(wrapper.classes()).not.toContain('base-media-player--idle')
		await chapters().trigger('keydown', { key: 'ArrowDown' })
		expect(chapters().exists()).toBe(true)
		await chapters().trigger('keydown', { key: 'Escape' })
		expect(chapters().exists()).toBe(false)
		await chapter.trigger('click')
		await fireEvent.pointerDown(chapters().element)
		await fireEvent.pointerDown(chapter.element)
		expect(chapters().exists()).toBe(true)
		await fireEvent.pointerDown(wrapper.get('video').element)
		expect(chapters().exists()).toBe(false)
		await chapter.trigger('click')
		await wrapper.get('button[aria-label="Серии"]').trigger('click')
		expect([chapters().exists(), episodes().exists()]).toEqual([false, true])
		await chapter.trigger('click')
		expect([chapters().exists(), episodes().exists()]).toEqual([true, false])
		await wrapper.get('.base-media-player__chapters button[aria-label="Закрыть"]').trigger('click')
		expect(chapters().exists()).toBe(false)
		vi.useRealTimers()
		wrapper.unmount()
	})

	it('один сезон — без вкладок; одна серия — кнопки «Серии» нет', async () => {
		const single = await setup({ playlists: [SEASONS[0]] })
		await single.wrapper.get('button[aria-label="Серии"]').trigger('click')
		expect(single.wrapper.find('.base-media-player__episodes-tabs').exists()).toBe(false)
		expect(single.wrapper.findAll('.base-media-player__episode-name').map(name => name.text())).toEqual(['Серия 1', 'Серия 2'])
		single.wrapper.unmount()

		const one = await setup({ playlists: [SEASONS[1]] })
		expect(one.wrapper.find('button[aria-label="Серии"]').exists()).toBe(false)
		expect(one.wrapper.find('button[aria-label="Следующая серия"]').exists()).toBe(false)
		one.wrapper.unmount()
	})

	it('главы: подсказка на шкале, текущая глава, панель глав слева и «Пропустить опенинг»', async () => {
		const { wrapper, fake } = await setup()
		fake.update({ currentTime: 12 }, 'seeked')
		await nextTick()

		const seek = wrapper.findComponent(MediaSlider)
		expect(seek.props('segments')).toEqual([
			{ start: 0, end: 10 },
			{ start: 10, end: 20 },
			{ start: 20, end: 30 },
			{ start: 30, end: 40 },
			{ start: 40, end: 50 },
			{ start: 50, end: 60, color: '#a855f7' },
		])
		const slider = wrapper.get('.base-media-player__seek').element as HTMLElement
		slider.getBoundingClientRect = () => ({ left: 0, width: 600 }) as DOMRect
		const hover = async (clientX: number): Promise<string> => {
			await fireEvent.pointerMove(slider, { clientX })
			return wrapper.get('.base-media-player__preview').text()
		}
		expect(await hover(150)).toBe('Опенинг0:15')
		expect(await hover(450)).toBe('0:45')
		const button = wrapper.get('.base-media-player__chapter')
		expect([button.text(), button.attributes('aria-label')]).toEqual(['Опенинг', 'Главы: Опенинг'])
		await button.trigger('click')
		expect(button.attributes('aria-expanded')).toBe('true')
		const panel = wrapper.get('.base-media-player__chapters')
		expect(panel.attributes('aria-label')).toBe('Главы')
		const items = panel.findAll('.base-media-player__chapter-item')
		expect(items.map(item => [item.text(), item.attributes('aria-current') ?? '', item.attributes('style')])).toEqual([
			['Пролог0:00', '', '--segment-color: var(--media-primary); --chapter-progress: 1;'],
			['Опенинг0:10', 'true', '--segment-color: var(--media-primary); --chapter-progress: 0.2;'],
			['Серия0:20', '', '--segment-color: var(--media-primary); --chapter-progress: 0;'],
			['Ранее0:30', '', '--segment-color: var(--media-primary); --chapter-progress: 0;'],
			['Эндинг0:50', '', '--segment-color: #a855f7; --chapter-progress: 0;'],
		])
		await vi.waitFor(() => expect(document.activeElement).toBe(items[1].element))
		await items[2].trigger('click')
		expect(fake.values.currentTime).toBe(20)
		expect(wrapper.find('.base-media-player__chapters').exists()).toBe(false)
		expect(document.activeElement).toBe(button.element)

		fake.update({ currentTime: 12 }, 'seeked')
		await nextTick()
		await wrapper.get('.base-media-player__skip').trigger('click')
		expect(fake.values.currentTime).toBe(20)
		fake.update({ currentTime: 35 }, 'seeked')
		await nextTick()
		expect(wrapper.get('.base-media-player__skip').text()).toBe('Пропустить краткое содержание')
		wrapper.unmount()
	})

	it('глава за концом записи на шкале не рисуется', async () => {
		const chapters = [
			{ start: 0, title: 'Начало' },
			{ start: 70, title: 'После титров' },
		]
		const { wrapper } = await setup({
			playlists: [{ id: 's', title: 'С', episodes: [{ id: 'x', title: 'X', sources: '/x.webm', chapters }] }],
		})

		expect(wrapper.findComponent(MediaSlider).props('segments')).toEqual([{ start: 0, end: 60 }])
		wrapper.unmount()
	})

	it('«Пропустить эндинг» в конце серии включает следующую; без следующей — перематывает', async () => {
		const { wrapper, fake } = await setup()
		fake.update({ currentTime: 55 }, 'seeked')
		await nextTick()

		expect(wrapper.get('.base-media-player__skip').text()).toBe('Пропустить эндинг')
		await wrapper.get('.base-media-player__skip').trigger('click')
		expect(wrapper.emitted('update:episode')).toEqual([['e2']])
		wrapper.unmount()

		const last = await setup({ playlists: [{ ...SEASONS[0], episodes: [SEASONS[0].episodes[0]] }] })
		last.fake.update({ currentTime: 55 }, 'seeked')
		await nextTick()
		await last.wrapper.get('.base-media-player__skip').trigger('click')
		expect(last.fake.values.currentTime).toBe(60)
		last.wrapper.unmount()
	})

	it('после конца — отсчёт до следующей серии: «Смотреть», «Отмена» и выключенное автовоспроизведение', async () => {
		const { wrapper, fake } = await setup()
		fake.update({ paused: true, ended: true }, 'ended')
		await nextTick()

		expect(wrapper.get('.base-media-player__next-title').text()).toBe('Следующая серия через 5')
		expect(wrapper.get('.base-media-player__next-episode').text()).toBe('Следующая серия: Серия 2')
		await wrapper.get('.base-media-player__next-actions button:last-child').trigger('click')
		expect(wrapper.find('.base-media-player__next').exists()).toBe(false)
		fake.update({ ended: false }, 'play')
		await nextTick()
		fake.update({ paused: true, ended: true }, 'ended')
		await nextTick()
		await wrapper.get('.base-media-player__next-actions button').trigger('click')
		expect(wrapper.emitted('update:episode')).toEqual([['e2']])

		const autoNext = wrapper.get('button[role="switch"]')
		expect(autoNext.attributes('aria-checked')).toBe('true')
		expect(autoNext.attributes('aria-label')).toBe('Автовоспроизведение')
		await autoNext.trigger('click')
		expect(wrapper.emitted('update:isAutoNext')).toEqual([[false]])
		expect(autoNext.attributes('aria-checked')).toBe('false')
		wrapper.unmount()
	})

	it('позиция запоминается для каждой серии; без плейлистов и источников — ошибка «недоступна»', async () => {
		localStorage.setItem('rise-media:show:e1', '30')
		const { wrapper } = await setup({ storageKey: 'show' })
		expect(wrapper.text()).toContain('Продолжить с 0:30?')
		wrapper.unmount()

		const empty = await setup({ playlists: undefined })
		expect(empty.wrapper.attributes('aria-label')).toBe('Сериал')
		expect(empty.wrapper.get('[role="alert"]').text()).toContain('Запись недоступна')
		empty.wrapper.unmount()
	})
})
