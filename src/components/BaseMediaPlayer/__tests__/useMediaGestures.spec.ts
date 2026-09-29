import { reactive } from 'vue'
import { withSetup } from './BaseMediaPlayer.test-utils'
import { useMediaGestures } from '../model/useMediaGestures'
import type { MediaActions, MediaState } from '../types/MediaCore.types'

function setup() {
	vi.useFakeTimers()
	const state = reactive({ isPaused: false, playbackRate: 1.25 }) as MediaState
	const actions = { togglePlay: vi.fn(), seekBy: vi.fn(), setPlaybackRate: vi.fn() } as unknown as MediaActions
	const toggleFullscreen = vi.fn()
	const frame = document.createElement('div')
	const { result, wrapper } = withSetup(() => useMediaGestures({ state, actions, seekStep: () => 10, toggleFullscreen }))
	const doubleClick = (clientX: number) => result.onFrameDoubleClick({ clientX, currentTarget: frame } as unknown as MouseEvent)
	return { state, actions, toggleFullscreen, result, wrapper, doubleClick }
}

describe('useMediaGestures', () => {
	afterEach(() => {
		vi.useRealTimers()
	})

	it('двойной клик слева и справа перематывает с подсказкой, по центру — полный экран', () => {
		const { actions, toggleFullscreen, result, doubleClick } = setup()

		doubleClick(10)
		expect(actions.seekBy).toHaveBeenLastCalledWith(-10)
		expect(result.seekHint.value).toEqual({ side: 'left', key: 1 })
		doubleClick(90)
		expect(actions.seekBy).toHaveBeenLastCalledWith(10)
		expect(result.seekHint.value).toEqual({ side: 'right', key: 2 })
		doubleClick(50)
		expect(toggleFullscreen).toHaveBeenCalledOnce()

		vi.advanceTimersByTime(700)
		expect(result.seekHint.value).toBeNull()
	})

	it('удержание во время воспроизведения ускоряет до ×2, отпускание возвращает скорость и не нажимает на кадр', () => {
		const { actions, result } = setup()

		result.onFramePointerDown({ button: 0 } as PointerEvent)
		vi.advanceTimersByTime(500)
		expect(result.isBoosted.value).toBe(true)
		expect(actions.setPlaybackRate).toHaveBeenLastCalledWith(2)

		result.onFramePointerEnd()
		expect(result.isBoosted.value).toBe(false)
		expect(actions.setPlaybackRate).toHaveBeenLastCalledWith(1.25)
		result.onFrameClick()
		expect(actions.togglePlay).not.toHaveBeenCalled()
		result.onFrameClick()
		expect(actions.togglePlay).toHaveBeenCalledOnce()
	})

	it('короткое нажатие, правая кнопка и пауза не ускоряют; размонтирование снимает таймеры', () => {
		const { state, actions, result, wrapper } = setup()

		result.onFramePointerDown({ button: 0 } as PointerEvent)
		result.onFramePointerEnd()
		result.onFramePointerDown({ button: 2 } as PointerEvent)
		state.isPaused = true
		result.onFramePointerDown({ button: 0 } as PointerEvent)
		vi.advanceTimersByTime(500)
		expect(actions.setPlaybackRate).not.toHaveBeenCalled()

		state.isPaused = false
		result.onFramePointerDown({ button: 0 } as PointerEvent)
		wrapper.unmount()
		vi.advanceTimersByTime(500)
		expect(result.isBoosted.value).toBe(false)
	})
})
