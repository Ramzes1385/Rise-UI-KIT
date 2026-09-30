/** Окно jsdom — 1024 × 768. */

import { nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useDropdownPosition, VIEWPORT_MARGIN } from '../useDropdownPosition'
import type { DropdownPosition } from '@components/BaseDropdown/types/BaseDropdown.types'

const GAP = 4

function rect(top: number, left: number, { width = 200, height = 40 } = {}): DOMRect {
	return { top, left, width, height, bottom: top + height, right: left + width, x: left, y: top, toJSON: () => ({}) } as DOMRect
}

function createWrapper(triggerRect: DOMRect | null): HTMLElement {
	const wrapper = document.createElement('div')
	if (triggerRect) {
		const trigger = document.createElement('button')
		trigger.getBoundingClientRect = () => triggerRect
		wrapper.append(trigger)
	} else {
		wrapper.getBoundingClientRect = () => rect(10, 20, { width: 30, height: 10 })
	}
	return wrapper
}

function createPanel(width = 100, height = 50): HTMLElement {
	const panel = document.createElement('div')
	Object.defineProperty(panel, 'offsetWidth', { value: width })
	Object.defineProperty(panel, 'offsetHeight', { value: height })
	return panel
}

function setup(
	options: {
		position?: DropdownPosition
		trigger?: DOMRect | null
		panel?: HTMLElement | null
		isOpen?: boolean
		matchWidth?: boolean
		wrapper?: HTMLElement | null
	} = {},
) {
	const position = ref<DropdownPosition>(options.position ?? 'bottom-start')
	const isOpen = ref(options.isOpen ?? true)
	const gap = ref(GAP)
	const matchWidth = ref(options.matchWidth ?? false)
	const wrapperRef = ref<HTMLElement | null>(
		options.wrapper === undefined ? createWrapper(options.trigger === undefined ? rect(300, 400) : options.trigger) : options.wrapper,
	)
	const dropdownRef = ref<HTMLElement | null>(options.panel === undefined ? createPanel() : options.panel)
	let api!: ReturnType<typeof useDropdownPosition>
	const wrapper = mount({
		setup() {
			api = useDropdownPosition({
				wrapperRef,
				dropdownRef,
				position: () => position.value,
				gap: () => gap.value,
				matchWidth: () => matchWidth.value,
				maxHeight: () => '320px',
				isOpen: () => isOpen.value,
			})
			return () => null
		},
	})
	return { api, position, isOpen, gap, matchWidth, wrapperRef, dropdownRef, wrapper }
}

afterEach(() => {
	vi.restoreAllMocks()
})

