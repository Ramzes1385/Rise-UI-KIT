import { vi } from 'vitest'
import { render } from '@testing-library/vue'
import { useRoadmapLive } from '../../model/view/useRoadmapLive'
import { useRoadmapNarrow } from '../../model/view/useRoadmapNarrow'
import type { BaseRoadmapProps } from '../../types/BaseRoadmap.types'
import { useRoadmapLayouts } from '../../model/view/useRoadmapLayouts'
import { useRoadmapSheetBack } from '../../model/view/useRoadmapSheetBack'
import { ROADMAP_LAYOUT_COMPONENTS } from '../../ui/layouts/roadmapLayouts'
import { defineComponent, h, nextTick, reactive, ref, type Ref } from 'vue'
import type { RoadmapDetailsMode } from '../../types/internal/roadmapView.types'

interface NarrowInput {
	narrowWidth?: number
	detailsPosition?: 'side' | 'sheet' | 'auto'
	hasElement?: boolean
}

interface NarrowState {
	width: Ref<number | null>
	isNarrow: Ref<boolean>
	detailsMode: Ref<RoadmapDetailsMode>
}

function mountNarrow(input: NarrowInput = {}) {
	const state = {} as NarrowState
	const position = ref(input.detailsPosition ?? 'auto')
	const rootRef = ref<HTMLElement | null>(null)
	const Host = defineComponent({
		setup() {
			Object.assign(
				state,
				useRoadmapNarrow({ rootRef, narrowWidth: () => input.narrowWidth ?? 560, detailsPosition: () => position.value }),
			)
			return () => h('div', input.hasElement === false ? {} : { ref: rootRef })
		},
	})
	const view = render(Host)
	return { state, position, view }
}

function stubWidth(width: number): void {
	vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({ width } as DOMRect)
}

describe('useRoadmapLive', () => {
	it('объявление чередует хвостовой неразрывный пробел, чтобы повтор текста озвучивался', () => {
		const live = useRoadmapLive()
		const count = { done: 1, total: 2 }
		expect(live.text.value).toBe('')
		live.announce('done', 'HTML', count)
		const first = live.text.value
		live.announce('done', 'HTML', count)
		expect(first).toBe('HTML изучена · 1 из 2 тем')
		expect(live.text.value).toBe(`${first}\u00A0`)
		live.announce('done', 'HTML', count)
		expect(live.text.value).toBe(first)
	})
})

