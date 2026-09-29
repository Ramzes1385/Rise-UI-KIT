import { nextTick, ref } from 'vue'
import { withSetup } from '../utils/BaseMediaPlayer.test-utils'
import { useMediaHotkeys } from '../../model/input/useMediaHotkeys'

function setup() {
	const target = document.createElement('div')
	target.innerHTML = '<button type="button">Кнопка</button><input aria-label="Поле" /><span tabindex="0">Кадр</span>'
	document.body.append(target)
	const actions = {
		togglePlay: vi.fn(),
		seekBy: vi.fn(),
		seekToFraction: vi.fn(),
		changeVolume: vi.fn(),
		toggleMute: vi.fn(),
		toggleFullscreen: vi.fn(),
		toggleTheater: vi.fn(),
		toggleCaptions: vi.fn(),
		nextEpisode: vi.fn(),
		previousEpisode: vi.fn(),
		stepPlaybackRate: vi.fn(),
	}
	const isEnabled = ref(true)
	const targetRef = ref<HTMLElement | null>(target)
	withSetup(() =>
		useMediaHotkeys(targetRef, {
			isEnabled: () => isEnabled.value,
			seekStep: () => 5,
			seekStepLarge: () => 10,
			volumeStep: () => 0.05,
			actions,
		}),
	)
	const press = (code: string, init: KeyboardEventInit = {}, from = 'span'): KeyboardEvent => {
		const event = new KeyboardEvent('keydown', { code, bubbles: true, cancelable: true, ...init })
		target.querySelector(from)!.dispatchEvent(event)
		return event
	}
	return { target, targetRef, isEnabled, actions, press }
}

describe('useMediaHotkeys', () => {
	afterEach(() => {
		document.body.innerHTML = ''
	})

	it.each([
		['Space', 'togglePlay', []],
		['KeyK', 'togglePlay', []],
		['ArrowLeft', 'seekBy', [-5]],
		['ArrowRight', 'seekBy', [5]],
		['KeyJ', 'seekBy', [-10]],
		['KeyL', 'seekBy', [10]],
		['PageDown', 'seekBy', [-10]],
		['PageUp', 'seekBy', [10]],
		['Home', 'seekToFraction', [0]],
		['End', 'seekToFraction', [1]],
		['Digit5', 'seekToFraction', [0.5]],
		['Numpad3', 'seekToFraction', [0.3]],
		['ArrowUp', 'changeVolume', [0.05]],
		['ArrowDown', 'changeVolume', [-0.05]],
		['KeyM', 'toggleMute', []],
		['KeyF', 'toggleFullscreen', []],
		['KeyT', 'toggleTheater', []],
		['KeyC', 'toggleCaptions', []],
	] as const)('%s → %s', (code, action, args) => {
		const { actions, press } = setup()

		const event = press(code)
		expect(actions[action]).toHaveBeenCalledWith(...args)
		expect(event.defaultPrevented).toBe(true)
	})

	it('Shift+запятая и Shift+точка меняют скорость по физической клавише', () => {
		const { actions, press } = setup()

		press('Comma', { shiftKey: true, key: 'Б' })
		press('Period', { shiftKey: true, key: 'Ю' })
		expect(actions.stepPlaybackRate.mock.calls).toEqual([[-1], [1]])
	})

	it('Shift+N и Shift+P — следующая и предыдущая серия', () => {
		const { actions, press } = setup()

		press('KeyN', { shiftKey: true })
		press('KeyP', { shiftKey: true })
		expect(actions.nextEpisode).toHaveBeenCalledOnce()
		expect(actions.previousEpisode).toHaveBeenCalledOnce()
	})

	it('не перехватывает чужие сочетания, поля ввода, Space на кнопке и ввод IME', () => {
		const { actions, press, isEnabled } = setup()

		expect(press('KeyQ').defaultPrevented).toBe(false)
		press('KeyK', { ctrlKey: true })
		press('KeyK', { metaKey: true })
		press('KeyK', { altKey: true })
		press('KeyK', { isComposing: true })
		press('KeyK', {}, 'input')
		press('Space', {}, 'button')
		const prevented = new KeyboardEvent('keydown', { code: 'KeyK', bubbles: true, cancelable: true })
		prevented.preventDefault()
		document.querySelector('span')!.dispatchEvent(prevented)
		isEnabled.value = false
		press('KeyK')
		expect(actions.togglePlay).not.toHaveBeenCalled()

		isEnabled.value = true
		press('KeyK', {}, 'button')
		expect(actions.togglePlay).toHaveBeenCalledOnce()
	})

	it('снимает обработчик, когда элемента нет', async () => {
		const { actions, press, targetRef } = setup()

		targetRef.value = null
		await nextTick()
		press('KeyK')
		expect(actions.togglePlay).not.toHaveBeenCalled()
	})
})
