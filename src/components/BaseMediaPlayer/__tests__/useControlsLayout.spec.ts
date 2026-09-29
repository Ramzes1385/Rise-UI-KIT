import { nextTick, ref } from 'vue'
import { withSetup } from './BaseMediaPlayer.test-utils'
import { useControlsLayout } from '../model/useControlsLayout'

function controlsTree(stepsToFit: number) {
	const root = document.createElement('div')
	const controls = document.createElement('div')
	const bar = document.createElement('div')
	const group = document.createElement('div')
	bar.className = 'base-media-player__bar'
	bar.append(group)
	controls.append(bar)
	root.append(controls)
	Object.defineProperty(controls, 'offsetHeight', { value: 120 })
	Object.defineProperty(group, 'clientWidth', { value: 300 })
	Object.defineProperty(group, 'scrollWidth', {
		get: () => ((bar.dataset.fit?.split(' ').filter(Boolean).length ?? 0) >= stepsToFit ? 300 : 340),
	})
	return { root, controls, bar }
}

function stubResizeObserver() {
	const callbacks: Array<() => void> = []
	const disconnect = vi.fn()
	vi.stubGlobal(
		'ResizeObserver',
		class {
			constructor(callback: () => void) {
				callbacks.push(callback)
			}
			observe(): void {
				callbacks.at(-1)?.()
			}
			disconnect = disconnect
		},
	)
	return { resize: () => callbacks.forEach(callback => callback()), disconnect }
}

describe('useControlsLayout', () => {
	afterEach(() => vi.unstubAllGlobals())

	it('первый ряд: плеер убирает лишнее по шагам, пока кнопки не поместятся; высота панели — в переменной корня', () => {
		stubResizeObserver()
		const { root, controls, bar } = controlsTree(3)

		withSetup(() => useControlsLayout(ref(controls), ref(root)))
		expect(bar.dataset.fit).toBe('text chapter episode')
		expect(root.style.getPropertyValue('--media-controls-height')).toBe('120px')
	})

	it('когда места хватает, ничего не скрыто; добавленная кнопка пересчитывает ряд; при размонтировании наблюдение снимается', async () => {
		const observer = stubResizeObserver()
		const { root, controls, bar } = controlsTree(0)
		const { wrapper } = withSetup(() => useControlsLayout(ref(controls), ref(null)))
		expect(bar.dataset.fit).toBe('')

		bar.dataset.fit = 'text'
		bar.append(document.createElement('button'))
		await nextTick()
		await vi.waitFor(() => expect(bar.dataset.fit).toBe(''))
		observer.resize()
		expect(root.style.getPropertyValue('--media-controls-height')).toBe('')

		wrapper.unmount()
		expect(observer.disconnect).toHaveBeenCalledOnce()
	})

	it('без ResizeObserver, без панели и без ряда ничего не делает', () => {
		const { root, controls, bar } = controlsTree(1)
		withSetup(() => useControlsLayout(ref(controls), ref(root)))
		expect(bar.dataset.fit).toBeUndefined()

		stubResizeObserver()
		withSetup(() => useControlsLayout(ref(null), ref(root)))
		withSetup(() => useControlsLayout(ref(document.createElement('div')), ref(root)))
		expect(root.style.getPropertyValue('--media-controls-height')).toBe('0px')
	})
})