describe('useRoadmapNarrow', () => {
	const originalObserver = globalThis.ResizeObserver
	let callbacks: ResizeObserverCallback[] = []
	const disconnect = vi.fn()

	beforeEach(() => {
		callbacks = []
		globalThis.ResizeObserver = class {
			constructor(callback: ResizeObserverCallback) {
				callbacks.push(callback)
			}
			observe() {}
			unobserve() {}
			disconnect = disconnect
		} as unknown as typeof ResizeObserver
	})

	afterEach(() => {
		globalThis.ResizeObserver = originalObserver
		disconnect.mockClear()
	})

	function resize(width: number): void {
		callbacks.forEach(callback => callback([{ contentRect: { width } } as ResizeObserverEntry], {} as ResizeObserver))
	}

	it('меряет ширину при монтировании: уже порога — узкий контейнер', () => {
		stubWidth(400)
		const { state } = mountNarrow()
		expect(state.width.value).toBe(400)
		expect(state.isNarrow.value).toBe(true)
	})

	it('шире порога — не узкий; порог берётся из narrowWidth', () => {
		stubWidth(600)
		expect(mountNarrow().state.isNarrow.value).toBe(false)
		expect(mountNarrow({ narrowWidth: 700 }).state.isNarrow.value).toBe(true)
	})

	it('нулевая ширина (скрытый контейнер) — размер неизвестен, не узкий, панель сбоку', () => {
		stubWidth(0)
		const { state } = mountNarrow()
		expect(state.width.value).toBeNull()
		expect(state.isNarrow.value).toBe(false)
		expect(state.detailsMode.value).toBe('side')
	})

	it('следит за изменением размера', async () => {
		stubWidth(1200)
		const { state } = mountNarrow()
		expect(state.isNarrow.value).toBe(false)
		resize(300)
		await nextTick()
		expect(state.isNarrow.value).toBe(true)
		resize(0)
		await nextTick()
		expect(state.width.value).toBeNull()
		callbacks.forEach(callback => callback([], {} as ResizeObserver))
		expect(state.width.value).toBeNull()
	})

	it('при размонтировании наблюдение прекращается', () => {
		stubWidth(1200)
		const { view } = mountNarrow()
		view.unmount()
		expect(disconnect).toHaveBeenCalledTimes(1)
	})

	it('режим панели auto: шире 900 — сбоку, до 900 включительно — шторка', () => {
		stubWidth(901)
		expect(mountNarrow().state.detailsMode.value).toBe('side')
		stubWidth(900)
		expect(mountNarrow().state.detailsMode.value).toBe('sheet')
	})

	it('явное положение панели важнее ширины', () => {
		stubWidth(300)
		expect(mountNarrow({ detailsPosition: 'side' }).state.detailsMode.value).toBe('side')
		stubWidth(1600)
		expect(mountNarrow({ detailsPosition: 'sheet' }).state.detailsMode.value).toBe('sheet')
	})

	it('без ResizeObserver ширина измеряется один раз и ошибки нет', () => {
		stubWidth(400)
		vi.stubGlobal('ResizeObserver', undefined)
		const { state } = mountNarrow()
		expect(state.isNarrow.value).toBe(true)
		vi.unstubAllGlobals()
	})

	it('без корневого элемента ширина неизвестна', () => {
		stubWidth(400)
		const { state, view } = mountNarrow({ hasElement: false })
		expect(state.width.value).toBeNull()
		expect(callbacks).toHaveLength(0)
		view.unmount()
		expect(disconnect).not.toHaveBeenCalled()
	})
})

describe('useRoadmapLayouts', () => {
	const registry = { ...ROADMAP_LAYOUT_COMPONENTS }

	afterEach(() => {
		Object.assign(ROADMAP_LAYOUT_COMPONENTS, registry)
	})

	function create(overrides: Partial<BaseRoadmapProps> = {}, isNarrow = false) {
		const props = reactive({ layout: 'path', narrowLayout: 'list', hasLayoutSwitch: true, ...overrides }) as BaseRoadmapProps
		const narrow = ref(isNarrow)
		return { props, narrow, layouts: useRoadmapLayouts(props, () => narrow.value) }
	}

	it('по умолчанию — раскладка из пропса, в переключателе четыре раскладки по реестру', () => {
		const { layouts } = create()
		expect(layouts.layout.value).toBe('path')
		expect(layouts.layoutComponent.value).toBe(ROADMAP_LAYOUT_COMPONENTS.path)
		expect(layouts.layoutOptions.value.map(option => option.label)).toEqual(['Путь', 'Змейка', 'Список', 'Лента'])
		expect(layouts.hasLayoutSwitch.value).toBe(true)
	})

	it('без пропса layout берётся путь', () => {
		expect(create({ layout: undefined }).layouts.layout.value).toBe('path')
	})

	it('узкий контейнер включает narrowLayout и прячет переключатель', () => {
		const { layouts, narrow } = create({}, true)
		expect(layouts.layout.value).toBe('list')
		expect(layouts.hasLayoutSwitch.value).toBe(false)
		narrow.value = false
		expect(layouts.layout.value).toBe('path')
	})

	it('narrowLayout: null оставляет выбор и в узком контейнере', () => {
		const { layouts } = create({ narrowLayout: null, layout: 'snake' }, true)
		expect(layouts.layout.value).toBe('snake')
		expect(layouts.hasLayoutSwitch.value).toBe(true)
	})

	it('setLayout запоминает выбор, смена пропса layout его сбрасывает', async () => {
		const { layouts, props } = create()
		layouts.setLayout('horizontal')
		expect(layouts.layout.value).toBe('horizontal')
		props.layout = 'snake'
		await nextTick()
		expect(layouts.layout.value).toBe('snake')
	})

	it('hasLayoutSwitch: false убирает переключатель', () => {
		expect(create({ hasLayoutSwitch: false }).layouts.hasLayoutSwitch.value).toBe(false)
	})

	it('незарегистрированная раскладка заменяется списком и не попадает в переключатель', () => {
		delete ROADMAP_LAYOUT_COMPONENTS.snake
		const { layouts } = create({ layout: 'snake' })
		expect(layouts.layout.value).toBe('list')
		expect(layouts.layoutOptions.value.map(option => option.label)).toEqual(['Путь', 'Список', 'Лента'])
	})

	it('одна раскладка в реестре — переключать нечего', () => {
		delete ROADMAP_LAYOUT_COMPONENTS.path
		delete ROADMAP_LAYOUT_COMPONENTS.snake
		delete ROADMAP_LAYOUT_COMPONENTS.horizontal
		expect(create().layouts.hasLayoutSwitch.value).toBe(false)
	})
})