describe('useDropdownPosition', () => {
	it.each([
		{ position: 'bottom-start', top: 344, left: 400, transformOrigin: 'top left' },
		{ position: 'bottom-end', top: 344, left: 500, transformOrigin: 'top right' },
		{ position: 'bottom', top: 344, left: 450, transformOrigin: 'top center' },
		{ position: 'top-start', top: 246, left: 400, transformOrigin: 'bottom left' },
		{ position: 'top-end', top: 246, left: 500, transformOrigin: 'bottom right' },
		{ position: 'top', top: 246, left: 450, transformOrigin: 'bottom center' },
		{ position: 'left-start', top: 300, left: 296, transformOrigin: 'top right' },
		{ position: 'left-end', top: 290, left: 296, transformOrigin: 'bottom right' },
		{ position: 'left', top: 295, left: 296, transformOrigin: 'center right' },
		{ position: 'right-start', top: 300, left: 604, transformOrigin: 'top left' },
		{ position: 'right-end', top: 290, left: 604, transformOrigin: 'bottom left' },
		{ position: 'right', top: 295, left: 604, transformOrigin: 'center left' },
	] as const)('$position: панель у триггера и растёт от него', ({ position, top, left, transformOrigin }) => {
		const { api } = setup({ position })

		expect(api.coords.value).toEqual({ top, left })
		expect(api.placement.value).toBe(position)
		expect(api.panelStyle.value).toEqual({ maxHeight: '320px', top: `${top}px`, left: `${left}px`, transformOrigin })
	})

	it('снизу нет места — панель переворачивается наверх и растёт снизу вверх', () => {
		const { api } = setup({ position: 'bottom-start', trigger: rect(700, 400) })

		expect(api.placement.value).toBe('top-start')
		expect(api.coords.value.top).toBe(700 - GAP - 50)
		expect(api.panelStyle.value.transformOrigin).toBe('bottom left')
	})

	it('справа нет места — панель переворачивается влево', () => {
		const { api } = setup({ position: 'right', trigger: rect(300, 900, { width: 100 }) })

		expect(api.placement.value).toBe('left')
		expect(api.coords.value.left).toBe(900 - GAP - 100)
	})

	it('места нет с обеих сторон — сторона остаётся', () => {
		const { api } = setup({ position: 'bottom-start', panel: createPanel(100, 800) })

		expect(api.placement.value).toBe('bottom-start')
	})

	it('у края окна панель сдвигается вдоль него', () => {
		expect(setup({ position: 'bottom-start', trigger: rect(300, 980, { width: 40 }) }).api.coords.value.left).toBe(
			1024 - 100 - VIEWPORT_MARGIN,
		)
		expect(setup({ position: 'bottom-end', trigger: rect(300, 10, { width: 40 }) }).api.coords.value.left).toBe(VIEWPORT_MARGIN)
		expect(setup({ position: 'right-start', trigger: rect(740, 400) }).api.coords.value.top).toBe(768 - 50 - VIEWPORT_MARGIN)
	})

	it('размер окна — без полосы прокрутки (clientWidth), когда он известен', () => {
		vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(1000)
		vi.spyOn(document.documentElement, 'clientHeight', 'get').mockReturnValue(700)

		expect(setup({ position: 'bottom-start', trigger: rect(300, 980, { width: 40 }) }).api.coords.value.left).toBe(
			1000 - 100 - VIEWPORT_MARGIN,
		)
	})

	it('до отрисовки панели (размер неизвестен) — без переворота и сдвига', () => {
		const { api } = setup({ position: 'bottom-end', trigger: rect(700, 10, { width: 40 }), panel: null })

		expect(api.placement.value).toBe('bottom-end')
		expect(api.coords.value).toEqual({ top: 744, left: 50 })
	})

	it('matchWidth — ширина триггера', () => {
		const { api } = setup({ matchWidth: true })

		expect(api.panelStyle.value.width).toBe('200px')
	})

	it('закрытая панель и обёртка без элемента не пересчитываются', () => {
		const closed = setup({ isOpen: false })
		closed.api.updatePosition()
		expect(closed.api.coords.value).toEqual({ top: 0, left: 0 })

		const detached = setup({ wrapper: null })
		expect(detached.api.coords.value).toEqual({ top: 0, left: 0 })
	})

	it('без дочернего элемента берётся rect обёртки', () => {
		const { api } = setup({ trigger: null, panel: null })

		expect(api.coords.value).toEqual({ top: 20 + GAP, left: 20 })
	})

	it('при открытии пересчитывается и слушает прокрутку, размер окна и панели; при закрытии — перестаёт', async () => {
		const observers: { callback: () => void; disconnect: ReturnType<typeof vi.fn> }[] = []
		vi.stubGlobal(
			'ResizeObserver',
			class {
				disconnect = vi.fn()
				callback: () => void
				constructor(callback: () => void) {
					this.callback = callback
					observers.push(this)
				}
				observe() {}
			},
		)
		const addSpy = vi.spyOn(window, 'addEventListener')
		const removeSpy = vi.spyOn(window, 'removeEventListener')
		const { api, isOpen, wrapperRef } = setup({ isOpen: false })
		expect(addSpy).not.toHaveBeenCalledWith('scroll', expect.any(Function), true)

		isOpen.value = true
		await nextTick()
		await nextTick()
		expect(api.coords.value).toEqual({ top: 344, left: 400 })
		expect(addSpy).toHaveBeenCalledWith('scroll', expect.any(Function), true)
		expect(observers).toHaveLength(1)

		// Триггер сдвинулся: прокрутка и изменение размера панели пересчитывают позицию
		;(wrapperRef.value!.firstElementChild as HTMLElement).getBoundingClientRect = () => rect(100, 400)
		window.dispatchEvent(new Event('scroll'))
		expect(api.coords.value.top).toBe(144)
		;(wrapperRef.value!.firstElementChild as HTMLElement).getBoundingClientRect = () => rect(200, 400)
		observers[0].callback()
		expect(api.coords.value.top).toBe(244)

		isOpen.value = false
		await nextTick()
		expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function), true)
		expect(observers[0].disconnect).toHaveBeenCalled()
		vi.unstubAllGlobals()
	})

	it('без панели наблюдатель размера не создаётся; повторное открытие не плодит наблюдателей', async () => {
		const observe = vi.fn()
		vi.stubGlobal(
			'ResizeObserver',
			class {
				observe = observe
				disconnect() {}
			},
		)
		const { isOpen, dropdownRef } = setup({ isOpen: false, panel: null })

		isOpen.value = true
		await nextTick()
		await nextTick()
		expect(observe).not.toHaveBeenCalled()

		dropdownRef.value = createPanel()
		window.dispatchEvent(new Event('resize'))
		isOpen.value = false
		await nextTick()
		isOpen.value = true
		await nextTick()
		await nextTick()
		expect(observe).toHaveBeenCalledTimes(1)
		vi.unstubAllGlobals()
	})

	it('открыта при монтировании; смена gap и position пересчитывает; размонтирование снимает слушатели', async () => {
		const removeSpy = vi.spyOn(window, 'removeEventListener')
		const { api, gap, position, wrapper } = setup()

		gap.value = 10
		await nextTick()
		expect(api.coords.value.top).toBe(350)

		position.value = 'top-start'
		await nextTick()
		expect(api.placement.value).toBe('top-start')

		wrapper.unmount()
		expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function))
	})

	it('пересчёт с тем же углом оставляет прежний объект coords: панель и её содержимое не перерисовываются', async () => {
		const { api } = setup()
		await nextTick()
		const before = api.coords.value

		api.updatePosition()
		expect(api.coords.value).toBe(before)
	})

	it('панель внутри предка с transform (Storybook Docs) — координаты от этого предка, а решения о перевороте — по окну', () => {
		const container = document.createElement('div')
		container.style.transform = 'translateZ(0)'
		container.getBoundingClientRect = () => rect(120, 30, { width: 600, height: 400 })
		const panel = createPanel()
		container.append(panel)
		document.body.append(container)

		const { api } = setup({ position: 'bottom-start', trigger: rect(700, 400), panel })

		expect(api.placement.value).toBe('top-start')
		expect(api.coords.value).toEqual({ top: 700 - GAP - 50 - 120, left: 400 - 30 })
		container.remove()
	})
})
