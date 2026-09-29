import { isSafeUrl } from '@utils/urlUtils'
import { UI_PLAYER } from '@/locales/messages'
import { formatMessage } from '@/locales/state'
import type { MediaElementRef } from '../types/MediaCore.types'
import { activeCueText, cueLines, decodeSubtitles, parseSubtitles } from './subtitles'
import { computed, onBeforeUnmount, onMounted, ref, shallowReactive, watch } from 'vue'
import type { MediaCue, MediaCaptionOption, MediaFetchCredentials, MediaSubtitlesOptions } from '../types/MediaSubtitles.types'

const TRACK_PROTOCOLS = ['http:', 'https:', 'blob:', 'data:'] as const

async function fetchCues(src: string, credentials: MediaFetchCredentials): Promise<MediaCue[]> {
	const response = await fetch(src, { credentials })
	if (!response.ok) throw new Error(`HTTP ${response.status}`)
	const cues = parseSubtitles(decodeSubtitles(await response.arrayBuffer()))
	if (cues.length === 0) throw new Error('No cues')
	return cues
}

function useCueCache(credentials: () => MediaFetchCredentials) {
	const cache = shallowReactive(new Map<string, MediaCue[]>())
	const requests = new Set<string>()
	return {
		cache,
		async load(id: string, onError: () => void): Promise<void> {
			if (cache.has(id) || requests.has(id)) return
			requests.add(id)
			try {
				cache.set(id, await fetchCues(id, credentials()))
			} catch {
				onError()
			} finally {
				requests.delete(id)
			}
		},
	}
}

function useCaptionClock(media: MediaElementRef, isRunning: () => boolean) {
	const time = ref(0)
	let frame = 0
	const tick = (): void => {
		time.value = media.value?.currentTime ?? 0
		frame = requestAnimationFrame(tick)
	}
	watch(isRunning, running => {
		cancelAnimationFrame(frame)
		if (running) tick()
	})
	onBeforeUnmount(() => cancelAnimationFrame(frame))
	return time
}

function useTrackList(options: MediaSubtitlesOptions) {
	const urlTracks = computed(() => (options.tracks() ?? []).filter(track => isSafeUrl(track.src, TRACK_PROTOCOLS)))
	const fileTracks = ref<MediaCaptionOption[]>([])
	const list = computed<MediaCaptionOption[]>(() => [
		...urlTracks.value.map(track => ({ id: track.src, label: track.label })),
		...fileTracks.value,
	])
	return {
		list,
		has: (id: string | null): id is string => list.value.some(track => track.id === id),
		defaultId: (): string | null => urlTracks.value.find(track => track.isDefault)?.src ?? null,
		addFile(id: string, name: string): void {
			const label = formatMessage(UI_PLAYER.CAPTIONS_FILE, { name })
			fileTracks.value = [...fileTracks.value.filter(track => track.id !== id), { id, label }]
		},
	}
}

function useCaptionText(options: MediaSubtitlesOptions, activeId: () => string | null, cache: Map<string, MediaCue[]>) {
	const clock = useCaptionClock(options.media, () => !options.state.isPaused && activeId() !== null)
	const text = computed(() => {
		const id = activeId()
		const time = options.state.isPaused ? options.state.currentTime : clock.value
		return id ? activeCueText(cache.get(id) ?? [], time) : ''
	})
	return computed(() => cueLines(text.value))
}

export function useMediaSubtitles(options: MediaSubtitlesOptions) {
	const cues = useCueCache(options.credentials)
	const tracks = useTrackList(options)
	const activeId = ref<string | null>(null)
	let lastId: string | null = null
	const select = (id: string | null): void => {
		const next = tracks.has(id) ? id : null
		if (next === activeId.value) return
		activeId.value = next
		options.emitTrack(next)
		if (next === null) return
		lastId = next
		void cues.load(next, () => {
			options.flash(UI_PLAYER.CAPTIONS_ERROR)
			if (activeId.value === next) select(null)
		})
	}
	const initialId = (): string | null => (options.textTrack() === undefined ? tracks.defaultId() : (options.textTrack() ?? null))
	onMounted(() => select(initialId()))
	watch(options.textTrack, id => id !== undefined && select(id))
	watch(tracks.list, (list, previous) => {
		if (activeId.value === null ? previous.length === 0 : !tracks.has(activeId.value)) select(initialId())
	})

	return {
		captionTracks: tracks.list,
		activeCaptionId: activeId,
		captionLines: useCaptionText(options, () => activeId.value, cues.cache),
		selectCaptionTrack: select,
		async loadCaptionFile(file: File): Promise<void> {
			const parsed = parseSubtitles(decodeSubtitles(await file.arrayBuffer()))
			if (parsed.length === 0) return options.flash(UI_PLAYER.CAPTIONS_ERROR)
			const id = `file:${file.name}`
			cues.cache.set(id, parsed)
			tracks.addFile(id, file.name)
			select(id)
		},
		toggleCaptions(): void {
			const fallback = tracks.has(lastId) ? lastId : (tracks.defaultId() ?? tracks.list.value[0]?.id ?? null)
			const next = activeId.value ? null : fallback
			if (next === activeId.value) return
			select(next)
			const label = tracks.list.value.find(track => track.id === next)?.label
			options.flash(label ? formatMessage(UI_PLAYER.CAPTIONS_ON_MESSAGE, { label }) : UI_PLAYER.CAPTIONS_OFF_MESSAGE)
		},
	}
}
