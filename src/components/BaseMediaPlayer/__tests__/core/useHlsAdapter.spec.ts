import { nextTick, ref } from 'vue'
import { formatNumber } from '@/locales/state'
import { FakeHls } from '../utils/hls.test-utils'
import { fakeMedia, withSetup } from '../utils/BaseMediaPlayer.test-utils'
import { isHlsSource, useHlsAdapter } from '../../model/core/useHlsAdapter'
import type { MediaSourceItem } from '../../types/playback/MediaCore.types'
import type { MediaHlsConstructor } from '../../types/playback/MediaHls.types'

const STREAM = { src: '/stream/master.m3u8' }

function setup(initial: { source?: MediaSourceItem | null; Hls?: MediaHlsConstructor } = {}) {
	const element = document.createElement('video')
	const fake = fakeMedia(element, { duration: 60, currentTime: 12 })
	const media = ref<HTMLMediaElement | null>(element)
	const source = ref(initial.source === undefined ? STREAM : initial.source)
	const Hls = ref<MediaHlsConstructor | undefined>('Hls' in initial ? initial.Hls : (FakeHls as unknown as MediaHlsConstructor))
	const { result, wrapper } = withSetup(() =>
		useHlsAdapter({ Hls: () => Hls.value, config: () => ({ maxBufferLength: 30 }), media, source: () => source.value }),
	)
	return { result, wrapper, element, fake, media, source, Hls }
}

describe('isHlsSource', () => {
	it.each([
		[{ src: '/a/master.m3u8' }, true],
		[{ src: 'https://cdn.example.com/a.m3u8?token=1' }, true],
		[{ src: '/stream', type: 'application/x-mpegURL' }, true],
		[{ src: '/stream', type: 'application/vnd.apple.mpegurl' }, true],
		[{ src: '/a.mp4', type: 'video/mp4' }, false],
		[{ src: '/a.m3u8.mp4' }, false],
	])('%o → %s', (item, expected) => {
		expect(isHlsSource(item)).toBe(expected)
	})
})

