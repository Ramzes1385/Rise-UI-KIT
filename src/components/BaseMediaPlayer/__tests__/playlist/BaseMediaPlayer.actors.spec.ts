import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import BaseMediaPlayer from '../../ui/BaseMediaPlayer.vue'
import { fakeMedia } from '../utils/BaseMediaPlayer.test-utils'
import type { MediaPlaylist } from '../../types/content/MediaPlaylist.types'

const SEASON_CAST = [
	{ name: 'Мира Звёздная', role: 'Капитан Вега', photo: '/mira.webp', links: ['https://www.instagram.com/mira/', 'https://t.me/mira'] },
	{ name: 'Тимур Облаков' },
]

const SEASONS: MediaPlaylist[] = [
	{
		id: 's1',
		title: 'Сезон 1',
		actors: SEASON_CAST,
		episodes: [
			{ id: 'e1', title: 'Серия 1', sources: '/e1.webm' },
			{ id: 'e2', title: 'Серия 2', sources: '/e2.webm', actors: [{ name: 'Ева Туманова', role: 'Гостья' }] },
		],
	},
	{ id: 's2', title: 'Сезон 2', episodes: [{ id: 'e3', title: 'Серия 3', sources: '/e3.webm' }] },
]

async function setup(props: Record<string, unknown> = {}) {
	vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()
	const wrapper = mount(BaseMediaPlayer, { props: { title: 'Сериал', playlists: SEASONS, ...props }, attachTo: document.body })
	const fake = fakeMedia(wrapper.get('video').element as HTMLVideoElement, { duration: 60 })
	await nextTick()
	fake.emit('loadedmetadata')
	await nextTick()
	return { wrapper }
}

async function openPanel(wrapper: Awaited<ReturnType<typeof setup>>['wrapper']) {
	await wrapper.get('.base-media-player__episodes-button').trigger('click')
	await nextTick()
	return wrapper.get('.base-media-player__episodes')
}

describe('BaseMediaPlayer: «В ролях»', () => {
	afterEach(() => {
		document.body.innerHTML = ''
		vi.restoreAllMocks()
	})

	it('вкладка «В ролях»: фото или инициалы, роль, ссылки на соцсети в новой вкладке', async () => {
		const { wrapper } = await setup()
		const panel = await openPanel(wrapper)
		const [episodes, actors] = panel.findAll('.base-media-player__episodes-view')

		expect(episodes.attributes('aria-pressed')).toBe('true')
		expect(panel.find('.base-media-player__episodes-title').exists()).toBe(false)
		await actors.trigger('click')
		expect(actors.attributes('aria-pressed')).toBe('true')
		expect(panel.find('.base-media-player__episodes-list').exists()).toBe(false)
		expect(panel.find('.base-media-player__episodes-tabs').exists()).toBe(false)
		expect(panel.find('.base-media-player__actors-title').exists()).toBe(false)
		const cards = panel.findAll('.base-media-player__actor')
		expect(cards.map(card => card.get('.base-media-player__actor-name').text())).toEqual(['Мира Звёздная', 'Тимур Облаков'])
		expect(cards[0].get('.base-media-player__actor-role').text()).toBe('Капитан Вега')
		expect(cards[0].get('img').attributes('src')).toBe('/mira.webp')
		expect(cards[1].find('.base-media-player__actor-role').exists()).toBe(false)
		expect(cards[1].text()).toContain('ТО')
		expect(cards[1].find('.base-media-player__actor-links').exists()).toBe(false)
		const links = cards[0].findAll('a')
		expect(links.map(link => link.attributes('aria-label'))).toEqual(['Instagram: Мира Звёздная', 'Telegram: Мира Звёздная'])
		expect(links[0].attributes()).toMatchObject({
			href: 'https://www.instagram.com/mira/',
			target: '_blank',
			rel: 'noopener noreferrer',
		})
		await episodes.trigger('click')
		expect(panel.find('.base-media-player__episodes-list').exists()).toBe(true)
	})

	it('у серии свои актёры — две группы; при новом открытии панель показывает серии; без актёров вкладки нет', async () => {
		const { wrapper } = await setup({ episode: 'e2' })
		let panel = await openPanel(wrapper)
		await panel.findAll('.base-media-player__episodes-view')[1].trigger('click')

		expect(panel.findAll('.base-media-player__actors-title').map(title => title.text())).toEqual(['В этой серии', 'В сезоне'])
		expect(panel.findAll('[role="group"]').map(group => group.attributes('aria-label'))).toEqual(['В этой серии', 'В сезоне'])
		await wrapper.get('.base-media-player__episodes-button').trigger('click')
		await nextTick()
		panel = await openPanel(wrapper)
		expect(panel.findAll('.base-media-player__episodes-view')[0].attributes('aria-pressed')).toBe('true')
		wrapper.unmount()

		const plain = await setup({ episode: 'e3' })
		const plainPanel = await openPanel(plain.wrapper)
		expect(plainPanel.find('.base-media-player__episodes-views').exists()).toBe(false)
		expect(plainPanel.get('.base-media-player__episodes-title').text()).toBe('Серии')
	})
})
