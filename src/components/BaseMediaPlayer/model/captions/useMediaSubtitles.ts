import { isSafeUrl } from '@utils/urlUtils'
import { activeCueText, cueLines } from './subtitles'
import { UI_PLAYER, formatMessage } from '../messages'
import { decodeSubtitles, parseSubtitles } from '@utils/subtitleUtils'
import type { MediaElementRef } from '../../types/playback/MediaCore.types'
import { computed, onBeforeUnmount, onMounted, ref, shallowReactive, watch } from 'vue'
import type { MediaCue, MediaCaptionOption, MediaFetchCredentials, MediaSubtitlesOptions } from '../../types/content/MediaSubtitles.types'

const TRACK_PROTOCOLS = ['http:', 'https:', 'blob:', 'data:'] as const

const TEXT_PREFIX = 'text:'

const TEXT_TRACK_EVENTS = ['addtrack', 'removetrack', 'change']

function subtitleTracksOf(media: HTMLMediaElement | null): TextTrack[] {
	const list = media?.textTracks
	if (!list?.addEventListener) return []
	return Array.from({ length: list.length }, (_, index) => list[index]).filter(track => ['subtitles', 'captions'].includes(track.kind))
}

function cueText(track: TextTrack | undefined): string {
	return Array.from(track?.activeCues ?? [])
		.map(cue => (cue as VTTCue).text)
		.join('\n')
}

function useElementTextTracks(media: MediaElementRef) {
	const listVersion = ref(0)
	const cueVersion = ref(0)
	let activeId: string | null = null
	const tracks = computed(() => (listVersion.value >= 0 ? subtitleTracksOf(media.value) : []))
	const apply = (): void =>
		tracks.value.forEach((track, index) => {
			const mode = `${TEXT_PREFIX}${index}` === activeId ? 'hidden' : 'disabled'
			if (track.mode !== mode) track.mode = mode
		})
	watch(
		media,
		(element, _, onCleanup) => {
			const list = element?.textTracks
			if (!list?.addEventListener) return
			const onChange = (): void => {
				listVersion.value++
				apply()
			}
			TEXT_TRACK_EVENTS.forEach(name => list.addEventListener(name, onChange))
			onCleanup(() => TEXT_TRACK_EVENTS.forEach(name => list.removeEventListener(name, onChange)))
		},
		{ immediate: true },
	)
	watch(tracks, (list, _, onCleanup) => {
		const onCue = (): void => {
			cueVersion.value++
		}
		list.forEach(track => track.addEventListener('cuechange', onCue))
		onCleanup(() => list.forEach(track => track.removeEventListener('cuechange', onCue)))
	})
	return {
		options: computed<MediaCaptionOption[]>(() =>
			tracks.value.map((track, index) => ({
				id: `${TEXT_PREFIX}${index}`,
				label: track.label || track.language || formatMessage(UI_PLAYER.CAPTIONS_TRACK, { n: index + 1 }),
			})),
		),
		select(id: string | null): void {
			activeId = id?.startsWith(TEXT_PREFIX) ? id : null
			apply()
		},
		text: (id: string): string => (cueVersion.value >= 0 ? cueText(tracks.value[Number(id.slice(TEXT_PREFIX.length))]) : ''),
	}
}

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

function useTrackList(options: MediaSubtitlesOptions, textTracks: Readonly<{ value: MediaCaptionOption[] }>) {
	const urlTracks = computed(() => (options.tracks() ?? []).filter(track => isSafeUrl(track.src, TRACK_PROTOCOLS)))
	const fileTracks = ref<MediaCaptionOption[]>([])
	const list = computed<MediaCaptionOption[]>(() => [
		...urlTracks.value.map(track => ({ id: track.src, label: track.label })),
		...textTracks.value,
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

function useCaptionText(
	options: MediaSubtitlesOptions,
	activeId: () => string | null,
	sources: { cache: Map<string, MediaCue[]>; textTracks: ReturnType<typeof useElementTextTracks> },
) {
	const isFileCues = (): boolean => !(activeId() ?? TEXT_PREFIX).startsWith(TEXT_PREFIX)
	const clock = useCaptionClock(options.media, () => !options.state.isPaused && isFileCues())
	const text = computed(() => {
		const id = activeId()
		if (!id) return ''
		if (id.startsWith(TEXT_PREFIX)) return sources.textTracks.text(id)
		return activeCueText(sources.cache.get(id) ?? [], options.state.isPaused ? options.state.currentTime : clock.value)
	})
	return computed(() => cueLines(text.value))
}

export function useMediaSubtitles(options: MediaSubtitlesOptions) {
	const cues = useCueCache(options.credentials)
	const textTracks = useElementTextTracks(options.media)
	const tracks = useTrackList(options, textTracks.options)
	const activeId = ref<string | null>(null)
	let lastId: string | null = null
	const select = (id: string | null): void => {
		const next = tracks.has(id) ? id : null
		if (next === activeId.value) return
		activeId.value = next
		options.emitTrack(next)
		textTracks.select(next)
		if (next === null || next.startsWith(TEXT_PREFIX)) return
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
		captionLines: useCaptionText(options, () => activeId.value, { cache: cues.cache, textTracks }),
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
