import { isSafeUrl } from '@utils/urlUtils'
import { formatMediaTime } from '@utils/mediaUtils'
import { usePlayerContext } from './usePlayerContext'
import type { MediaEpisode } from '../types/MediaPlaylist.types'
import type { MediaEpisodeCard } from '../types/MediaScreen.types'
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

const IMAGE_PROTOCOLS = ['http:', 'https:', 'blob:', 'data:'] as const

const TRIGGER = '.base-media-player__episodes-button'

function episodeCard(episode: MediaEpisode, index: number, currentId: string | undefined): MediaEpisodeCard {
	return {
		id: episode.id,
		number: index + 1,
		title: episode.title,
		description: episode.description,
		duration: episode.duration ? formatMediaTime(episode.duration) : '',
		poster: episode.poster && isSafeUrl(episode.poster, IMAGE_PROTOCOLS) ? episode.poster : undefined,
		isCurrent: episode.id === currentId,
	}
}

function useOutsidePress(panel: Readonly<{ value: HTMLElement | null }>, isOpen: () => boolean, close: () => void): void {
	const onPointerDown = (event: PointerEvent): void => {
		const target = event.target as Element
		if (!panel.value?.contains(target) && !target.closest?.(TRIGGER)) close()
	}
	const stop = (): void => document.removeEventListener('pointerdown', onPointerDown, true)
	watch(isOpen, open => (open ? document.addEventListener('pointerdown', onPointerDown, true) : stop()))
	onBeforeUnmount(stop)
}

export function useMediaEpisodesPanel() {
	const { rootRef, isEpisodesOpen, episodeSeasons, currentSeasonId, currentEpisodeId, closeEpisodes, chooseEpisode } = usePlayerContext()
	const panelRef = ref<HTMLElement | null>(null)
	const seasonId = ref(currentSeasonId.value)
	const leave = (action: () => void): void => {
		const hadFocus = panelRef.value?.contains(document.activeElement)
		action()
		if (hadFocus) rootRef.value?.querySelector<HTMLElement>(TRIGGER)?.focus()
	}
	const close = (): void => leave(closeEpisodes)
	watch(isEpisodesOpen, isOpen => {
		if (!isOpen) return
		seasonId.value = currentSeasonId.value
		void nextTick(() => {
			const panel = panelRef.value
			;(
				panel?.querySelector<HTMLElement>('[aria-current="true"]') ??
				panel?.querySelector<HTMLElement>('.base-media-player__episode-card')
			)?.focus()
		})
	})
	useOutsidePress(panelRef, () => isEpisodesOpen.value, closeEpisodes)

	return {
		panelRef,
		isEpisodesOpen,
		seasonId,
		seasonTabs: computed(() => episodeSeasons.value.map(season => ({ id: season.id, title: season.title }))),
		episodeCards: computed(() =>
			(episodeSeasons.value.find(season => season.id === seasonId.value)?.episodes ?? []).map((episode, index) =>
				episodeCard(episode, index, currentEpisodeId.value),
			),
		),
		selectSeason(id: string): void {
			seasonId.value = id
		},
		chooseEpisode: (id: string): void => leave(() => chooseEpisode(id)),
		close,
		onKeydown(event: KeyboardEvent): void {
			if (event.key !== 'Escape') return
			event.stopPropagation()
			close()
		},
	}
}
