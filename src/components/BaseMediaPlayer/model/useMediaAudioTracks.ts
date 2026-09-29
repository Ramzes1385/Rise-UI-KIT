import { isSafeUrl } from '@utils/urlUtils'
import { useAudioSync } from './useAudioSync'
import { UI_PLAYER } from '@/locales/messages'
import { formatMessage } from '@/locales/state'
import { computed, onMounted, ref, watch } from 'vue'
import type { MediaElementRef } from '../types/MediaCore.types'
import type {
	MediaAudioOption,
	MediaAudioTrackItem,
	MediaAudioTracksOptions,
	MediaEmbeddedAudioTrack,
	MediaElementWithAudioTracks,
} from '../types/MediaAudio.types'

const EMBEDDED_EVENTS = ['change', 'addtrack', 'removetrack']

function embeddedId(track: MediaEmbeddedAudioTrack, index: number): string {
	return track.id ? `embedded:${track.id}` : `embedded:#${index + 1}`
}

function readEmbedded(video: HTMLMediaElement | null): MediaEmbeddedAudioTrack[] {
	const list = (video as MediaElementWithAudioTracks | null)?.audioTracks
	return list ? Array.from({ length: list.length }, (_, index) => list[index]) : []
}

function useEmbeddedAudio(video: MediaElementRef) {
	const version = ref(0)
	const refresh = (): void => {
		version.value++
	}
	watch(
		video,
		(element, _, onCleanup) => {
			const list = (element as MediaElementWithAudioTracks | null)?.audioTracks
			if (!list?.addEventListener) return
			EMBEDDED_EVENTS.forEach(name => list.addEventListener(name, refresh))
			onCleanup(() => EMBEDDED_EVENTS.forEach(name => list.removeEventListener(name, refresh)))
		},
		{ immediate: true },
	)
	const tracks = computed(() => (version.value >= 0 ? readEmbedded(video.value) : []))
	return {
		options: computed<MediaAudioOption[]>(() =>
			tracks.value.length < 2
				? []
				: tracks.value.map((track, index) => ({
						id: embeddedId(track, index),
						label: track.label || track.language || formatMessage(UI_PLAYER.AUDIO_TRACK, { n: index + 1 }),
					})),
		),
		activeId: computed(() => {
			const index = tracks.value.findIndex(track => track.enabled)
			return index === -1 ? null : embeddedId(tracks.value[index], index)
		}),
		enable(id: string): void {
			tracks.value.forEach((track, index) => {
				track.enabled = embeddedId(track, index) === id
			})
			refresh()
		},
	}
}

function isPlayable(item: MediaAudioTrackItem, options: MediaAudioTracksOptions): boolean {
	if (!item.src) return true
	const audio = options.audio.value
	const canPlay = !item.type || !audio || audio.canPlayType(item.type) !== ''
	return canPlay && isSafeUrl(item.src, options.allowedProtocols())
}

function handOffSound(options: MediaAudioTracksOptions, isExternal: boolean): void {
	const video = options.video.value
	const audio = options.audio.value
	if (!video || !audio) return
	const from = options.sound.value ?? video
	const to = isExternal ? audio : video
	to.volume = from.volume
	to.muted = from.muted
	if (isExternal) video.muted = true
	options.sound.value = isExternal ? audio : null
}

function useExternalAudio(options: MediaAudioTracksOptions) {
	const items = computed(() => (options.tracks() ?? []).filter(item => isPlayable(item, options)))
	const activeId = ref<string | null | undefined>(undefined)
	const src = computed(() => (items.value.length > 0 ? (activeId.value ?? null) : null))
	watch(src, next => handOffSound(options, next !== null))
	return {
		items,
		activeId,
		src,
		options: computed<MediaAudioOption[]>(() => items.value.map(item => ({ id: item.src ?? null, label: item.label }))),
		defaultId: (): string | null => (items.value.find(item => item.isDefault) ?? items.value[0])?.src ?? null,
	}
}

function applyAudio(
	id: string | null,
	tracks: { isExternal: boolean; external: ReturnType<typeof useExternalAudio>; embedded: ReturnType<typeof useEmbeddedAudio> },
): boolean {
	if (tracks.isExternal) {
		if (tracks.external.activeId.value === id) return false
		tracks.external.activeId.value = id
	} else {
		if (tracks.embedded.activeId.value === id) return false
		tracks.embedded.enable(id as string)
	}
	return true
}

export function useMediaAudioTracks(options: MediaAudioTracksOptions) {
	const external = useExternalAudio(options)
	const embedded = useEmbeddedAudio(options.video)
	const isExternal = computed(() => external.items.value.length > 0)
	const list = computed(() => (isExternal.value ? external.options.value : embedded.options.value))
	const activeId = computed(() => (isExternal.value ? (external.activeId.value ?? null) : embedded.activeId.value))
	const has = (id: string | null): boolean => list.value.some(option => option.id === id)
	const select = (id: string | null): void => {
		if (has(id) && applyAudio(id, { isExternal: isExternal.value, external, embedded })) options.emitTrack(id)
	}
	const selectInitial = (): void => {
		const wanted = options.audioTrack()
		const id = wanted === undefined && isExternal.value ? external.defaultId() : wanted
		if (id !== undefined) select(id)
	}
	onMounted(selectInitial)
	watch(options.audioTrack, id => id !== undefined && select(id))
	watch(list, () => {
		const wanted = options.audioTrack()
		if (!has(activeId.value) || (wanted !== undefined && wanted !== activeId.value)) selectInitial()
	})
	useAudioSync({
		video: options.video,
		audio: options.audio,
		src: () => external.src.value,
		onError() {
			options.flash(UI_PLAYER.AUDIO_ERROR)
			select(null)
		},
	})

	return { audioOptions: list, activeAudioId: activeId, selectAudioTrack: select }
}
