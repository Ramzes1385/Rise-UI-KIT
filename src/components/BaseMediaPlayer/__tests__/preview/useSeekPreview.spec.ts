import { nextTick, ref } from 'vue'
import { withSetup } from '../utils/BaseMediaPlayer.test-utils'
import { useSeekPreview } from '../../model/preview/useSeekPreview'
import type { MediaSourceItem } from '../../types/playback/MediaCore.types'
import type { MediaSeekPreviewOptions } from '../../types/content/MediaPreview.types'
import type { MediaHlsConstructor, MediaHlsInstance } from '../../types/playback/MediaHls.types'

class FakeVideo extends EventTarget {
	muted = false
	preload = ''
	playsInline = false
	crossOrigin: string | null = null
	src = ''
	readyState = 0
	videoWidth = 320
	videoHeight = 180
	seeks: number[] = []
	canPlayType = vi.fn(() => '')
	removeAttribute = vi.fn()
	load = vi.fn()
	get currentTime(): number {
		return this.seeks.at(-1) ?? 0
	}
	set currentTime(value: number) {
		this.seeks.push(value)
	}
}

function stubElements(video: FakeVideo) {
	const draw = vi.fn()
	const create = document.createElement.bind(document)
	vi.spyOn(document, 'createElement').mockImplementation(((tag: string) => {
		if (tag === 'video') return video
		if (tag === 'canvas') return { width: 0, height: 0, getContext: () => ({ drawImage: draw }) }
		return create(tag)
	}) as typeof document.createElement)
	return draw
}

function setup(patch: Partial<MediaSeekPreviewOptions> = {}, source: MediaSourceItem | null = { src: '/media/low.webm' }) {
	const current = ref<MediaSourceItem | null>(source)
	const preview = withSetup(() =>
		useSeekPreview({
			thumbnails: () => undefined,
			source: () => current.value,
			isEnabled: () => true,
			duration: () => 60,
			crossorigin: () => undefined,
			Hls: () => undefined,
			hlsConfig: () => undefined,
			...patch,
		}),
	)
	return { ...preview.result, wrapper: preview.wrapper, current }
}

function metadata(video: FakeVideo): void {
	video.readyState = 1
	video.dispatchEvent(new Event('loadedmetadata'))
}

