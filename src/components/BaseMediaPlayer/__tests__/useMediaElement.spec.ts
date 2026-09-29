import { nextTick, ref } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { useMediaElement } from '../model/useMediaElement'
import type { FakeMediaValues } from './BaseMediaPlayer.test-utils'
import { domException, fakeMedia, withSetup } from './BaseMediaPlayer.test-utils'

function setup(initial: Partial<FakeMediaValues> = {}) {
	const element = document.createElement('video')
	const fake = fakeMedia(element, initial)
	const media = ref<HTMLMediaElement | null>(element)
	const { result, wrapper } = withSetup(() => useMediaElement(media))
	return { element, fake, media, wrapper, ...result }
}

describe('useMediaElement', () => {
	let frames: FrameRequestCallback[]

	beforeEach(() => {
		frames = []
		vi.stubGlobal(
			'requestAnimationFrame',
			vi.fn((callback: FrameRequestCallback) => frames.push(callback)),
		)
		vi.stubGlobal('cancelAnimationFrame', vi.fn())
	})

	afterEach(() => {
		vi.unstubAllGlobals()
	})

	it('читает состояние элемента при подключении и после loadedmetadata', () => {
		const { fake, state } = setup({ duration: 60, buffered: [[0, 10]], volume: 0.5, muted: true, playbackRate: 1.5 })

		expect(state).toMatchObject({ duration: 60, buffered: [[0, 10]], volume: 0.5, isMuted: true, playbackRate: 1.5, isPaused: true })
		fake.update({ duration: 90, currentTime: 12 }, 'loadedmetadata')
		expect(state).toMatchObject({ duration: 90, currentTime: 12, error: null })
	})

	it('обновляет состояние по событиям элемента', () => {
		const { element, fake, state } = setup({ duration: 60 })

		fake.update({ duration: 75 }, 'durationchange')
		fake.update(
			{
				buffered: [
					[0, 5],
					[10, 20],
				],
			},
			'progress',
		)
		expect(state).toMatchObject({
			duration: 75,
			buffered: [
				[0, 5],
				[10, 20],
			],
		})

		fake.emit('play')
		fake.emit('waiting')
		expect(state).toMatchObject({ isPaused: false, isWaiting: true })
		fake.emit('playing')
		expect(state.isWaiting).toBe(false)
		fake.emit('waiting')
		fake.emit('canplay')
		expect(state.isWaiting).toBe(false)

		fake.update({ seeking: true, currentTime: 30 }, 'seeking')
		expect(state).toMatchObject({ isSeeking: true, currentTime: 30 })
		fake.update({ seeking: false, currentTime: 31 }, 'seeked')
		expect(state).toMatchObject({ isSeeking: false, currentTime: 31 })

		fake.emit('pause')
		expect(state.isPaused).toBe(true)
		fake.emit('play')
		fake.emit('ended')
		expect(state).toMatchObject({ isEnded: true, isPaused: true })

		element.volume = 0.3
		element.muted = true
		element.playbackRate = 2
		expect(state).toMatchObject({ volume: 0.3, isMuted: true, playbackRate: 2 })
	})

	it('ошибки MediaError превращаются в коды; emptied сбрасывает ошибку', () => {
		const { fake, state } = setup()

		fake.emit('waiting')
		fake.update({ error: { code: 2 } }, 'error')
		expect(state).toMatchObject({ error: { code: 'network', cause: { code: 2 } }, isWaiting: false })
		fake.update({ error: { code: 9 } }, 'error')
		expect(state.error?.code).toBe('unknown')
		fake.update({ error: null }, 'emptied')
		expect(state.error).toBeNull()
	})

	it('timeupdate обновляет позицию не чаще раза за кадр', () => {
		const { fake, state } = setup({ duration: 60 })

		fake.update({ currentTime: 1 }, 'timeupdate')
		fake.update({ currentTime: 2 }, 'timeupdate')
		expect(requestAnimationFrame).toHaveBeenCalledOnce()
		expect(state.currentTime).toBe(0)

		frames[0](0)
		expect(state.currentTime).toBe(2)
		fake.update({ currentTime: 3 }, 'timeupdate')
		expect(requestAnimationFrame).toHaveBeenCalledTimes(2)
	})

	it('при смене элемента снимает обработчики и отменяет кадр', async () => {
		const { fake, media, state, wrapper } = setup()

		fake.update({ currentTime: 1 }, 'timeupdate')
		media.value = null
		await nextTick()

		expect(cancelAnimationFrame).toHaveBeenCalled()
		fake.emit('play')
		expect(state.isPaused).toBe(true)
		wrapper.unmount()
	})

	it('play: запуск, отказ автозапуска, AbortError и прочие ошибки', async () => {
		const { fake, state, actions } = setup()

		await actions.play()
		expect(state.isPaused).toBe(false)

		fake.play.mockRejectedValueOnce(domException('NotAllowedError'))
		await actions.play()
		expect(state).toMatchObject({ error: { code: 'autoplay-blocked' }, isPaused: true })

		fake.play.mockRejectedValueOnce(domException('AbortError'))
		await actions.play()
		expect(state.error).toBeNull()

		fake.play.mockRejectedValueOnce(new Error('boom'))
		await actions.play()
		expect(state.error?.code).toBe('unknown')
	})

	it('togglePlay, pause, seek и seekBy с ограничением длительностью', async () => {
		const { fake, state, actions } = setup({ duration: 60 })

		await actions.togglePlay()
		expect(fake.play).toHaveBeenCalledOnce()
		await actions.togglePlay()
		actions.pause()
		expect(fake.pause).toHaveBeenCalledTimes(2)

		actions.seek(30)
		expect([fake.values.currentTime, state.currentTime]).toEqual([30, 30])
		actions.seekBy(-50)
		expect(state.currentTime).toBe(0)
		actions.seekBy(100)
		expect(state.currentTime).toBe(60)
		actions.seek(Number.NaN)
		expect(state.currentTime).toBe(60)
	})

	it('до загрузки длительности перемотка не ограничена сверху', () => {
		const { state, actions } = setup()

		actions.seek(15)
		expect(state.currentTime).toBe(15)
	})

	it('громкость в пределах 0…1, ненулевая громкость включает звук; mute и скорость', () => {
		const { state, actions } = setup({ muted: true })

		actions.setVolume(-1)
		expect(state).toMatchObject({ volume: 0, isMuted: true })
		actions.setVolume(1.5)
		expect(state).toMatchObject({ volume: 1, isMuted: false })
		actions.toggleMute()
		expect(state.isMuted).toBe(true)
		actions.setPlaybackRate(1.5)
		expect(state.playbackRate).toBe(1.5)
	})

	it('retry загружает источник заново и продолжает с той же позиции', async () => {
		const { fake, state, actions } = setup({ duration: 60 })

		actions.seek(20)
		fake.update({ error: { code: 2 } }, 'error')
		actions.retry()
		expect(state.error).toBeNull()
		expect(fake.load).toHaveBeenCalledOnce()

		fake.update({ currentTime: 0, error: null }, 'loadedmetadata')
		await flushPromises()
		expect(fake.values.currentTime).toBe(20)
		expect(fake.play).toHaveBeenCalledOnce()
	})

	it('без элемента команды ничего не делают', async () => {
		const { result } = withSetup(() => useMediaElement(ref(null)))
		const { actions, state } = result

		await actions.play()
		await actions.togglePlay()
		actions.pause()
		actions.seek(5)
		actions.setVolume(0.5)
		actions.toggleMute()
		actions.setPlaybackRate(2)
		actions.retry()

		expect(state).toMatchObject({ currentTime: 0, volume: 1, isMuted: false, playbackRate: 1, error: null })
	})

	it('громкость и звук — у элемента, который звучит: переключение на аудио и обратно', async () => {
		const element = document.createElement('video')
		const audioElement = document.createElement('audio')
		fakeMedia(element, { volume: 0.5 })
		const audio = fakeMedia(audioElement, { volume: 0.8, muted: true })
		const sound = ref<HTMLMediaElement | null>(null)
		const { state, actions } = withSetup(() => useMediaElement(ref(element), sound)).result

		expect(state).toMatchObject({ volume: 0.5, isMuted: false })
		sound.value = audioElement
		await nextTick()
		expect(state).toMatchObject({ volume: 0.8, isMuted: true })
		actions.setVolume(0.3)
		actions.toggleMute()
		actions.setMuted(true)
		expect(audio.values).toMatchObject({ volume: 0.3, muted: true })
		expect(element.volume).toBe(0.5)
		element.muted = true
		expect(state.isMuted).toBe(true)
		audioElement.muted = false
		expect(state.isMuted).toBe(false)
		sound.value = null
		await nextTick()
		expect(state).toMatchObject({ volume: 0.5, isMuted: true })
	})
})
