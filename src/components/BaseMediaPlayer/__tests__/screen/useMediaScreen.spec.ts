import { nextTick, reactive, ref } from 'vue'
import { useMediaMini } from '../../model/screen/useMediaMini'
import { withSetup } from '../utils/BaseMediaPlayer.test-utils'
import { useAmbientLight } from '../../model/screen/useAmbientLight'
import type { DropdownMenuItem } from '@components/BaseDropdownMenu'
import { useMediaRotation } from '../../model/screen/useMediaRotation'
import type { MediaState } from '../../types/playback/MediaCore.types'
import { withFrameItems } from '../../model/panels/useMediaContextMenu'

class FakeObserver {
	static last: FakeObserver | undefined
	observed: Element[] = []
	disconnect = vi.fn()
	readonly callback: IntersectionObserverCallback
	constructor(callback: IntersectionObserverCallback) {
		this.callback = callback
		FakeObserver.last = this
	}
	observe(element: Element): void {
		this.observed.push(element)
	}
	report(ratio: number, top: number): void {
		const entry = { intersectionRatio: ratio, boundingClientRect: { top } } as IntersectionObserverEntry
		this.callback([entry], this as unknown as IntersectionObserver)
	}
}

function playerState(patch: Partial<MediaState> = {}): MediaState {
	return reactive({ isPaused: true, isSeeking: false, ...patch }) as unknown as MediaState
}

function wideVideo(): HTMLVideoElement {
	const video = document.createElement('video')
	Object.defineProperties(video, { videoWidth: { value: 1920 }, videoHeight: { value: 1080 } })
	return video
}

