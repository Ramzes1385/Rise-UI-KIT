import { ref } from 'vue'
import { runInSetup } from '../../fixtures/model.test-utils'
import { useRoadmap3DSize } from '../../../model/view/useRoadmap3DSize'

class Observer {
	static instances: Observer[] = []
	observe = vi.fn()
	disconnect = vi.fn()
	callback: () => void
	constructor(callback: () => void) {
		this.callback = callback
		Observer.instances.push(this)
	}
}

function mountSize(options: { width: number; breakpoint?: number; hasRoot?: boolean }) {
	const root = document.createElement('div')
	const state = { width: options.width }
	Object.defineProperty(root, 'clientWidth', { get: () => state.width })
	const rootRef = ref<HTMLElement | null>(options.hasRoot === false ? null : root)
	const { result, wrapper } = runInSetup(() => useRoadmap3DSize(() => options.breakpoint, rootRef))
	return { ...result, wrapper, state }
}

beforeEach(() => {
	Observer.instances = []
	vi.stubGlobal('ResizeObserver', Observer)
})

afterEach(() => vi.unstubAllGlobals())

describe('useRoadmap3DSize', () => {
	it('узкий — меньше порога 640 по умолчанию, широкий — нет', () => {
		expect(mountSize({ width: 375 }).isCompact.value).toBe(true)
		expect(mountSize({ width: 640 }).isCompact.value).toBe(false)
	})

	it('порог свой; ширина 0 (не измерена) — не узкий', () => {
		expect(mountSize({ width: 700, breakpoint: 800 }).isCompact.value).toBe(true)
		expect(mountSize({ width: 0 }).isCompact.value).toBe(false)
	})

	it('следит за размером и отключается при размонтировании', () => {
		const { isCompact, state, wrapper } = mountSize({ width: 800 })
		expect(isCompact.value).toBe(false)
		state.width = 400
		Observer.instances[0].callback()
		expect(isCompact.value).toBe(true)
		wrapper.unmount()
		expect(Observer.instances[0].disconnect).toHaveBeenCalled()
	})

	it('без корня или без ResizeObserver ничего не измеряет', () => {
		expect(mountSize({ width: 100, hasRoot: false }).isCompact.value).toBe(false)
		vi.stubGlobal('ResizeObserver', undefined)
		const { isCompact, wrapper } = mountSize({ width: 100 })
		expect(isCompact.value).toBe(false)
		expect(() => wrapper.unmount()).not.toThrow()
	})
})
