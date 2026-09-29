import { formatMediaTime } from '@utils/mediaUtils'
import { computed, nextTick, ref, watch } from 'vue'
import { UI_PLAYER, formatMessage } from './messages'
import { useMediaChapters } from './useMediaChapters'
import { useMediaPlaylist } from './useMediaPlaylist'
import { useNextCountdown } from './useNextCountdown'
import type { MediaSliderSegment } from '../types/MediaSlider.types'
import type { MediaActions, MediaState } from '../types/MediaCore.types'
import type { MediaMenuItem, MediaMenuList } from '../types/MediaMenu.types'
import type { MediaPlayerProps, BaseMediaPlayerEmits } from '../types/BaseMediaPlayer.types'
import type { MediaClip, MediaEpisode, MediaChapterKind, MediaChapterRange } from '../types/MediaPlaylist.types'

const CHAPTER_COLORS = 8

function chapterSegments(chapters: MediaChapterRange[], duration: number): MediaSliderSegment[] {
	if (chapters.length === 0 || !(duration > 0)) return []
	const segments: MediaSliderSegment[] = []
	let cursor = 0
	chapters.forEach((chapter, index) => {
		const start = Math.min(duration, Math.max(cursor, chapter.start))
		const end = Math.min(duration, chapter.end)
		if (start > cursor) segments.push({ start: cursor, end: start })
		if (end <= start) return
		segments.push({ start, end, color: chapter.color ?? `var(--media-chapter-${(index % CHAPTER_COLORS) + 1})` })
		cursor = end
	})
	return cursor < duration ? [...segments, { start: cursor, end: duration }] : segments
}

const SKIP_LABELS: Record<MediaChapterKind, () => string> = {
	intro: () => UI_PLAYER.SKIP_INTRO,
	outro: () => UI_PLAYER.SKIP_OUTRO,
	recap: () => UI_PLAYER.SKIP_RECAP,
}

function pickClip(...levels: Array<MediaClip | null | undefined>): MediaClip | null {
	return levels.find(level => level !== undefined) ?? null
}

function useAutoNext(props: MediaPlayerProps, emit: BaseMediaPlayerEmits) {
	const local = ref(true)
	return {
		isAutoNext: computed(() => props.isAutoNext ?? local.value),
		setAutoNext(value: boolean): void {
			local.value = value
			emit('update:isAutoNext', value)
		},
	}
}

function episodeMenu(playlist: ReturnType<typeof useMediaPlaylist>): MediaMenuList {
	const current = playlist.currentEpisode.value
	const items = (episodes: MediaEpisode[]): MediaMenuItem[] =>
		episodes.map(episode => ({
			id: episode.id,
			label: episode.title,
			isChecked: episode === current,
			onSelect: () => playlist.selectEpisode(episode.id),
		}))
	const lists = playlist.playlists.value
	if (lists.length === 1) return { title: UI_PLAYER.EPISODES, items: items(lists[0].episodes) }
	return {
		title: UI_PLAYER.EPISODES,
		items: lists.map(list => ({
			id: list.id,
			label: list.title,
			hint: list.episodes.includes(current as MediaEpisode) ? current?.title : undefined,
			children: { title: list.title, items: items(list.episodes) },
		})),
	}
}

