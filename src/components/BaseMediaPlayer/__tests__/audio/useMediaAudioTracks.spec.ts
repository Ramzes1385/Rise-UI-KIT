import { nextTick, ref } from 'vue'
import { fakeMedia, withSetup } from '../utils/BaseMediaPlayer.test-utils'
import { useMediaAudioTracks } from '../../model/audio/useMediaAudioTracks'
import type {
	MediaAudioProvider,
	MediaAudioTrackItem,
	MediaEmbeddedAudioTrack,
	MediaEmbeddedAudioTrackList,
} from '../../types/content/MediaAudio.types'

const ORIGINAL = { label: 'Оригинал' }

const DUB_A = { src: '/audio/a.m4a', label: 'Озвучка A', isDefault: true }

const DUB_B = { src: '/audio/b.m4a', label: 'Озвучка B' }

function embeddedList(tracks: Array<Partial<MediaEmbeddedAudioTrack>>): MediaEmbeddedAudioTrackList {
	const list = new EventTarget() as MediaEmbeddedAudioTrackList
	const items = tracks.map(track => ({ id: '', label: '', language: '', enabled: false, ...track }))
	items.forEach((track, index) => Object.defineProperty(list, index, { value: track, configurable: true }))
	Object.defineProperty(list, 'length', { value: items.length, configurable: true })
	return list
}

async function setup(
	options: {
		tracks?: MediaAudioTrackItem[]
		audioTrack?: string | null
		embedded?: MediaEmbeddedAudioTrackList
		hasAudioElement?: boolean
		stream?: MediaAudioProvider
	} = {},
) {
	const videoElement = document.createElement('video')
	const audioElement = document.createElement('audio')
	const video = fakeMedia(videoElement, { duration: 60, volume: 0.4 })
	const audio = fakeMedia(audioElement)
	if (options.embedded) Object.defineProperty(videoElement, 'audioTracks', { value: options.embedded, configurable: true })
	const tracks = ref(options.tracks)
	const audioTrack = ref(options.audioTrack)
	const sound = ref<HTMLMediaElement | null>(null)
	const emitTrack = vi.fn()
	const flash = vi.fn()
	const { result, wrapper } = withSetup(() =>
		useMediaAudioTracks({
			tracks: () => tracks.value,
			audioTrack: () => audioTrack.value,
			allowedProtocols: () => ['http:', 'https:', 'blob:'],
			video: ref(videoElement),
			audio: ref(options.hasAudioElement === false ? null : audioElement),
			sound,
			emitTrack,
			flash,
			stream: options.stream,
		}),
	)
	await nextTick()
	return { result, wrapper, videoElement, audioElement, video, audio, tracks, audioTrack, sound, emitTrack, flash }
}

describe('useMediaAudioTracks: аудиофайлы', () => {
	it('включает озвучку по умолчанию: звук переходит в аудио с той же громкостью, видео без звука', async () => {
		const { result, videoElement, audioElement, sound, emitTrack } = await setup({ tracks: [ORIGINAL, DUB_A, DUB_B] })

		expect(result.audioOptions.value).toEqual([
			{ id: null, label: 'Оригинал' },
			{ id: '/audio/a.m4a', label: 'Озвучка A' },
			{ id: '/audio/b.m4a', label: 'Озвучка B' },
		])
		expect(result.activeAudioId.value).toBe('/audio/a.m4a')
		expect(emitTrack).toHaveBeenCalledWith('/audio/a.m4a')
		expect(sound.value).toBe(audioElement)
		expect([audioElement.volume, audioElement.muted, videoElement.muted]).toEqual([0.4, false, true])
		expect(audioElement.getAttribute('src')).toBe('/audio/a.m4a')
	})

	it('«Оригинал» возвращает звук видео с громкостью и выключенным звуком аудио', async () => {
		const { result, videoElement, audioElement, sound } = await setup({ tracks: [ORIGINAL, DUB_A] })

		audioElement.volume = 0.7
		audioElement.muted = true
		result.selectAudioTrack(null)
		await nextTick()
		expect(sound.value).toBeNull()
		expect([videoElement.volume, videoElement.muted]).toEqual([0.7, true])
		expect(audioElement.hasAttribute('src')).toBe(false)
		result.selectAudioTrack(null)
		result.selectAudioTrack('/audio/unknown.m4a')
		expect(result.activeAudioId.value).toBeNull()
	})

	it('небезопасные адреса и форматы, которые браузер не воспроизводит, отбрасываются; без «по умолчанию» — первая', async () => {
		vi.spyOn(HTMLMediaElement.prototype, 'canPlayType').mockImplementation(type => (type === 'audio/flac' ? '' : 'maybe'))
		const { result } = await setup({
			tracks: [
				{ src: 'javascript:alert(1)', label: 'XSS' },
				{ src: '/audio/c.flac', label: 'FLAC', type: 'audio/flac' },
				{ src: '/audio/d.m4a', label: 'AAC', type: 'audio/mp4' },
				DUB_B,
			],
		})

		expect(result.audioOptions.value.map(option => option.label)).toEqual(['AAC', 'Озвучка B'])
		expect(result.activeAudioId.value).toBe('/audio/d.m4a')
		vi.restoreAllMocks()
	})

	it('v-model:audio-track: null — оригинал с начала, новое значение переключает', async () => {
		const { result, audioTrack, sound, emitTrack } = await setup({ tracks: [ORIGINAL, DUB_A], audioTrack: null })

		expect(result.activeAudioId.value).toBeNull()
		expect(emitTrack).toHaveBeenCalledWith(null)
		expect(sound.value).toBeNull()
		audioTrack.value = '/audio/a.m4a'
		await nextTick()
		expect(result.activeAudioId.value).toBe('/audio/a.m4a')
		audioTrack.value = undefined
		await nextTick()
		expect(result.activeAudioId.value).toBe('/audio/a.m4a')
	})

	it('ошибка файла: сообщение и возврат к оригиналу; без оригинала — только сообщение', async () => {
		const withOriginal = await setup({ tracks: [ORIGINAL, DUB_A] })
		withOriginal.audio.emit('error')
		await nextTick()
		expect(withOriginal.flash).toHaveBeenCalledWith('Не удалось загрузить озвучку')
		expect(withOriginal.result.activeAudioId.value).toBeNull()

		const withoutOriginal = await setup({ tracks: [DUB_A, DUB_B] })
		withoutOriginal.audio.emit('error')
		expect(withoutOriginal.flash).toHaveBeenCalledOnce()
		expect(withoutOriginal.result.activeAudioId.value).toBe('/audio/a.m4a')
	})

	it('новый список: пропавшая озвучка сменяется озвучкой по умолчанию; пустой список возвращает звук видео', async () => {
		const { result, tracks, sound, videoElement } = await setup({ tracks: [ORIGINAL, DUB_A] })

		tracks.value = [DUB_B, { ...DUB_A, src: '/audio/a2.m4a' }]
		await nextTick()
		expect(result.activeAudioId.value).toBe('/audio/a2.m4a')
		tracks.value = [ORIGINAL, DUB_B, { ...DUB_A, src: '/audio/a2.m4a' }]
		await nextTick()
		expect(result.activeAudioId.value).toBe('/audio/a2.m4a')
		tracks.value = []
		await nextTick()
		expect(sound.value).toBeNull()
		expect(videoElement.muted).toBe(false)
		expect(result.audioOptions.value).toEqual([])
	})
})

