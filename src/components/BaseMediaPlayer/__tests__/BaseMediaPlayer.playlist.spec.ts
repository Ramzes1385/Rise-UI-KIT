import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import MediaSlider from '../ui/MediaSlider.vue'
import BaseMediaPlayer from '../ui/BaseMediaPlayer.vue'
import { fakeMedia } from './BaseMediaPlayer.test-utils'
import { BaseDropdownMenu } from '@components/BaseDropdownMenu'
import type { MediaPlaylist } from '../types/MediaPlaylist.types'
import type { DropdownMenuItem } from '@components/BaseDropdownMenu'

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
					{ start: 50, title: 'Эндинг', kind: 'outro' },
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
	const menu = (label: string) => wrapper.findAllComponents(BaseDropdownMenu).find(item => item.props('ariaLabel') === label)
	return { wrapper, video, fake, play, menu }
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

	it('список серий по сезонам; Shift+N и Shift+P', async () => {
		const { wrapper, menu } = await setup({ episode: 'e2' })
		const items = menu('Серии')?.props('items') as DropdownMenuItem[]

		expect(items.map(item => item.label)).toEqual(['Сезон 1', 'Сезон 2'])
		;(items[1].children as DropdownMenuItem[])[0].onUpdateChecked?.(true)
		await wrapper.trigger('keydown', { code: 'KeyN', shiftKey: true })
		await wrapper.trigger('keydown', { code: 'KeyP', shiftKey: true })
		expect(wrapper.emitted('update:episode')).toEqual([['e3'], ['e3'], ['e1']])
		wrapper.unmount()
	})

	it('один сезон — серии сразу в меню; одна серия — меню нет', async () => {
		const single = await setup({ playlists: [SEASONS[0]] })
		expect((single.menu('Серии')?.props('items') as DropdownMenuItem[]).map(item => item.label)).toEqual(['Серия 1', 'Серия 2'])
		single.wrapper.unmount()

		const one = await setup({ playlists: [SEASONS[1]] })
		expect(one.menu('Серии')).toBeUndefined()
		expect(one.wrapper.find('button[aria-label="Следующая серия"]').exists()).toBe(false)
		one.wrapper.unmount()
	})

	it('главы: подсказка на шкале, текущая глава, список глав и «Пропустить опенинг»', async () => {
		const { wrapper, fake, menu } = await setup()
		fake.update({ currentTime: 12 }, 'seeked')
		await nextTick()

		const seek = wrapper.findComponent(MediaSlider)
		expect(seek.props('marks')).toEqual([0, 10, 20, 30, 50])
		expect((seek.props('hoverText') as (value: number) => string)(15)).toBe('0:15 · Опенинг')
		expect((seek.props('hoverText') as (value: number) => string)(0)).toBe('0:00 · Пролог')
		expect(wrapper.get('.base-media-player__chapter').text()).toBe('Опенинг')
		const chapters = menu('Главы')?.props('items') as DropdownMenuItem[]
		expect(chapters.map(item => [item.label, item.isChecked])).toEqual([
			['0:00 · Пролог', false],
			['0:10 · Опенинг', true],
			['0:20 · Серия', false],
			['0:30 · Ранее', false],
			['0:50 · Эндинг', false],
		])
		chapters[2].onUpdateChecked?.(true)
		expect(fake.values.currentTime).toBe(20)

		fake.update({ currentTime: 12 }, 'seeked')
		await nextTick()
		await wrapper.get('.base-media-player__skip').trigger('click')
		expect(fake.values.currentTime).toBe(20)
		fake.update({ currentTime: 35 }, 'seeked')
		await nextTick()
		expect(wrapper.get('.base-media-player__skip').text()).toBe('Пропустить краткое содержание')
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
		expect(autoNext.text()).toBe('Автовоспроизведение')
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
