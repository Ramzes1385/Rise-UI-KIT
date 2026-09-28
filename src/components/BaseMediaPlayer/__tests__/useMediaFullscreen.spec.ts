import { ref } from 'vue'
import { withSetup } from './BaseMediaPlayer.test-utils'
import { useMediaFullscreen } from '../model/useMediaFullscreen'

const DOCUMENT_KEYS = ['fullscreenEnabled', 'fullscreenElement', 'exitFullscreen'] as const

function setup({ isEnabled = true, hasWebkit = false } = {}) {
	const screen = { element: null as Element | null }
	const change = (element: Element | null): void => {
		screen.element = element
		document.dispatchEvent(new Event('fullscreenchange'))
	}
	const target = document.createElement('div')
	const video = document.createElement('video')
	const requestFullscreen = vi.fn(async () => change(target))
	const exitFullscreen = vi.fn(async () => change(null))
	const webkitEnterFullscreen = vi.fn()
	Object.defineProperty(document, 'fullscreenEnabled', { configurable: true, value: isEnabled })
	Object.defineProperty(document, 'fullscreenElement', { configurable: true, get: () => screen.element })
	Object.defineProperty(document, 'exitFullscreen', { configurable: true, value: exitFullscreen })
	Object.assign(target, { requestFullscreen })
	if (hasWebkit) Object.assign(video, { webkitEnterFullscreen })
	const { result, wrapper } = withSetup(() => useMediaFullscreen(ref(target), ref(video)))
	return { result, wrapper, screen, target, video, requestFullscreen, exitFullscreen, webkitEnterFullscreen }
}

describe('useMediaFullscreen', () => {
	afterEach(() => {
		DOCUMENT_KEYS.forEach(key => Reflect.deleteProperty(document, key))
	})

	it('разворачивает контейнер через Fullscreen API и сворачивает обратно', async () => {
		const { result, target, requestFullscreen, exitFullscreen } = setup()

		expect(result.isSupported.value).toBe(true)
		await result.toggle()
		expect(requestFullscreen).toHaveBeenCalledOnce()
		expect(document.fullscreenElement).toBe(target)
		expect(result.isFullscreen.value).toBe(true)

		await result.toggle()
		expect(exitFullscreen).toHaveBeenCalledOnce()
		expect(result.isFullscreen.value).toBe(false)
	})

	it('отказ браузера не выбрасывает исключение; выход без полноэкранного режима ничего не делает', async () => {
		const { result, screen, requestFullscreen, exitFullscreen } = setup()

		requestFullscreen.mockRejectedValueOnce(new TypeError('denied'))
		await expect(result.enter()).resolves.toBeUndefined()
		await result.exit()
		expect(exitFullscreen).not.toHaveBeenCalled()

		screen.element = document.body
		exitFullscreen.mockRejectedValueOnce(new TypeError('denied'))
		await expect(result.exit()).resolves.toBeUndefined()
	})

	it('iOS: полноэкранный режим самого видео', async () => {
		const { result, video, webkitEnterFullscreen } = setup({ isEnabled: false, hasWebkit: true })

		expect(result.isSupported.value).toBe(true)
		await result.enter()
		expect(webkitEnterFullscreen).toHaveBeenCalledOnce()

		video.dispatchEvent(new Event('webkitbeginfullscreen'))
		expect(result.isFullscreen.value).toBe(true)
		video.dispatchEvent(new Event('webkitendfullscreen'))
		expect(result.isFullscreen.value).toBe(false)
	})

	it('без поддержки кнопка не нужна; после размонтирования события не слушаются', async () => {
		const { result, wrapper, video } = setup({ isEnabled: false })

		expect(result.isSupported.value).toBe(false)
		await result.enter()
		wrapper.unmount()
		video.dispatchEvent(new Event('webkitbeginfullscreen'))
		document.dispatchEvent(new Event('fullscreenchange'))
		expect(result.isFullscreen.value).toBe(false)
	})
})