describe('мини-плеер', () => {
	afterEach(() => {
		vi.unstubAllGlobals()
		FakeObserver.last = undefined
	})

	function setup(isEnabled = true) {
		vi.stubGlobal('IntersectionObserver', FakeObserver)
		const root = ref<HTMLElement | null>(document.createElement('div'))
		const state = playerState()
		const isFullscreen = ref(false)
		const pause = vi.fn()
		const { result, wrapper } = withSetup(() =>
			useMediaMini({ root, isEnabled: () => isEnabled, isFullscreen: () => isFullscreen.value, state, pause }),
		)
		return { result, wrapper, root, state, isFullscreen, pause, observer: FakeObserver.last as FakeObserver }
	}

	it('идущая запись, прокрученная выше экрана, переезжает в угол; пауза её не возвращает, возврат места — возвращает', async () => {
		const { result, state, observer, root } = setup()

		expect(observer.observed).toEqual([root.value])
		observer.report(0.1, 200)
		state.isPaused = false
		await nextTick()
		expect(result.isMini.value).toBe(false)
		observer.report(0.1, -300)
		await nextTick()
		expect(result.isMini.value).toBe(true)
		state.isPaused = true
		await nextTick()
		expect(result.isMini.value).toBe(true)
		observer.report(0.6, -20)
		await nextTick()
		expect(result.isMini.value).toBe(false)
	})

	it('«Закрыть» ставит на паузу и не открывает мини-плеер снова, пока место плеера не видно; во весь экран — не мини', async () => {
		const { result, state, observer, isFullscreen, pause, root, wrapper } = setup()
		state.isPaused = false
		observer.report(0, -400)
		await nextTick()

		isFullscreen.value = true
		expect(result.isMini.value).toBe(false)
		isFullscreen.value = false
		result.expandMini()
		expect(root.value?.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' })
		result.closeMini()
		expect(pause).toHaveBeenCalledOnce()
		expect(result.isMini.value).toBe(false)
		state.isPaused = true
		await nextTick()
		state.isPaused = false
		await nextTick()
		expect(result.isMini.value).toBe(false)
		observer.report(1, 0)
		await nextTick()
		observer.report(0, -400)
		await nextTick()
		expect(result.isMini.value).toBe(true)
		wrapper.unmount()
		expect(observer.disconnect).toHaveBeenCalledOnce()
	})

	it('выключен свойством, без IntersectionObserver или без корня — не включается', async () => {
		const off = setup(false)
		off.state.isPaused = false
		off.observer.report(0, -400)
		await nextTick()
		expect(off.result.isMini.value).toBe(false)

		vi.unstubAllGlobals()
		vi.stubGlobal('IntersectionObserver', undefined)
		const root = ref<HTMLElement | null>(null)
		const bare = withSetup(() =>
			useMediaMini({ root, isEnabled: () => true, isFullscreen: () => false, state: playerState(), pause: vi.fn() }),
		)
		expect(bare.result.isMini.value).toBe(false)
		bare.result.expandMini()
	})
})

describe('поворот картинки', () => {
	afterEach(() => Reflect.deleteProperty(screen, 'orientation'))

	it('по кругу на 90°: класс корня и подпись с углом', () => {
		const { result } = withSetup(() => useMediaRotation({ media: ref(wideVideo()), isFullscreen: () => false }))

		expect([result.rotationClass.value, result.rotationText.value]).toEqual(['', '0°'])
		result.rotateFrame()
		expect([result.rotationClass.value, result.rotationText.value]).toEqual(['base-media-player--rotate-90', '90°'])
		result.rotateFrame()
		result.rotateFrame()
		result.rotateFrame()
		expect(result.rotation.value).toBe(0)
	})

	it('во весь экран — горизонтально для широкой картинки, вертикально — повёрнутой на 90°; при выходе — снимает', async () => {
		const lock = vi.fn(async () => undefined)
		const unlock = vi.fn()
		Object.defineProperty(screen, 'orientation', { configurable: true, value: { lock, unlock } })
		const isFullscreen = ref(false)
		const { result } = withSetup(() => useMediaRotation({ media: ref(wideVideo()), isFullscreen: () => isFullscreen.value }))

		isFullscreen.value = true
		await nextTick()
		expect(lock).toHaveBeenLastCalledWith('landscape')
		isFullscreen.value = false
		await nextTick()
		expect(unlock).toHaveBeenCalledOnce()
		result.rotateFrame()
		lock.mockRejectedValueOnce(new DOMException('not supported', 'NotSupportedError'))
		isFullscreen.value = true
		await nextTick()
		expect(lock).toHaveBeenLastCalledWith('portrait')
	})

	it('без Screen Orientation API и без размеров кадра — не мешает', async () => {
		Object.defineProperty(screen, 'orientation', { configurable: true, value: {} })
		const isFullscreen = ref(false)
		withSetup(() => useMediaRotation({ media: ref(null), isFullscreen: () => isFullscreen.value }))
		isFullscreen.value = true
		await nextTick()

		const lock = vi.fn(async () => undefined)
		Object.defineProperty(screen, 'orientation', { configurable: true, value: { lock, unlock: vi.fn() } })
		const other = ref(false)
		withSetup(() => useMediaRotation({ media: ref(document.createElement('video')), isFullscreen: () => other.value }))
		other.value = true
		await nextTick()
		expect(lock).toHaveBeenCalledWith('landscape')
	})
})

describe('подсветка вокруг плеера', () => {
	afterEach(() => {
		localStorage.clear()
		vi.restoreAllMocks()
		vi.useRealTimers()
	})

	function frameData(): Uint8ClampedArray {
		const data = new Uint8ClampedArray(8 * 4 * 4)
		for (let pixel = 0; pixel < 32; pixel++) {
			const edge = { 0: [200, 0, 0, 255], 7: [0, 0, 200, 255] }[pixel % 8]
			data.set(edge ?? [0, 100, 0, 255], pixel * 4)
		}
		return data
	}

	function stubCanvas(getImageData: () => { data: Uint8ClampedArray }) {
		const drawImage = vi.fn()
		vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
			drawImage,
			getImageData,
		} as unknown as CanvasRenderingContext2D)
		return drawImage
	}

	function readyVideo(readyState = 4): HTMLVideoElement {
		const video = document.createElement('video')
		Object.defineProperty(video, 'readyState', { value: readyState })
		return video
	}

	it('выключена по умолчанию; включение запоминается; во время воспроизведения цвета краёв кадра обновляются', async () => {
		vi.useFakeTimers()
		const drawImage = stubCanvas(() => ({ data: frameData() }))
		const state = playerState({ isPaused: false })
		const { result, wrapper } = withSetup(() => useAmbientLight({ media: ref(readyVideo()), state }))

		expect(result.isAmbient.value).toBe(false)
		expect(result.ambientStyle.value).toEqual({})
		result.setAmbient(true)
		await nextTick()
		expect(localStorage.getItem('rise-media:ambient')).toBe('1')
		const glow = (result.ambientStyle.value as Record<string, string>)['--media-ambient']
		expect(glow).toContain('-48px 0 96px -12px rgb(200 0 0 / 75%)')
		expect(glow).toContain('48px 0 96px -12px rgb(0 0 200 / 75%)')
		expect(glow).toContain('0 -32px 96px -12px rgb(25 75 25 / 75%)')
		vi.advanceTimersByTime(1000)
		expect(drawImage).toHaveBeenCalledTimes(3)
		state.isPaused = true
		await nextTick()
		vi.advanceTimersByTime(1000)
		expect(drawImage).toHaveBeenCalledTimes(4)
		wrapper.unmount()
	})

	it('кадр с чужого домена без CORS — ровное синее свечение; кадр не готов — без изменений; сохранённое включение читается', async () => {
		localStorage.setItem('rise-media:ambient', '1')
		stubCanvas(() => {
			throw new DOMException('tainted', 'SecurityError')
		})
		const { result } = withSetup(() => useAmbientLight({ media: ref(readyVideo()), state: playerState() }))
		expect(result.isAmbient.value).toBe(true)
		expect(result.ambientStyle.value).toEqual({ '--media-ambient': '0 0 64px 8px rgb(59 130 246 / 35%)' })

		const drawImage = stubCanvas(() => ({ data: frameData() }))
		const early = withSetup(() => useAmbientLight({ media: ref(readyVideo(1)), state: playerState() }))
		expect(drawImage).not.toHaveBeenCalled()
		expect(early.result.isAmbient.value).toBe(true)
		withSetup(() => useAmbientLight({ media: ref(null), state: playerState() }))
		expect(drawImage).not.toHaveBeenCalled()
	})

	it('недоступное хранилище не мешает', () => {
		vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
			throw new DOMException('denied', 'SecurityError')
		})
		vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
			throw new DOMException('denied', 'SecurityError')
		})
		const { result } = withSetup(() => useAmbientLight({ media: ref(null), state: playerState() }))

		expect(result.isAmbient.value).toBe(false)
		result.setAmbient(true)
		expect(result.isAmbient.value).toBe(true)
	})
})

