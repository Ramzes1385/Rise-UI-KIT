import { nextTick, ref } from 'vue'
import { useAudioSync } from '../../model/audio/useAudioSync'
import { fakeMedia, withSetup } from '../utils/BaseMediaPlayer.test-utils'

function setup(initialSrc: string | null = '/audio/dub.m4a') {
	const videoElement = document.createElement('video')
	const audioElement = document.createElement('audio')
	const video = fakeMedia(videoElement, { duration: 60, currentTime: 10 })
	const audio = fakeMedia(audioElement, { duration: 60 })
	const src = ref<string | null>(initialSrc)
	const onError = vi.fn()
	const videoRef = ref<HTMLMediaElement | null>(videoElement)
	const audioRef = ref<HTMLAudioElement | null>(audioElement)
	const { wrapper } = withSetup(() => useAudioSync({ video: videoRef, audio: audioRef, src: () => src.value, onError }))
	return { videoElement, audioElement, video, audio, src, onError, videoRef, audioRef, wrapper }
}

describe('useAudioSync', () => {
	it('подключает файл с позиции и скорости видео; на паузе не запускает', () => {
		const { audioElement, audio } = setup()

		expect(audioElement.getAttribute('src')).toBe('/audio/dub.m4a')
		expect(audio.values.currentTime).toBe(10)
		expect(audio.play).not.toHaveBeenCalled()
	})

	it('следует за видео: запуск, пауза, ожидание, конец, перемотка и скорость', async () => {
		const { videoElement, video, audio } = setup()

		await videoElement.play()
		expect(audio.play).toHaveBeenCalled()
		audio.play.mockClear()
		video.update({ currentTime: 30 }, 'seeking')
		expect(audio.values.currentTime).toBe(30)
		videoElement.playbackRate = 1.5
		expect(audio.values.playbackRate).toBe(1.5)
		for (const event of ['waiting', 'ended', 'emptied', 'error']) video.emit(event)
		videoElement.pause()
		expect(audio.pause).toHaveBeenCalledTimes(5)
		video.update({ paused: false }, 'playing')
		expect(audio.play).toHaveBeenCalledOnce()
	})

	it('расхождение больше 0,3 с исправляется по timeupdate, меньшее — нет', () => {
		const { video, audio } = setup()

		audio.values.currentTime = 10.2
		video.emit('timeupdate')
		expect(audio.values.currentTime).toBe(10.2)
		audio.values.currentTime = 11
		video.emit('timeupdate')
		expect(audio.values.currentTime).toBe(10)
	})

	it('отказ play() аудио не выбрасывается', async () => {
		const { videoElement, audio } = setup()
		audio.play.mockRejectedValueOnce(new DOMException('blocked', 'NotAllowedError'))

		await expect(videoElement.play()).resolves.toBeUndefined()
		await nextTick()
		expect(audio.play).toHaveBeenCalled()
	})

	it('ошибка аудиофайла сообщается; выключение снимает файл и обработчики', async () => {
		const { audioElement, audio, video, src, onError } = setup()

		audio.emit('error')
		expect(onError).toHaveBeenCalledOnce()
		src.value = null
		await nextTick()
		expect(audioElement.hasAttribute('src')).toBe(false)
		expect(audio.load).toHaveBeenCalledOnce()
		audio.emit('error')
		video.emit('timeupdate')
		expect(onError).toHaveBeenCalledOnce()
	})

	it('тот же файл не загружается заново; без элементов и без файла ничего не делает', async () => {
		const { audioElement, audio, videoRef, src } = setup(null)

		expect(audioElement.hasAttribute('src')).toBe(false)
		expect(audio.load).not.toHaveBeenCalled()
		src.value = '/audio/a.m4a'
		await nextTick()
		videoRef.value = null
		await nextTick()
		videoRef.value = document.createElement('video')
		fakeMedia(videoRef.value)
		await nextTick()
		expect(audioElement.getAttribute('src')).toBe('/audio/a.m4a')
		expect(audio.load).not.toHaveBeenCalled()
	})
})
