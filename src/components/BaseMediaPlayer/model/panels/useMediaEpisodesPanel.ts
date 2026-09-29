import { computed, ref, watch } from 'vue'
import { isSafeUrl } from '@utils/urlUtils'
import { formatMediaTime } from '@utils/mediaUtils'
import { useMediaSidePanel } from './useMediaSidePanel'
import { usePlayerContext } from '../player/usePlayerContext'
import type { MediaEpisode } from '../../types/content/MediaPlaylist.types'
import type { MediaEpisodeCard } from '../../types/playback/MediaScreen.types'

const IMAGE_PROTOCOLS = ['http:', 'https:', 'blob:', 'data:'] as const

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

export function useMediaEpisodesPanel() {
	const { isEpisodesOpen, episodeSeasons, currentSeasonId, currentEpisodeId, closeEpisodes, chooseEpisode } = usePlayerContext()
	const seasonId = ref(currentSeasonId.value)
	const panel = useMediaSidePanel({
		trigger: '.base-media-player__episodes-button',
		focus: ['[aria-current="true"]', '.base-media-player__episode-card'],
		isOpen: () => isEpisodesOpen.value,
		close: closeEpisodes,
	})
	watch(isEpisodesOpen, isOpen => {
		if (isOpen) seasonId.value = currentSeasonId.value
	})

	return {
		...panel,
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
		chooseEpisode: (id: string): void => panel.leave(() => chooseEpisode(id)),
	}
}
