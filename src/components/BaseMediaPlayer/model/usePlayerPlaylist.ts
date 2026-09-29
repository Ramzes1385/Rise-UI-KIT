import { formatMediaTime } from './mediaTime'
import { UI_PLAYER } from '@/locales/messages'
import { formatMessage } from '@/locales/state'
import { computed, nextTick, ref, watch } from 'vue'
import { useMediaChapters } from './useMediaChapters'
import { useMediaPlaylist } from './useMediaPlaylist'
import { useNextCountdown } from './useNextCountdown'
import type { DropdownMenuItem } from '@components/BaseDropdownMenu'
import type { MediaActions, MediaState } from '../types/MediaCore.types'
import type { MediaEpisode, MediaChapterKind } from '../types/MediaPlaylist.types'
import type { MediaPlayerProps, BaseMediaPlayerEmits } from '../types/BaseMediaPlayer.types'

const SKIP_LABELS: Record<MediaChapterKind, () => string> = {
	intro: () => UI_PLAYER.SKIP_INTRO,
	outro: () => UI_PLAYER.SKIP_OUTRO,
	recap: () => UI_PLAYER.SKIP_RECAP,
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

function episodeItems(playlist: ReturnType<typeof useMediaPlaylist>): DropdownMenuItem[] {
	const current = playlist.currentEpisode.value
	const radios = (episodes: MediaEpisode[]): DropdownMenuItem[] =>
		episodes.map(episode => ({
			type: 'radio',
			label: episode.title,
			isChecked: episode === current,
			onUpdateChecked: () => playlist.selectEpisode(episode.id),
		}))
	const lists = playlist.playlists.value
	return lists.length === 1 ? radios(lists[0].episodes) : lists.map(list => ({ label: list.title, children: radios(list.episodes) }))
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
			tracks: () => episode()?.tracks ?? props.tracks,
			audioTracks: () => episode()?.audioTracks ?? props.audioTracks,
			chapters: () => episode()?.chapters ?? props.chapters,
			storageKey: () => (props.storageKey && episode() ? `${props.storageKey}:${episode()?.id}` : props.storageKey),
		},
	}
}

function useChapterUi(chapters: ReturnType<typeof useMediaChapters>, media: { state: Readonly<MediaState>; actions: MediaActions }) {
	return {
		chapterItems: computed<DropdownMenuItem[]>(() =>
			chapters.chapters.value.map(chapter => ({
				type: 'radio',
				label: `${formatMediaTime(chapter.start)} · ${chapter.title}`,
				isChecked: chapter.start === chapters.currentChapter.value?.start,
				onUpdateChecked: () => media.actions.seek(chapter.start),
			})),
		),
		seekHoverText(time: number): string {
			const text = formatMediaTime(time, media.state.duration)
			const chapter = chapters.chapterAt(time)
			return chapter ? `${text} · ${chapter.title}` : text
		},
	}
}

export function usePlayerEpisodes(
	props: MediaPlayerProps,
	player: ReturnType<typeof usePlayerPlaylist> & { state: Readonly<MediaState>; actions: MediaActions },
) {
	const { playlist, state, actions } = player
	const chapters = useMediaChapters({ chapters: player.content.chapters, state })
	const countdown = useNextCountdown({
		seconds: () => props.nextCountdown,
		isEnabled: () => player.autoNext.isAutoNext.value,
		hasNext: () => playlist.nextEpisode.value !== null,
		state,
		playNext: playlist.playNext,
	})
	watch(
		() => playlist.currentEpisode.value?.id,
		(id, previous) => previous !== undefined && id !== previous && void nextTick(() => actions.play()),
	)
	return {
		...countdown,
		...player.autoNext,
		...useChapterUi(chapters, { state, actions }),
		chapters: chapters.chapters,
		currentChapter: chapters.currentChapter,
		chapterMarks: chapters.chapterMarks,
		skipChapter: chapters.skipChapter,
		episodeTitle: computed(() => playlist.currentEpisode.value?.title),
		nextEpisode: playlist.nextEpisode,
		previousEpisode: playlist.previousEpisode,
		playNext: playlist.playNext,
		playPrevious: playlist.playPrevious,
		hasEpisodes: computed(() => playlist.playlists.value.reduce((count, list) => count + list.episodes.length, 0) > 1),
		episodeItems: computed(() => episodeItems(playlist)),
		nextCountdownText: computed(() => formatMessage(UI_PLAYER.NEXT_IN, { n: countdown.nextCountdown.value ?? 0 })),
		skipLabel: computed(() => (chapters.skipChapter.value?.kind ? SKIP_LABELS[chapters.skipChapter.value.kind]() : '')),
		skipCurrentChapter(): void {
			const chapter = chapters.skipChapter.value
			const isLast = chapter?.kind === 'outro' && chapter.end >= state.duration - 1
			if (isLast && playlist.nextEpisode.value) playlist.playNext()
			else if (chapter) actions.seek(chapter.end)
		},
	}
}
