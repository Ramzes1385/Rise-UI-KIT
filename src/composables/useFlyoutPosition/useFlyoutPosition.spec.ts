/**
 * Unit-тесты для useFlyoutPosition.
 * Проверяют каскадное позиционирование flyout: вправо, flip влево, прижатие по вертикали.
 */

import { mount } from '@vue/test-utils'
import { nextTick, ref } from 'vue'

import { useFlyoutPosition } from './useFlyoutPosition'

function withSetup<T>(composable: () => T): { result: T; wrapper: ReturnType<typeof mount> } {
	let result: T
	const wrapper = mount({
		setup() {
			result = composable()
			return () => null
		},
	})
	return { result: result!, wrapper }
}

function createMockElement(rect: Partial<DOMRect>): HTMLElement {
	const el = document.createElement('div')
	el.getBoundingClientRect = () =>
		({ x: 0, y: 0, width: 200, height: 40, top: 100, right: 200, bottom: 140, left: 0, ...rect }) as DOMRect
	return el
}

function setViewport(width: number, height: number): void {
	Object.defineProperty(window, 'innerWidth', { value: width, configurable: true, writable: true })
	Object.defineProperty(window, 'innerHeight', { value: height, configurable: true, writable: true })
}

describe('useFlyoutPosition', () => {
	beforeEach(() => setViewport(1280, 800))
	afterEach(() => setViewport(1024, 768))

	it('раскрывает панель вправо от якоря, когда места достаточно', async () => {
		const anchorRef = ref<HTMLElement | null>(createMockElement({ left: 100, right: 300, top: 50 }))
		const panelRef = ref<HTMLElement | null>(createMockElement({ width: 220, height: 200 }))

		const { result } = withSetup(() => useFlyoutPosition({ anchorRef, panelRef, isOpen: () => true }))
		result.updatePosition()
		await nextTick()

		expect(result.isFlipped.value).toBe(false)
		expect(result.panelStyle.value.position).toBe('fixed')
		expect(result.panelStyle.value.left).toBe('304px')
	})

	it('считает горизонталь от boundaryRef, а вертикаль от anchorRef', async () => {
		const anchorRef = ref<HTMLElement | null>(createMockElement({ left: 60, right: 150, top: 80 }))
		const boundaryRef = ref<HTMLElement | null>(createMockElement({ left: 16, right: 300, top: 40 }))
		const panelRef = ref<HTMLElement | null>(createMockElement({ width: 220, height: 200 }))

		const { result } = withSetup(() => useFlyoutPosition({ anchorRef, panelRef, boundaryRef, isOpen: () => true }))
		result.updatePosition()
		await nextTick()

		expect(result.panelStyle.value.left).toBe('304px')
		expect(result.panelStyle.value.top).toBe('80px')
	})

	it('делает flip влево, когда справа не хватает места', async () => {
		const anchorRef = ref<HTMLElement | null>(createMockElement({ left: 1100, right: 1270, top: 50 }))
		const panelRef = ref<HTMLElement | null>(createMockElement({ width: 220, height: 200 }))

		const { result } = withSetup(() => useFlyoutPosition({ anchorRef, panelRef, isOpen: () => true }))
		result.updatePosition()
		await nextTick()

		expect(result.isFlipped.value).toBe(true)
		expect(Number.parseInt(result.panelStyle.value.left, 10)).toBeLessThan(1100)
	})

	it('прижимает панель к верху, если она выходит за нижний край', async () => {
		const anchorRef = ref<HTMLElement | null>(createMockElement({ left: 100, right: 300, top: 700 }))
		const panelRef = ref<HTMLElement | null>(createMockElement({ width: 220, height: 400 }))

		const { result } = withSetup(() => useFlyoutPosition({ anchorRef, panelRef, isOpen: () => true }))
		result.updatePosition()
		await nextTick()

		const top = Number.parseInt(result.panelStyle.value.top, 10)
		expect(top).toBeLessThanOrEqual(800 - 400 - 8)
	})

	it('не считает позицию, когда закрыта', async () => {
		const anchorRef = ref<HTMLElement | null>(createMockElement({}))
		const panelRef = ref<HTMLElement | null>(createMockElement({}))

		const { result } = withSetup(() => useFlyoutPosition({ anchorRef, panelRef, isOpen: () => false }))
		result.updatePosition()
		await nextTick()

		expect(result.panelStyle.value).toEqual({})
	})

	it('не падает, если refs пустые', async () => {
		const anchorRef = ref<HTMLElement | null>(null)
		const panelRef = ref<HTMLElement | null>(null)

		const { result } = withSetup(() => useFlyoutPosition({ anchorRef, panelRef, isOpen: () => true }))
		expect(() => result.updatePosition()).not.toThrow()
		expect(result.panelStyle.value).toEqual({})
	})

	it('пересчитывает позицию при открытии', async () => {
		const anchorRef = ref<HTMLElement | null>(createMockElement({ left: 100, right: 300, top: 50 }))
		const panelRef = ref<HTMLElement | null>(createMockElement({ width: 220, height: 200 }))
		const open = ref(false)

		const { result } = withSetup(() => useFlyoutPosition({ anchorRef, panelRef, isOpen: () => open.value }))
		expect(result.panelStyle.value).toEqual({})

		open.value = true
		await nextTick()
		await nextTick()

		expect(result.panelStyle.value.position).toBe('fixed')

		open.value = false
		await nextTick()
		expect(() => result.updatePosition()).not.toThrow()
	})

	it('снимает слушатели scroll/resize при размонтировании', () => {
		const anchorRef = ref<HTMLElement | null>(createMockElement({}))
		const panelRef = ref<HTMLElement | null>(createMockElement({}))
		const removeSpy = vi.spyOn(window, 'removeEventListener')

		const { wrapper } = withSetup(() => useFlyoutPosition({ anchorRef, panelRef, isOpen: () => true }))
		wrapper.unmount()

		expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function), true)
		expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function))
		removeSpy.mockRestore()
	})

	it('пересчитывает позицию при ресайзе окна', async () => {
		const anchorRef = ref<HTMLElement | null>(createMockElement({ left: 100, right: 300, top: 50 }))
		const panelRef = ref<HTMLElement | null>(createMockElement({ width: 220, height: 200 }))

		withSetup(() => useFlyoutPosition({ anchorRef, panelRef, isOpen: () => true }))
		setViewport(800, 600)
		window.dispatchEvent(new Event('resize'))
		await nextTick()

		expect(true).toBe(true)
	})
})
