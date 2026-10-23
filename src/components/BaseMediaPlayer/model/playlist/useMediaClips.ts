import { computed, ref, watch } from 'vue'
import { UI_PLAYER, formatMessage } from '../messages'
import { firstPlayable } from '../core/useMediaSources'
import type { MediaClip, MediaClipKind, MediaClipsOptions } from '../../types/content/MediaPlaylist.types'

const START_LIMIT = 1

function useClipQueue(options: MediaClipsOptions) {
	const active = ref<MediaClipKind | null>(null)
	const played = ref<MediaClipKind[]>([])
	const clipOf = (kind: MediaClipKind): MediaClip | null | undefined => (kind === 'intro' ? options.intro() : options.outro())
	const sourceOf = (kind: MediaClipKind): string | undefined => {
		const clip = clipOf(kind)
		const media = options.media.value
		return clip && media ? firstPlayable(clip.sources, options.allowedProtocols(), media)?.src : undefined
	}
	watch(options.contentKey, () => {
		played.value = []
		active.value = null
	})
	return {
		active,
		played,
		clipOf,
		sourceOf,
		isPending: (kind: MediaClipKind): boolean => !played.value.includes(kind) && sourceOf(kind) !== undefined,
	}
}

function useClipPlayback(options: MediaClipsOptions, queue: ReturnType<typeof useClipQueue>) {
	const elapsed = ref(0)
	const length = ref(0)
	const isClipPaused = ref(false)
	const start = (kind: MediaClipKind): void => {
		queue.played.value = [...queue.played.value, kind]
		elapsed.value = 0
		length.value = 0
		isClipPaused.value = false
		queue.active.value = kind
	}
	const finish = (): void => {
		const kind = queue.active.value
		queue.active.value = null
		if (kind === 'intro') void options.actions.play()
	}
	watch(
		() => [options.clipMedia.value, queue.active.value] as const,
		([element, kind]) => {
			if (!element || !kind) return
			element.volume = options.state.volume
			void element.play().catch(() => {
				element.muted = true
				return element.play().catch(finish)
			})
		},
		{ flush: 'post' },
	)
	return { elapsed, length, isClipPaused, start, finish }
}

function useClipTriggers(options: MediaClipsOptions, queue: ReturnType<typeof useClipQueue>, playback: ReturnType<typeof useClipPlayback>) {
	const startIntro = (): void => {
		const isBusy = queue.active.value !== null || options.isAdPlaying()
		if (isBusy || options.state.currentTime >= START_LIMIT || !queue.isPending('intro')) return
		options.actions.pause()
		playback.start('intro')
	}
	watch(
		() => options.media.value,
		(element, _, onCleanup) => {
			element?.addEventListener('play', startIntro)
			onCleanup(() => element?.removeEventListener('play', startIntro))
		},
		{ immediate: true },
	)
	watch(
		() => options.state.isEnded && !options.isAdPlaying() && queue.active.value === null && queue.isPending('outro'),
		isDue => isDue && playback.start('outro'),
	)
}

export function useMediaClips(options: MediaClipsOptions) {
	const queue = useClipQueue(options)
	const playback = useClipPlayback(options, queue)
	const { elapsed, length, isClipPaused } = playback
	const clip = computed(() => (queue.active.value ? queue.clipOf(queue.active.value) : null))
	const skipAfter = computed(() => clip.value?.skipAfter ?? 0)
	const canSkipClip = computed(() => elapsed.value >= skipAfter.value)
	useClipTriggers(options, queue, playback)

	return {
		activeClip: queue.active,
		clipSrc: computed(() => (queue.active.value ? queue.sourceOf(queue.active.value) : undefined)),
		isClipPlaying: computed(() => queue.active.value !== null),
		isClipHeld: computed(() => queue.active.value !== null || (options.state.isEnded && queue.isPending('outro'))),
		isClipPaused,
		clipLabel: computed(() => clip.value?.title ?? (queue.active.value === 'outro' ? UI_PLAYER.OUTRO : UI_PLAYER.INTRO)),
		clipSkipLabel: computed(() => (queue.active.value === 'outro' ? UI_PLAYER.SKIP_OUTRO_CLIP : UI_PLAYER.SKIP_INTRO_CLIP)),
		canSkipClip,
		clipSkipText: computed(() =>
			canSkipClip.value ? '' : formatMessage(UI_PLAYER.AD_SKIP_IN, { n: Math.ceil(skipAfter.value - elapsed.value) }),
		),
		clipPauseLabel: computed(() => (isClipPaused.value ? UI_PLAYER.PLAY : UI_PLAYER.PAUSE)),
		clipProgressStyle: computed(() => ({ width: `${length.value > 0 ? Math.min(100, (elapsed.value / length.value) * 100) : 0}%` })),
		finishClip: playback.finish,
		toggleClipPause(): void {
			const element = options.clipMedia.value
			if (element) void (element.paused ? element.play() : element.pause())
		},
		onClipTime(event: Event): void {
			const element = event.target as HTMLVideoElement
			elapsed.value = element.currentTime
			length.value = Number.isFinite(element.duration) ? element.duration : 0
		},
		onClipPlayState(event: Event): void {
			isClipPaused.value = (event.target as HTMLVideoElement).paused
		},
	}
}
