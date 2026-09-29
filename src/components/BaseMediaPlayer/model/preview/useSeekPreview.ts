import { isSafeUrl } from '@utils/data/urlUtils'
import { parseThumbnails, thumbnailAt } from './thumbnails'
import { computed, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { HLS_TYPE, createHls, isHlsSource } from '../core/useHlsAdapter'
import type { MediaSourceItem } from '../../types/playback/MediaCore.types'
import type { MediaHlsInstance } from '../../types/playback/MediaHls.types'
import type { MediaSeekPreviewOptions, MediaThumbnailCue } from '../../types/content/MediaPreview.types'

const FRAME_WIDTH = 160

const FRAME_HEIGHT = 90

const CACHE_SIZE = 40

const MAX_FRAMES = 240

const THUMBNAIL_PROTOCOLS = ['http:', 'https:', 'blob:', 'data:']

function frameCanvas(video: HTMLVideoElement): HTMLCanvasElement {
	const ratio = Math.min(2, window.devicePixelRatio || 1)
	const canvas = document.createElement('canvas')
	canvas.width = FRAME_WIDTH * ratio
	canvas.height = FRAME_HEIGHT * ratio
	if (!video.videoWidth || !video.videoHeight) return canvas
	const scale = Math.min(canvas.width / video.videoWidth, canvas.height / video.videoHeight)
	const width = video.videoWidth * scale
	const height = video.videoHeight * scale
	canvas.getContext('2d')?.drawImage(video, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height)
	return canvas
}

function canGrab(source: MediaSourceItem, options: MediaSeekPreviewOptions): boolean {
	if (!isHlsSource(source)) return true
	return document.createElement('video').canPlayType(HLS_TYPE) !== '' || Boolean(options.Hls()?.isSupported())
}

function attachSource(video: HTMLVideoElement, source: MediaSourceItem, options: MediaSeekPreviewOptions): MediaHlsInstance | null {
	const Hls = options.Hls()
	if (!isHlsSource(source) || video.canPlayType(HLS_TYPE) !== '' || !Hls) {
		video.src = source.src
		return null
	}
	const hls = createHls(Hls, { ...options.hlsConfig(), startLevel: 0, maxBufferLength: 2, backBufferLength: 0 })
	hls.on('hlsManifestParsed', () => {
		hls.currentLevel = 0
	})
	hls.attachMedia(video)
	hls.loadSource(source.src)
	return hls
}

function createGrabber(
	source: MediaSourceItem,
	options: MediaSeekPreviewOptions,
	handlers: { onFrame: (time: number, frame: HTMLCanvasElement) => void; onError: () => void },
) {
	const video = document.createElement('video')
	Object.assign(video, { muted: true, preload: 'metadata', playsInline: true })
	const crossorigin = options.crossorigin()
	if (crossorigin !== undefined) video.crossOrigin = crossorigin
	const queue: { pending: number | null; seeking: number | null } = { pending: null, seeking: null }
	const seek = (): void => {
		if (queue.pending === null || queue.seeking !== null || video.readyState < 1) return
		queue.seeking = queue.pending
		queue.pending = null
		video.currentTime = queue.seeking
	}
	video.addEventListener('loadedmetadata', seek)
	video.addEventListener('error', handlers.onError)
	video.addEventListener('seeked', () => {
		if (queue.seeking !== null) handlers.onFrame(queue.seeking, frameCanvas(video))
		queue.seeking = null
		seek()
	})
	const hls = attachSource(video, source, options)
	return {
		request(time: number): void {
			queue.pending = time
			seek()
		},
		destroy(): void {
			hls?.destroy()
			video.removeAttribute('src')
			video.load()
		},
	}
}

function usePreviewFrames(options: MediaSeekPreviewOptions) {
	const frame = shallowRef<HTMLCanvasElement | null>(null)
	const failed = ref(false)
	const cache = new Map<number, HTMLCanvasElement>()
	const state: { grabber: ReturnType<typeof createGrabber> | null } = { grabber: null }
	const source = computed(() => options.source())
	const isAvailable = computed(() => {
		const item = source.value
		return Boolean(item && options.isEnabled() && !failed.value && canGrab(item, options))
	})
	const reset = (): void => {
		state.grabber?.destroy()
		state.grabber = null
		cache.clear()
		frame.value = null
		failed.value = false
	}
	const store = (time: number, canvas: HTMLCanvasElement): void => {
		cache.delete(time)
		cache.set(time, canvas)
		if (cache.size > CACHE_SIZE) cache.delete(cache.keys().next().value as number)
		frame.value = canvas
	}
	watch(() => source.value?.src, reset)
	onBeforeUnmount(reset)
	return {
		frame,
		isAvailable,
		request(time: number): void {
			const duration = options.duration()
			if (!isAvailable.value || !(duration > 0)) return
			const step = Math.max(1, duration / MAX_FRAMES)
			const bucket = Math.round(time / step) * step
			const cached = cache.get(bucket)
			if (cached) return store(bucket, cached)
			state.grabber ??= createGrabber(source.value as MediaSourceItem, options, {
				onFrame: store,
				onError: () => (failed.value = true),
			})
			state.grabber.request(bucket)
		},
	}
}

async function loadCues(url: string): Promise<MediaThumbnailCue[]> {
	try {
		const base = new URL(url, document.baseURI).href
		const response = await fetch(base)
		return response.ok ? parseThumbnails(await response.text(), base) : []
	} catch {
		return []
	}
}

function useThumbnailCues(url: () => string | undefined) {
	const cues = shallowRef<MediaThumbnailCue[]>([])
	watch(
		url,
		(value, _, onCleanup) => {
			cues.value = []
			if (!value || !isSafeUrl(value, THUMBNAIL_PROTOCOLS)) return
			const request = { isCurrent: true }
			onCleanup(() => (request.isCurrent = false))
			void loadCues(value).then(list => request.isCurrent && (cues.value = list))
		},
		{ immediate: true },
	)
	return cues
}

export function useSeekPreview(options: MediaSeekPreviewOptions) {
	const cues = useThumbnailCues(options.thumbnails)
	const frames = usePreviewFrames(options)
	const hasThumbnails = computed(() => cues.value.length > 0)
	return {
		hasPreviewFrames: computed(() => !hasThumbnails.value && frames.isAvailable.value),
		previewFrame: frames.frame,
		previewThumbnail: (time: number): MediaThumbnailCue | null => thumbnailAt(cues.value, time),
		requestPreviewFrame(time: number): void {
			if (!hasThumbnails.value) frames.request(time)
		},
	}
}