export function usePlayerPlaylist(props: MediaPlayerProps, emit: BaseMediaPlayerEmits) {
	const playlist = useMediaPlaylist({
		playlists: () => props.playlists,
		episode: () => props.episode,
		emitEpisode: id => emit('update:episode', id),
	})
	const episode = (): MediaEpisode | null => playlist.currentEpisode.value
	return {
		playlist,
		autoNext: useAutoNext(props, emit),
		content: {
			sources: () => episode()?.sources ?? props.sources,
			poster: () => episode()?.poster ?? props.poster,
			posterVideo: () => episode()?.posterVideo ?? props.posterVideo,
			tracks: () => episode()?.tracks ?? props.tracks,
			audioTracks: () => episode()?.audioTracks ?? props.audioTracks,
			chapters: () => episode()?.chapters ?? props.chapters,
			adBreaks: () => episode()?.adBreaks ?? props.adBreaks,
			adSegments: () => episode()?.adSegments ?? props.adSegments,
			banners: () => episode()?.banners ?? props.banners,
			thumbnails: () => episode()?.thumbnails ?? props.thumbnails,
			intro: () => pickClip(episode()?.intro, playlist.currentEntry.value?.playlist.intro, props.intro),
			outro: () => pickClip(episode()?.outro, playlist.currentEntry.value?.playlist.outro, props.outro),
			key: () => episode()?.id ?? '',
			storageKey: () => (props.storageKey && episode() ? `${props.storageKey}:${episode()?.id}` : props.storageKey),
		},
	}
}

function useChapterUi(chapters: ReturnType<typeof useMediaChapters>, media: { state: Readonly<MediaState>; actions: MediaActions }) {
	return {
		chapterMenu: computed<MediaMenuList>(() => ({
			title: UI_PLAYER.CHAPTERS,
			items: chapters.chapters.value.map((chapter, index) => ({
				id: String(index),
				label: chapter.title,
				hint: formatMediaTime(chapter.start),
				isChecked: chapter.start === chapters.currentChapter.value?.start,
				onSelect: () => media.actions.seek(chapter.start),
			})),
		})),
		chapterSegments: computed(() => chapterSegments(chapters.chapters.value, media.state.duration)),
		chapterTitleAt: (time: number): string => chapters.chapterAt(time)?.title ?? '',
	}
}

export function usePlayerEpisodes(
	props: MediaPlayerProps,
	player: ReturnType<typeof usePlayerPlaylist> & {
		state: Readonly<MediaState>
		actions: MediaActions
		isHeld: () => boolean
		isCasting: () => boolean
	},
) {
	const { playlist, state, actions } = player
	const chapters = useMediaChapters({ chapters: player.content.chapters, state })
	const countdown = useNextCountdown({
		seconds: () => props.nextCountdown,
		isEnabled: () => player.autoNext.isAutoNext.value,
		hasNext: () => playlist.nextEpisode.value !== null,
		state,
		playNext: playlist.playNext,
		isHeld: player.isHeld,
	})
	watch(
		() => playlist.currentEpisode.value?.id,
		(id, previous) =>
			previous !== undefined && id !== previous && void nextTick(() => (player.isCasting() ? undefined : actions.play())),
	)
	return {
		...countdown,
		...player.autoNext,
		...useChapterUi(chapters, { state, actions }),
		chapters: chapters.chapters,
		currentChapter: chapters.currentChapter,
		skipChapter: chapters.skipChapter,
		episodeTitle: computed(() => playlist.currentEpisode.value?.title),
		nextEpisode: playlist.nextEpisode,
		previousEpisode: playlist.previousEpisode,
		playNext: playlist.playNext,
		playPrevious: playlist.playPrevious,
		hasEpisodes: computed(() => playlist.playlists.value.reduce((count, list) => count + list.episodes.length, 0) > 1),
		episodeMenu: computed(() => episodeMenu(playlist)),
		nextCountdownText: computed(() => formatMessage(UI_PLAYER.NEXT_IN, { n: countdown.nextCountdown.value ?? 0 })),
		nextCountdownStyle: computed(() => ({ '--media-next-seconds': props.nextCountdown })),
		skipLabel: computed(() => (chapters.skipChapter.value?.kind ? SKIP_LABELS[chapters.skipChapter.value.kind]() : '')),
		skipCurrentChapter(): void {
			const chapter = chapters.skipChapter.value
			const isLast = chapter?.kind === 'outro' && chapter.end >= state.duration - 1
			if (isLast && playlist.nextEpisode.value) playlist.playNext()
			else if (chapter) actions.seek(chapter.end)
		},
	}
}