describe('useMediaAudioTracks: дорожки внутри файла', () => {
	it('названия из label, языка или номера; включённая дорожка выбрана; выбор меняет enabled', async () => {
		const list = embeddedList([{ id: '1', label: 'Японский', enabled: true }, { id: '', language: 'ru' }, { id: '3' }])
		const { result, emitTrack } = await setup({ embedded: list })

		expect(result.audioOptions.value).toEqual([
			{ id: 'embedded:1', label: 'Японский' },
			{ id: 'embedded:#2', label: 'ru' },
			{ id: 'embedded:3', label: 'Дорожка 3' },
		])
		expect(result.activeAudioId.value).toBe('embedded:1')
		result.selectAudioTrack('embedded:3')
		expect([list[0].enabled, list[2].enabled]).toEqual([false, true])
		expect(result.activeAudioId.value).toBe('embedded:3')
		expect(emitTrack).toHaveBeenCalledWith('embedded:3')
		result.selectAudioTrack('embedded:3')
		expect(emitTrack).toHaveBeenCalledOnce()
	})

	it('одна дорожка — выбирать нечего; выбранная в v-model применяется, когда дорожки появились', async () => {
		const tracks = [{ id: 'a', enabled: true }]
		const list = embeddedList(tracks)
		const { result, emitTrack } = await setup({ embedded: list, audioTrack: 'embedded:b' })

		expect(result.audioOptions.value).toEqual([])
		expect(emitTrack).not.toHaveBeenCalled()
		Object.defineProperty(list, 1, { value: { id: 'b', label: 'Второй', language: '', enabled: false }, configurable: true })
		Object.defineProperty(list, 'length', { value: 2, configurable: true })
		list.dispatchEvent(new Event('addtrack'))
		await nextTick()
		expect(result.activeAudioId.value).toBe('embedded:b')
		expect(emitTrack).toHaveBeenCalledWith('embedded:b')
	})

	it('без выбранной дорожки активной нет', async () => {
		const { result } = await setup({ embedded: embeddedList([{ id: 'a' }, { id: 'b' }]) })

		expect(result.activeAudioId.value).toBeNull()
	})

	it('обработчики списка снимаются вместе с плеером', async () => {
		const list = embeddedList([{ id: 'a', enabled: true }, { id: 'b' }])
		const remove = vi.spyOn(list, 'removeEventListener')
		const { wrapper } = await setup({ embedded: list })

		wrapper.unmount()
		expect(remove).toHaveBeenCalledTimes(3)
	})
})

describe('useMediaAudioTracks: без аудиоэлемента', () => {
	it('выбор запоминается, звук не переключается', async () => {
		const { result, sound, videoElement } = await setup({ tracks: [ORIGINAL, DUB_A], hasAudioElement: false })

		expect(result.activeAudioId.value).toBe('/audio/a.m4a')
		expect(sound.value).toBeNull()
		expect(videoElement.muted).toBe(false)
	})
})

describe('useMediaAudioTracks: дорожки потока', () => {
	it('дорожки потока важнее дорожек файла; выбор передаётся потоку', async () => {
		const active = ref<string | null>('hls-audio:0')
		const stream = {
			options: ref([
				{ id: 'hls-audio:0', label: 'Японский' },
				{ id: 'hls-audio:1', label: 'Русский' },
			]),
			activeId: active,
			enable: vi.fn((id: string) => {
				active.value = id
			}),
		}
		const { result, emitTrack } = await setup({ stream, embedded: embeddedList([{ id: 'a', enabled: true }, { id: 'b' }]) })

		expect(result.audioOptions.value.map(option => option.label)).toEqual(['Японский', 'Русский'])
		result.selectAudioTrack('hls-audio:1')
		expect(stream.enable).toHaveBeenCalledWith('hls-audio:1')
		expect(emitTrack).toHaveBeenCalledWith('hls-audio:1')
		stream.options.value = []
		await nextTick()
		expect(result.audioOptions.value.map(option => option.id)).toEqual(['embedded:a', 'embedded:b'])
	})
})
