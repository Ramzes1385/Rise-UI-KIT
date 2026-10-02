import { computed, ref } from 'vue'
import { seriesMedia } from '../media'
import type { TabItem } from '@components/BaseTabs'
import type { BreadcrumbItem } from '@components/BaseBreadcrumbs'
import type { MediaEpisode, MediaPlaylist } from '@components/BaseMediaPlayer'

const sources = [{ src: seriesMedia.video, type: 'video/webm' }]

const crumbs: BreadcrumbItem[] = [{ label: 'Главная', href: '#' }, { label: 'Сериалы', href: '#' }, { label: 'Демо-сериал' }]

const playlists: MediaPlaylist[] = [
	{
		id: 'season-1',
		title: 'Сезон 1',
		episodes: [
			{
				id: 's1e1',
				title: 'Серия 1. Начало',
				description: 'Команда собирает первый плеер и спорит о кнопках.',
				duration: 12,
				poster: seriesMedia.posters[0],
				sources,
			},
			{
				id: 's1e2',
				title: 'Серия 2. Дорога',
				description: 'Плеер отправляется в путь с главами и субтитрами.',
				duration: 12,
				poster: seriesMedia.posters[1],
				sources,
			},
		],
	},
	{
		id: 'season-2',
		title: 'Сезон 2',
		episodes: [
			{
				id: 's2e1',
				title: 'Серия 1. Возвращение',
				description: 'Новая панель серий, мини-плеер и подсветка.',
				duration: 12,
				poster: seriesMedia.posters[2],
				sources,
			},
		],
	},
]

const seasons: TabItem[] = playlists.map(playlist => ({ id: playlist.id, label: playlist.title }))

const genres = ['2026', 'Фантастика', 'Комедия', '12+']

const cast = [
	{ name: 'Мира Звёздная', role: 'Капитан Вега', photo: seriesMedia.avatars[0] },
	{ name: 'Лев Громов', role: 'Инженер Кай', photo: seriesMedia.avatars[1] },
	{ name: 'Ася Ветрова', role: 'Штурман Лира', photo: seriesMedia.avatars[2] },
]

export function setup() {
	const episode = ref('s1e1')
	const season = ref('season-1')

	const episodes = computed<MediaEpisode[]>(() => playlists.find(playlist => playlist.id === season.value)?.episodes ?? [])

	function select(id: string): void {
		episode.value = id
	}

	function syncSeason(id: string): void {
		const owner = playlists.find(playlist => playlist.episodes.some(item => item.id === id))
		if (owner) season.value = owner.id
	}

	return { seriesMedia, crumbs, playlists, seasons, genres, cast, episode, season, episodes, select, syncSeason }
}
