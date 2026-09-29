import { ref } from 'vue'
import { withSetup } from '../utils/BaseMediaPlayer.test-utils'
import { useControlsLayout } from '../../model/controls/useControlsLayout'

function box(left: number, width: number): DOMRect {
	return { left, right: left + width, width, top: 0, bottom: 40, height: 40, x: left, y: 0, toJSON: () => ({}) }
}

function element(className: string, tag = 'div'): HTMLElement {
	const node = document.createElement(tag)
	node.className = className
	return node
}

function controlsTree(stepsToFit: number, width = 300) {
	const root = document.createElement('div')
	const controls = element('base-media-player__controls')
	const bar = element('base-media-player__bar')
	const group = element('base-media-player__group')
	const end = element('base-media-player__group base-media-player__group--end')
	const time = element('base-media-player__time', 'span')
	group.append(time)
	bar.append(group, end)
	controls.append(bar)
	root.append(controls)
	Object.defineProperty(controls, 'offsetHeight', { value: 120 })
	Object.defineProperty(bar, 'clientWidth', { value: width })
	const isFitted = (): boolean => (bar.dataset.fit?.split(' ').filter(Boolean).length ?? 0) >= stepsToFit
	const measured: boolean[] = []
	group.getBoundingClientRect = () => {
		measured.push(bar.dataset.measure === '')
		return box(0, isFitted() ? 150 : 190)
	}
	end.getBoundingClientRect = () => box(isFitted() ? 162 : 202, 138)
	return { root, controls, bar, group, end, time, measured }
}

function stubResizeObserver() {
	const callbacks: Array<() => void> = []
	const observed: Element[] = []
	vi.stubGlobal(
		'ResizeObserver',
		class {
			constructor(callback: () => void) {
				callbacks.push(callback)
			}
			observe(target: Element): void {
				observed.push(target)
				callbacks.at(-1)?.()
			}
			disconnect(): void {
				observed.splice(0)
			}
		},
	)
	return { resize: () => callbacks.forEach(callback => callback()), observed }
}

describe('useControlsLayout', () => {
	afterEach(() => vi.unstubAllGlobals())

	it('первый ряд: лишнее скрывается по шагам, пока группы не поместятся; ширина меряется по кнопкам в режиме замера', () => {
		const { observed } = stubResizeObserver()
		const { root, controls, bar, end, time, measured } = controlsTree(3)

		withSetup(() => useControlsLayout(ref(controls), ref(root)))
		expect(bar.dataset.fit).toBe('text chapter episode')
		expect(bar.dataset.measure).toBeUndefined()
		expect(measured.every(Boolean)).toBe(true)
		expect(root.style.getPropertyValue('--media-controls-height')).toBe('120px')
		expect(observed).toEqual([controls, time, end])
	})

	it('новая кнопка пересчитывает ряд, изменения внутри всплывающего окна — нет; при размонтировании наблюдение снимается', async () => {
		const { observed } = stubResizeObserver()
		const { root, controls, bar, group } = controlsTree(0)
		const { wrapper } = withSetup(() => useControlsLayout(ref(controls), ref(root)))
		expect(bar.dataset.fit).toBe('')

		const popover = element('base-media-player__popover')
		group.append(popover)
		await vi.waitFor(() => expect(bar.dataset.fit).toBe(''))
		bar.dataset.fit = 'text'
		popover.append(document.createElement('button'))
		await Promise.resolve()
		expect(bar.dataset.fit).toBe('text')
		group.append(document.createElement('button'))
		await vi.waitFor(() => expect(bar.dataset.fit).toBe(''))

		wrapper.unmount()
		expect(observed).toEqual([])
	})

	it('скрытые группы не считаются, скрытый плеер не подгоняется; без ResizeObserver, без панели и без ряда ничего не делает', () => {
		const { root, controls, bar, group, end } = controlsTree(1)
		withSetup(() => useControlsLayout(ref(controls), ref(root)))
		expect(bar.dataset.fit).toBeUndefined()

		stubResizeObserver()
		withSetup(() => useControlsLayout(ref(null), ref(root)))
		withSetup(() => useControlsLayout(ref(document.createElement('div')), ref(root)))
		expect(root.style.getPropertyValue('--media-controls-height')).toBe('')

		group.getBoundingClientRect = () => box(0, 0)
		end.getBoundingClientRect = () => box(0, 0)
		withSetup(() => useControlsLayout(ref(controls), ref(null)))
		expect(bar.dataset.fit).toBe('')

		const hidden = controlsTree(1, 0)
		withSetup(() => useControlsLayout(ref(hidden.controls), ref(null)))
		expect([hidden.bar.dataset.fit, hidden.measured]).toEqual(['', []])
	})
})