describe('превью кадра на шкале', () => {
	afterEach(() => {
		vi.restoreAllMocks()
		vi.unstubAllGlobals()
	})

	it('кадры из записи: перемотка после загрузки, кадр после seeked, очередь и повтор из памяти', async () => {
		const video = new FakeVideo()
		const draw = stubElements(video)
		const preview = setup({ crossorigin: () => 'anonymous' })

		expect(preview.hasPreviewFrames.value).toBe(true)
		preview.requestPreviewFrame(10.2)
		expect(video.src).toBe('/media/low.webm')
		expect(video.crossOrigin).toBe('anonymous')
		expect(video.preload).toBe('metadata')
		expect(video.seeks).toEqual([])
		metadata(video)
		expect(video.seeks).toEqual([10])
		preview.requestPreviewFrame(30)
		preview.requestPreviewFrame(40)
		expect(video.seeks).toEqual([10])
		video.dispatchEvent(new Event('seeked'))
		expect(draw).toHaveBeenCalledOnce()
		expect(preview.previewFrame.value).not.toBeNull()
		expect(video.seeks).toEqual([10, 40])
		video.dispatchEvent(new Event('seeked'))
		const frame = preview.previewFrame.value
		preview.requestPreviewFrame(10)
		expect(video.seeks).toEqual([10, 40])
		expect(preview.previewFrame.value).not.toBe(frame)
		video.dispatchEvent(new Event('seeked'))
		expect(video.seeks).toEqual([10, 40])
	})

	it('память кадров ограничена; без размера кадра — пустая картинка; ошибка отключает кадры', async () => {
		const video = new FakeVideo()
		const draw = stubElements(video)
		const preview = setup({ duration: () => 600 })
		metadata(video)

		for (let index = 0; index < 42; index++) {
			preview.requestPreviewFrame(index * 5)
			video.dispatchEvent(new Event('seeked'))
		}
		expect(video.seeks).toHaveLength(42)
		preview.requestPreviewFrame(0)
		expect(video.seeks).toHaveLength(43)
		video.videoWidth = 0
		video.dispatchEvent(new Event('seeked'))
		expect(draw).toHaveBeenCalledTimes(42)

		video.dispatchEvent(new Event('error'))
		await nextTick()
		expect(preview.hasPreviewFrames.value).toBe(false)
		preview.requestPreviewFrame(20)
		expect(video.seeks).toHaveLength(43)
	})

	it('смена источника сбрасывает кадры; без длительности, без источника и когда выключено — кадров нет', async () => {
		const video = new FakeVideo()
		stubElements(video)
		const preview = setup({ duration: () => Number.NaN })

		preview.requestPreviewFrame(10)
		expect(video.src).toBe('')
		preview.current.value = { src: '/media/other.webm' }
		await nextTick()
		preview.current.value = null
		await nextTick()
		expect(preview.hasPreviewFrames.value).toBe(false)
		expect(setup({ isEnabled: () => false }).hasPreviewFrames.value).toBe(false)

		const live = setup()
		live.requestPreviewFrame(10)
		live.current.value = { src: '/media/next.webm' }
		await nextTick()
		expect(video.removeAttribute).toHaveBeenCalledWith('src')
		expect(video.load).toHaveBeenCalledOnce()
		live.wrapper.unmount()
	})

	it('поток HLS: свой hls.js на самом низком качестве; без hls.js и без поддержки браузера — кадров нет', async () => {
		const video = new FakeVideo()
		stubElements(video)
		const listeners: Record<string, () => void> = {}
		const instance = {
			currentLevel: -1,
			on: vi.fn((name: string, listener: () => void) => (listeners[name] = listener)),
			attachMedia: vi.fn(),
			loadSource: vi.fn(),
			destroy: vi.fn(),
		}
		const Hls = Object.assign(
			vi.fn(function Hls() {
				return instance
			}),
			{ isSupported: () => true },
		) as unknown as MediaHlsConstructor
		const stream = { src: '/media/stream.m3u8' }
		const preview = setup({ Hls: () => Hls, hlsConfig: () => ({ debug: false }) }, stream)

		preview.requestPreviewFrame(10)
		expect(Hls).toHaveBeenCalledWith({ debug: false, startLevel: 0, maxBufferLength: 2, backBufferLength: 0 })
		expect(instance.attachMedia).toHaveBeenCalledWith(video)
		expect(instance.loadSource).toHaveBeenCalledWith('/media/stream.m3u8')
		listeners.hlsManifestParsed()
		expect((instance as unknown as MediaHlsInstance).currentLevel).toBe(0)
		preview.wrapper.unmount()
		expect(instance.destroy).toHaveBeenCalledOnce()

		expect(setup({}, stream).hasPreviewFrames.value).toBe(false)
		video.canPlayType.mockReturnValue('maybe')
		const native = setup({}, stream)
		expect(native.hasPreviewFrames.value).toBe(true)
		native.requestPreviewFrame(10)
		expect(video.src).toBe('/media/stream.m3u8')
	})

	it('миниатюры WebVTT: загрузка, поиск по времени; кадры из записи тогда не нужны', async () => {
		stubElements(new FakeVideo())
		const fetch = vi.fn(async () => new Response('WEBVTT\n\n00:00.000 --> 00:10.000\nsprite.jpg#xywh=0,0,160,90\n'))
		vi.stubGlobal('fetch', fetch)
		const url = ref<string | undefined>('/thumbs/e1.vtt')
		const preview = setup({ thumbnails: () => url.value })

		await vi.waitFor(() => expect(preview.previewThumbnail(5)?.url).toMatch(/\/thumbs\/sprite\.jpg$/))
		expect(preview.hasPreviewFrames.value).toBe(false)
		preview.requestPreviewFrame(5)
		expect(fetch).toHaveBeenCalledOnce()
		expect(preview.previewThumbnail(15)).toBeNull()

		url.value = 'javascript:alert(1)'
		await nextTick()
		expect(preview.previewThumbnail(5)).toBeNull()
		expect(fetch).toHaveBeenCalledOnce()
	})

	it('миниатюры: ошибка сервера, сбой сети и устаревший ответ не показываются', async () => {
		stubElements(new FakeVideo())
		const answers: Array<(response: Response) => void> = []
		vi.stubGlobal(
			'fetch',
			vi.fn((input: string) => {
				if (input.endsWith('/404.vtt')) return Promise.resolve(new Response('', { status: 404 }))
				if (input.endsWith('/down.vtt')) return Promise.reject(new TypeError('offline'))
				return new Promise<Response>(resolve => answers.push(resolve))
			}),
		)
		const url = ref<string | undefined>('/slow.vtt')
		const preview = setup({ thumbnails: () => url.value })

		url.value = '/404.vtt'
		await nextTick()
		answers[0](new Response('WEBVTT\n\n00:00.000 --> 00:10.000\nold.jpg\n'))
		await new Promise(resolve => setTimeout(resolve))
		expect(preview.previewThumbnail(5)).toBeNull()
		url.value = '/down.vtt'
		await nextTick()
		await new Promise(resolve => setTimeout(resolve))
		expect(preview.previewThumbnail(5)).toBeNull()
	})
})
