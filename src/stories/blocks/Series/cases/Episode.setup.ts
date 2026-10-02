import { computed, ref } from 'vue'
import { seriesMedia } from '../media'
import type { TabItem } from '@components/BaseTabs'
import type { BreadcrumbItem } from '@components/BaseBreadcrumbs'
import type { CommentItem, CommentReply } from '@components/BaseCommentThread'
import type { MediaEpisode, MediaPlaylist } from '@components/BaseMediaPlayer'

const cover = seriesMedia.cover

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

const viewer = { name: 'Вы', avatar: seriesMedia.viewers[0] }

const now = new Date(2025, 4, 15, 10, 30)

const firstComments: CommentItem[] = [
	{
		id: 'c1',
		author: { name: 'Кира Лунная', avatar: seriesMedia.viewers[1] },
		text: 'Сцена со спором о кнопках — лучшая в сезоне. Жду, когда найдут субтитры!',
		date: new Date(2025, 4, 15, 8, 10),
		likes: 4,
		replies: [
			{
				id: 'c2',
				author: { name: 'Тимур Ветров', avatar: seriesMedia.viewers[2] },
				text: 'Без спойлеров, пожалуйста: я только на первой серии.',
				date: new Date(2025, 4, 15, 9, 45),
				likes: 1,
			},
		],
	},
]

function withReply(comments: CommentItem[], reply: CommentItem, parentId: string | null): CommentItem[] {
	if (parentId === null) return [...comments, reply]
	return comments.map(comment =>
		comment.id === parentId
			? { ...comment, replies: [...(comment.replies ?? []), reply] }
			: { ...comment, replies: withReply(comment.replies ?? [], reply, parentId) },
	)
}

function withLike(comments: CommentItem[], id: string, isLiked: boolean): CommentItem[] {
	return comments.map(comment =>
		comment.id === id
			? { ...comment, isLiked, likes: (comment.likes ?? 0) + (isLiked ? 1 : -1) }
			: { ...comment, replies: withLike(comment.replies ?? [], id, isLiked) },
	)
}

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

	const comments = ref(firstComments)
	const added = ref(0)

	function reply({ parentId, text }: CommentReply): void {
		added.value += 1
		comments.value = withReply(comments.value, { id: `new-${added.value}`, author: viewer, text, date: now }, parentId)
	}

	function like({ id, isLiked }: { id: string; isLiked: boolean }): void {
		comments.value = withLike(comments.value, id, isLiked)
	}

	return {
		cover,
		crumbs,
		playlists,
		seasons,
		genres,
		cast,
		viewer,
		now,
		episode,
		season,
		episodes,
		select,
		syncSeason,
		comments,
		reply,
		like,
	}
}