describe('useRoadmapSheetBack', () => {
	function mountBack() {
		const isOpen = ref(false)
		const close = vi.fn()
		const Host = defineComponent({
			setup() {
				useRoadmapSheetBack(() => isOpen.value, close)
				return () => h('div')
			},
		})
		const view = render(Host)
		return { isOpen, close, view }
	}

	it('открытая шторка добавляет запись в историю, сохраняя прежнее состояние', async () => {
		const push = vi.spyOn(window.history, 'pushState')
		window.history.replaceState({ page: 1 }, '')
		const { isOpen } = mountBack()
		isOpen.value = true
		await nextTick()
		expect(push).toHaveBeenCalledWith({ page: 1, riseRoadmapSheet: true }, '')
		window.history.back()
	})

	it('«Назад» закрывает шторку один раз', async () => {
		const { isOpen, close } = mountBack()
		isOpen.value = true
		await nextTick()
		window.dispatchEvent(new PopStateEvent('popstate'))
		window.dispatchEvent(new PopStateEvent('popstate'))
		expect(close).toHaveBeenCalledTimes(1)
	})

	it('закрытие шторки кнопкой убирает свою запись из истории', async () => {
		const back = vi.spyOn(window.history, 'back').mockImplementation(() => undefined)
		const { isOpen, close } = mountBack()
		isOpen.value = true
		await nextTick()
		isOpen.value = false
		await nextTick()
		expect(back).toHaveBeenCalledTimes(1)
		window.dispatchEvent(new PopStateEvent('popstate'))
		expect(close).not.toHaveBeenCalled()
	})

	it('закрытая шторка историю не трогает', async () => {
		const back = vi.spyOn(window.history, 'back').mockImplementation(() => undefined)
		const { isOpen, view } = mountBack()
		isOpen.value = true
		await nextTick()
		window.dispatchEvent(new PopStateEvent('popstate'))
		isOpen.value = false
		await nextTick()
		view.unmount()
		expect(back).not.toHaveBeenCalled()
	})

	it('размонтирование при открытой шторке возвращает историю назад', async () => {
		const back = vi.spyOn(window.history, 'back').mockImplementation(() => undefined)
		const { isOpen, view } = mountBack()
		isOpen.value = true
		await nextTick()
		view.unmount()
		expect(back).toHaveBeenCalledTimes(1)
	})

	it('на сервере (нет window) ничего не делает', async () => {
		const push = vi.spyOn(window.history, 'pushState')
		const { isOpen } = mountBack()
		vi.stubGlobal('window', undefined)
		isOpen.value = true
		await nextTick()
		vi.unstubAllGlobals()
		expect(push).not.toHaveBeenCalled()
	})
})
