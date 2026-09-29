import { nextTick, reactive, ref } from 'vue'
import { useMediaClips } from '../model/useMediaClips'
import { withSetup } from './BaseMediaPlayer.test-utils'
import type { MediaClip } from '../types/MediaPlaylist.types'
import type { MediaActions, MediaState } from '../types/MediaCore.types'

const INTRO: MediaClip = { sources: [{ src: '/clips/intro.webm', type: 'video/webm' }] }

const OUTRO: MediaClip = { sources: '/clips/outro.webm', title: 'Титры', skipAfter: 3 }

function setup(clips: { intro?: MediaClip | null; outro?: MediaClip | null } = { intro: INTRO, outro: OUTRO }) {
	vi.spyOn(HTMLMediaElement.prototype, 'canPlayType').mockReturnValue('maybe')
	const state = reactive({ currentTime: 0, isEnded: false, volume: 0.4 }) as unknown as MediaState
	const actions = { play: vi.fn(async () => undefined), pause: vi.fn() } as unknown as MediaActions
	const media = ref<HTMLVideoElement | null>(document.createElement('video'))
	const clipMedia = ref<HTMLVideoElement | null>(null)
	const key = ref('e1')
	const isAdPlaying = ref(false)
	const intro = ref(clips.intro)
	const clips$ = withSetup(() =>
		useMediaClips({
			intro: () => intro.value,
			outro: () => clips.outro,
			contentKey: () => key.value,
			state,
			actions,
			media,
			clipMedia,
			isAdPlaying: () => isAdPlaying.value,
			allowedProtocols: () => ['http:', 'https:'],
		}),
	).result
	const play = (): boolean => media.value?.dispatchEvent(new Event('play')) ?? false
	return { clips: clips$, state, actions, media, clipMedia, key, isAdPlaying, intro, play }
}

function clipElement(paused = true) {
	const element = document.createElement('video')
	Object.defineProperty(element, 'paused', { configurable: true, get: () => paused })
	const play = vi.spyOn(element, 'play').mockResolvedValue()
	const pause = vi.spyOn(element, 'pause').mockImplementation(() => undefined)
	return { element, play, pause }
}

describe('интро и аутро — отдельные ролики', () => {
	afterEach(() => vi.restoreAllMocks())

	it('интро: при запуске с начала основная запись ждёт, «Пропустить» возвращает к ней; второй раз не играет', async () => {
		const { clips, actions, play } = setup()

		play()
		expect(actions.pause).toHaveBeenCalledOnce()
		expect(clips.activeClip.value).toBe('intro')
		expect(clips.clipSrc.value).toBe('/clips/intro.webm')
		expect(clips.clipLabel.value).toBe('Интро')
		expect(clips.clipSkipLabel.value).toBe('Пропустить интро')
		expect(clips.canSkipClip.value).toBe(true)
		expect(clips.clipSkipText.value).toBe('')
		expect(clips.isClipPlaying.value).toBe(true)
		clips.finishClip()
		expect(clips.activeClip.value).toBeNull()
		expect(actions.play).toHaveBeenCalledOnce()
		play()
		expect(clips.activeClip.value).toBeNull()
	})

	it('интро не мешает: продолжение с середины, реклама, неподходящий адрес; новая серия — снова интро', async () => {
		const { clips, state, key, isAdPlaying, intro, play } = setup()

		state.currentTime = 30
		play()
		expect(clips.activeClip.value).toBeNull()
		state.currentTime = 0
		isAdPlaying.value = true
		play()
		expect(clips.activeClip.value).toBeNull()
		isAdPlaying.value = false
		intro.value = { sources: 'javascript:alert(1)' }
		play()
		expect(clips.activeClip.value).toBeNull()
		intro.value = INTRO
		play()
		expect(clips.activeClip.value).toBe('intro')
		key.value = 'e2'
		await nextTick()
		expect(clips.activeClip.value).toBeNull()
		play()
		expect(clips.activeClip.value).toBe('intro')
	})

	it('аутро: после конца серии держит отсчёт, ждёт рекламу, «Пропустить через N», конец ролика отпускает', async () => {
		const { clips, state, actions, isAdPlaying } = setup({ outro: OUTRO })

		isAdPlaying.value = true
		state.isEnded = true
		await nextTick()
		expect(clips.activeClip.value).toBeNull()
		expect(clips.isClipHeld.value).toBe(true)
		isAdPlaying.value = false
		await nextTick()
		expect(clips.activeClip.value).toBe('outro')
		expect(clips.clipLabel.value).toBe('Титры')
		expect(clips.clipSkipLabel.value).toBe('Пропустить аутро')
		expect(clips.canSkipClip.value).toBe(false)
		expect(clips.clipSkipText.value).toBe('Пропустить через 3')
		const element = document.createElement('video')
		Object.defineProperty(element, 'duration', { configurable: true, value: 4 })
		element.currentTime = 2.2
		clips.onClipTime({ target: element } as unknown as Event)
		expect(clips.clipSkipText.value).toBe('Пропустить через 1')
		expect(clips.clipProgressStyle.value).toEqual({ width: '55.00000000000001%' })
		Object.defineProperty(element, 'duration', { configurable: true, value: Number.NaN })
		clips.onClipTime({ target: element } as unknown as Event)
		expect(clips.clipProgressStyle.value).toEqual({ width: '0%' })
		clips.finishClip()
		expect(clips.isClipHeld.value).toBe(false)
		expect(actions.play).not.toHaveBeenCalled()
	})

	it('ролик запускается сам с громкостью плеера; без звука, если браузер не дал; не запустился — пропускается', async () => {
		const { clips, clipMedia, play } = setup()
		const clip = clipElement()
		clip.play.mockRejectedValueOnce(new DOMException('blocked', 'NotAllowedError'))

		play()
		clipMedia.value = clip.element
		await vi.waitFor(() => expect(clip.play).toHaveBeenCalledTimes(2))
		expect(clip.element.volume).toBe(0.4)
		expect(clip.element.muted).toBe(true)
		expect(clips.activeClip.value).toBe('intro')

		const broken = setup()
		const failing = clipElement()
		failing.play.mockRejectedValue(new DOMException('decode', 'NotSupportedError'))
		broken.play()
		broken.clipMedia.value = failing.element
		await vi.waitFor(() => expect(broken.clips.activeClip.value).toBeNull())
	})

	it('пауза ролика: кнопка ставит на паузу и продолжает, состояние — по событиям элемента', async () => {
		const { clips, clipMedia, play } = setup()
		const playing = clipElement(false)

		clips.toggleClipPause()
		play()
		clipMedia.value = playing.element
		await nextTick()
		clips.toggleClipPause()
		expect(playing.pause).toHaveBeenCalledOnce()
		clips.onClipPlayState({ target: { paused: true } } as unknown as Event)
		expect(clips.isClipPaused.value).toBe(true)
		expect(clips.clipPauseLabel.value).toBe('Воспроизвести')
		const paused = clipElement(true)
		clipMedia.value = paused.element
		clips.toggleClipPause()
		expect(paused.play).toHaveBeenCalled()
		clips.onClipPlayState({ target: { paused: false } } as unknown as Event)
		expect(clips.clipPauseLabel.value).toBe('Пауза')
	})

	it('без роликов ничего не происходит, отсчёт не держится', async () => {
		const { clips, state, play } = setup({ intro: null, outro: null })

		play()
		state.isEnded = true
		await nextTick()
		expect(clips.activeClip.value).toBeNull()
		expect(clips.isClipHeld.value).toBe(false)
		expect(clips.clipSrc.value).toBeUndefined()
	})
})
