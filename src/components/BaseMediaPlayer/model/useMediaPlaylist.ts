import { computed, ref } from 'vue'
import type { MediaEpisodeEntry, MediaPlaylistOptions } from '../types/MediaPlaylist.types'

export function useMediaPlaylist(options: MediaPlaylistOptions) {
	const entries = computed<MediaEpisodeEntry[]>(() =>
		(options.playlists() ?? []).flatMap(playlist => playlist.episodes.map(episode => ({ episode, playlist }))),
	)
	const localId = ref<string | undefined>(undefined)
	const index = computed(() => {
		const id = options.episode() ?? localId.value
		return Math.max(
			0,
			entries.value.findIndex(entry => entry.episode.id === id),
		)
	})
	const at = (offset: number): MediaEpisodeEntry | null => entries.value[index.value + offset] ?? null
	const select = (id: string): void => {
		if (id === at(0)?.episode.id || !entries.value.some(entry => entry.episode.id === id)) return
		localId.value = id
		options.emitEpisode(id)
	}

	return {
		playlists: computed(() => options.playlists() ?? []),
		currentEntry: computed(() => at(0)),
		currentEpisode: computed(() => at(0)?.episode ?? null),
		nextEpisode: computed(() => at(1)?.episode ?? null),
		previousEpisode: computed(() => (index.value > 0 ? (at(-1)?.episode ?? null) : null)),
		selectEpisode: select,
		playNext(): void {
			const next = at(1)
			if (next) select(next.episode.id)
		},
		playPrevious(): void {
			const previous = index.value > 0 ? at(-1) : null
			if (previous) select(previous.episode.id)
		},
	}
}