describe('пункты кадра в контекстном меню', () => {
	it('после первой группы — «Повернуть картинку» с углом и «Подсветка»; в аудиорежиме их нет', () => {
		const items = ref<DropdownMenuItem[][]>([[{ label: 'Повторять' }], [{ label: 'Данные для отладки' }]])
		const isAudio = ref(false)
		const rotateFrame = vi.fn()
		const setAmbient = vi.fn()
		const menu = withFrameItems(items, {
			rotationText: ref('90°'),
			rotateFrame,
			isAmbient: ref(true),
			setAmbient,
			isAudio,
		})

		const [, frame] = menu.value
		expect(menu.value.map(group => group.map(item => item.label))).toEqual([
			['Повторять'],
			['Повернуть картинку', 'Подсветка'],
			['Данные для отладки'],
		])
		expect(frame[0]).toMatchObject({ icon: 'rotate-right', shortcut: '90°' })
		frame[0].onSelect?.(new Event('click'))
		expect(rotateFrame).toHaveBeenCalledOnce()
		expect(frame[1]).toMatchObject({ type: 'checkbox', isChecked: true })
		frame[1].onUpdateChecked?.(false)
		expect(setAmbient).toHaveBeenCalledWith(false)
		isAudio.value = true
		expect(menu.value).toBe(items.value)
	})
})
