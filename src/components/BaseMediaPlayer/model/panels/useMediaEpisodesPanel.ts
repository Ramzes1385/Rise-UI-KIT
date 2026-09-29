import { UI_PLAYER } from '../messages'
import { computed, ref, watch } from 'vue'
import { isSafeUrl } from '@utils/urlUtils'
import { formatMediaTime } from '@utils/mediaUtils'
import { actorCards } from '../playlist/mediaActors'
import { useMediaSidePanel } from './useMediaSidePanel'
import { usePlayerContext } from '../player/usePlayerContext'
import type { MediaPlayerContext } from '../../types/BaseMediaPlayer.types'
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

function useActorGroups(player: MediaPlayerContext) {
	const groups = computed(() =>
		[
			{ id: 'episode', title: UI_PLAYER.ACTORS_EPISODE, actors: actorCards(player.episodeActors.value) },
			{ id: 'season', title: UI_PLAYER.ACTORS_SERIES, actors: actorCards(player.seasonActors.value) },
		].filter(group => group.actors.length > 0),
	)
	const view = ref<'episodes' | 'actors'>('episodes')
	return {
		view,
		actorGroups: groups,
		hasActors: computed(() => groups.value.length > 0),
		showView(name: 'episodes' | 'actors'): void {
			view.value = name
		},
	}
}

export function useMediaEpisodesPanel() {
	const player = usePlayerContext()
	const { isEpisodesOpen, episodeSeasons, currentSeasonId, currentEpisodeId, closeEpisodes, chooseEpisode } = player
	const seasonId = ref(currentSeasonId.value)
	const actors = useActorGroups(player)
	const panel = useMediaSidePanel({
		trigger: '.base-media-player__episodes-button',
		focus: ['[aria-current="true"]', '.base-media-player__episode-card'],
		isOpen: () => isEpisodesOpen.value,
		close: closeEpisodes,
	})
	watch(isEpisodesOpen, isOpen => {
		if (!isOpen) return
		seasonId.value = currentSeasonId.value
		actors.view.value = 'episodes'
	})

	return {
		...panel,
		...actors,
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