describe('useHlsAdapter', () => {
	beforeEach(() => {
		FakeHls.reset()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('поток через hls.js: настройки, элемент, адрес; свой вывод субтитров', () => {
		const { result, element } = setup()
		const hls = FakeHls.last()

		expect(result.isHlsActive.value).toBe(true)
		expect(hls.config).toEqual({ maxBufferLength: 30 })
		expect(hls.subtitleDisplay).toBe(false)
		expect(hls.attachMedia).toHaveBeenCalledWith(element)
		expect(hls.loadSource).toHaveBeenCalledWith('/stream/master.m3u8')
	})

	it('без hls.js, для другого формата, при встроенном HLS и без поддержки MSE адаптер не включается', async () => {
		expect(setup({ Hls: undefined }).result.isHlsActive.value).toBe(false)
		expect(setup({ source: { src: '/video.mp4' } }).result.isHlsActive.value).toBe(false)
		expect(setup({ source: null }).result.isHlsActive.value).toBe(false)
		FakeHls.isSupported.mockReturnValue(false)
		expect(setup().result.isHlsActive.value).toBe(false)
		FakeHls.isSupported.mockReturnValue(true)
		vi.spyOn(HTMLMediaElement.prototype, 'canPlayType').mockReturnValue('maybe')
		expect(setup().result.isHlsActive.value).toBe(false)
		expect(FakeHls.instances).toHaveLength(0)

		const { media, result } = setup()
		media.value = null
		await nextTick()
		expect(result.isHlsActive.value).toBe(false)
	})

	it('качество: «Авто» с текущим уровнем и уровни от лучшего; выбор уровня и возврат к «Авто»', async () => {
		const { result } = setup()
		const hls = FakeHls.last()
		const quality = result.hlsQuality

		expect(quality.options.value).toEqual([
			{ id: 'auto', label: 'Авто (360p)' },
			{ id: 'hls:1', label: '1080p' },
			{ id: 'hls:0', label: '360p' },
			{ id: 'hls:2', label: `${formatNumber(128)} кбит/с` },
		])
		expect(quality.activeId.value).toBe('auto')
		hls.playingLevel = 1
		hls.emit('hlsLevelSwitched')
		await nextTick()
		expect(quality.options.value[0].label).toBe('Авто (1080p)')
		quality.select('hls:0')
		expect(hls.manualLevel).toBe(0)
		expect(quality.activeId.value).toBe('hls:0')
		quality.select('auto')
		expect(quality.activeId.value).toBe('auto')

		hls.levels = [{ name: 'Единственный' }]
		hls.emit('hlsLevelsUpdated')
		expect(quality.options.value).toEqual([])
		hls.levels = [{ name: 'Низкое' }, { bitrate: 0 }]
		hls.playingLevel = 5
		hls.emit('hlsLevelsUpdated')
		expect(quality.options.value.map(option => option.label)).toEqual(['Авто', 'Низкое', `${formatNumber(0)} кбит/с`])
	})

	it('озвучки потока: названия, текущая и переключение', () => {
		const { result } = setup()
		const hls = FakeHls.last()
		const audio = result.hlsAudio

		expect(audio.options.value).toEqual([
			{ id: 'hls-audio:0', label: 'Японский' },
			{ id: 'hls-audio:1', label: 'ru' },
			{ id: 'hls-audio:2', label: 'Дорожка 3' },
		])
		expect(audio.activeId.value).toBe('hls-audio:0')
		audio.enable('hls-audio:2')
		expect(hls.audioTrack).toBe(2)
		expect(audio.activeId.value).toBe('hls-audio:2')
		hls.audioTracks = [{ name: 'Один' }]
		hls.emit('hlsAudioTracksUpdated')
		expect(audio.options.value).toEqual([])
	})

	it('без экземпляра выбор ничего не ломает', () => {
		const { result } = setup({ source: { src: '/video.mp4' } })

		result.hlsQuality.select('hls:1')
		result.hlsAudio.enable('hls-audio:1')
		expect(result.hlsQuality.activeId.value).toBe('auto')
		expect(result.hlsAudio.activeId.value).toBeNull()
	})

	it('ошибки: сеть и декодирование — одна попытка восстановиться, потом ошибка плеера', () => {
		const { result } = setup()
		const hls = FakeHls.last()

		hls.emit('hlsError', { fatal: false, type: 'networkError' })
		hls.emit('hlsError', { fatal: true, type: 'networkError' })
		expect(hls.startLoad).toHaveBeenCalledOnce()
		expect(result.hlsError.value).toBeNull()
		hls.emit('hlsError', { fatal: true, type: 'mediaError' })
		expect(hls.recoverMediaError).toHaveBeenCalledOnce()
		hls.emit('hlsError', { fatal: true, type: 'networkError', details: 'manifestLoadError' })
		expect(result.hlsError.value).toEqual({
			code: 'network',
			cause: { fatal: true, type: 'networkError', details: 'manifestLoadError' },
		})
		hls.emit('hlsError', { fatal: true, type: 'otherError' })
		expect(result.hlsError.value?.code).toBe('decode')
	})

	it('«Повторить» создаёт hls.js заново и продолжает с той же позиции', async () => {
		const { result, fake } = setup()
		const first = FakeHls.last()
		first.emit('hlsError', { fatal: true, type: 'otherError' })

		result.retryHls()
		await nextTick()
		expect(result.hlsError.value).toBeNull()
		expect(first.destroy).toHaveBeenCalledOnce()
		expect(FakeHls.instances).toHaveLength(2)
		fake.play.mockRejectedValueOnce(new DOMException('blocked', 'NotAllowedError'))
		fake.update({ currentTime: 0 }, 'loadedmetadata')
		await nextTick()
		expect(fake.values.currentTime).toBe(12)
		expect(fake.play).toHaveBeenCalledOnce()
		FakeHls.last().emit('hlsError', { fatal: true, type: 'networkError' })
		expect(FakeHls.last().startLoad).toHaveBeenCalledOnce()
	})

	it('смена источника пересоздаёт hls.js, обычный файл его закрывает; без элемента повтор ничего не ломает', async () => {
		const { source, media, result, wrapper } = setup()

		source.value = { src: '/stream/other.m3u8' }
		await nextTick()
		expect(FakeHls.instances[0].destroy).toHaveBeenCalledOnce()
		expect(FakeHls.last().loadSource).toHaveBeenCalledWith('/stream/other.m3u8')
		source.value = { src: '/video.mp4' }
		await nextTick()
		expect(FakeHls.last().destroy).toHaveBeenCalledOnce()
		media.value = null
		result.retryHls()
		wrapper.unmount()
		expect(FakeHls.instances).toHaveLength(2)
	})
})
