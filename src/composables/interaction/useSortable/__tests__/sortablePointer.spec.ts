import { nextTick } from 'vue'
import type { Item } from './sortableHarness'
import type { UseSortableOptions, UseSortableReturn } from '../types/useSortable.types'
import { ITEMS, key, mountSortable, pointer, rect, sortableOptions } from './sortableHarness'

function pressOn(sortable: UseSortableReturn<Item>, item: Item, init: { at?: number[]; event?: PointerEventInit } = {}): HTMLElement {
	const element = document.createElement('div')
	element.getBoundingClientRect = () => rect([10, 20, 200, 40])
	element.addEventListener('pointerdown', event => sortable.handlePointerDown(event as PointerEvent, item))
	element.dispatchEvent(pointer('pointerdown', init.at ?? [30, 30], init.event))
	return element
}

function startDrag(overrides: Partial<UseSortableOptions<Item, number>> = {}) {
	const options = sortableOptions(overrides)
	const mounted = mountSortable(options)
	pressOn(mounted.sortable, ITEMS[0])
	window.dispatchEvent(pointer('pointermove', [30, 60]))
	return { options, ...mounted }
}

const motion = (isReduced: boolean) =>
	vi.stubGlobal(
		'matchMedia',
		vi.fn(() => ({ matches: isReduced })),
	)

describe('useSortable: мышь', () => {
	afterEach(() => vi.unstubAllGlobals())

	it('без перетаскивания «призрак» без стиля и клик не подавлен', () => {
		const { sortable } = mountSortable(sortableOptions())
		expect(sortable.drag.value).toBeNull()
		expect(sortable.ghostStyle.value).toEqual({})
		expect(sortable.consumeClick()).toBe(false)
	})

	it.each([
		['перестановка выключена', { isDisabled: () => true }, {}],
		['не левая кнопка', {}, { button: 1 }],
		['касание', {}, { pointerType: 'touch' }],
		['элемента нет (locate → null), как у клавиатуры', { locate: () => null }, {}],
	])('не начинает перетаскивание: %s', (_, overrides, event) => {
		const options = sortableOptions(overrides)
		const { sortable } = mountSortable(options)
		pressOn(sortable, ITEMS[0], { event })
		window.dispatchEvent(pointer('pointermove', [100, 100]))
		expect(sortable.drag.value).toBeNull()
		expect(options.onStart).not.toHaveBeenCalled()
	})

	it('до сдвига на 5 px ничего не начинает, после — onStart, «призрак» по точке захвата', () => {
		const options = sortableOptions()
		const { sortable } = mountSortable(options)
		pressOn(sortable, ITEMS[1])
		window.dispatchEvent(pointer('pointermove', [33, 33]))
		expect(sortable.drag.value).toBeNull()
		expect(options.onStart).not.toHaveBeenCalled()

		window.dispatchEvent(pointer('pointermove', [30, 36]))
		expect(options.onStart).toHaveBeenCalledWith('b', 'pointer')
		expect(sortable.drag.value).toEqual({ item: ITEMS[1], x: 30, y: 36, offsetX: 20, offsetY: 10, width: 200 })
		expect(sortable.ghostStyle.value).toEqual({ width: '200px', transform: 'translate(10px, 26px)' })

		window.dispatchEvent(pointer('pointermove', [31, 37]))
		expect(options.onStart).toHaveBeenCalledTimes(1)
		expect(sortable.drag.value?.x).toBe(31)
	})

	it('второе нажатие во время перетаскивания не начинает новое', () => {
		const { options, sortable } = startDrag()
		pressOn(sortable, ITEMS[2])
		window.dispatchEvent(pointer('pointermove', [30, 90]))
		expect(sortable.drag.value?.item).toBe(ITEMS[0])
		expect(options.onStart).toHaveBeenCalledTimes(1)
	})

	it('onPreview — только когда место под курсором другое', () => {
		const places = [null, 0, 2]
		const { options } = startDrag({ dropPlace: vi.fn(() => places.shift() ?? null) })
		expect(options.dropPlace).toHaveBeenCalledWith({ x: 30, y: 60 }, 'a')
		expect(options.onPreview).not.toHaveBeenCalled()
		window.dispatchEvent(pointer('pointermove', [30, 70]))
		window.dispatchEvent(pointer('pointermove', [30, 80]))
		expect(options.onPreview).toHaveBeenCalledTimes(1)
		expect(options.onPreview).toHaveBeenCalledWith('a', 2)
	})

	it('отпускание без сдвига — без броска и клик не подавлен', () => {
		const options = sortableOptions()
		const { sortable } = mountSortable(options)
		pressOn(sortable, ITEMS[0])
		window.dispatchEvent(pointer('pointerup', [30, 30]))
		expect(options.onDrop).not.toHaveBeenCalled()
		expect(sortable.consumeClick()).toBe(false)
		window.dispatchEvent(pointer('pointermove', [30, 90]))
		expect(options.onStart).not.toHaveBeenCalled()
	})

	it('бросок: onDrop с исходным местом, следующий клик подавлен один раз; без анимации — сразу конец', async () => {
		const { options, sortable } = startDrag()
		window.dispatchEvent(pointer('pointerup', [30, 60]))
		expect(options.onDrop).toHaveBeenCalledWith({ id: 'a', origin: 0 }, expect.any(Function))
		expect(sortable.consumeClick()).toBe(true)
		expect(sortable.consumeClick()).toBe(false)

		vi.mocked(options.onDrop).mock.calls[0][1]()
		window.dispatchEvent(pointer('pointermove', [30, 120]))
		expect(sortable.drag.value?.y).toBe(60)
		await nextTick()
		expect(sortable.drag.value).toBeNull()
	})

	it('посадка «призрака»: класс и анимация к элементу, конец — по onfinish', async () => {
		motion(false)
		const target = document.createElement('div')
		target.getBoundingClientRect = () => rect([5, 100, 200, 40])
		const { options, sortable } = startDrag({ itemElement: () => target, settlingClass: 'is-settling' })
		const animation = { onfinish: null as null | (() => void) }
		const ghost = document.createElement('div')
		ghost.animate = vi.fn(() => animation as unknown as Animation)
		sortable.ghostRef.value = ghost

		window.dispatchEvent(pointer('pointerup', [30, 60]))
		vi.mocked(options.onDrop).mock.calls[0][1]()
		await nextTick()
		expect(ghost).toHaveProperty('className', 'is-settling')
		expect(ghost.animate).toHaveBeenCalledWith([{ transform: 'translate(5px, 100px)' }], {
			duration: 180,
			easing: 'ease-out',
			fill: 'forwards',
		})
		expect(sortable.drag.value).not.toBeNull()
		animation.onfinish?.()
		expect(sortable.drag.value).toBeNull()
	})

	it('посадка без settlingClass класс не ставит', async () => {
		motion(false)
		const target = document.createElement('div')
		const { options, sortable } = startDrag({ itemElement: () => target })
		const ghost = document.createElement('div')
		ghost.animate = vi.fn(() => ({}) as Animation)
		sortable.ghostRef.value = ghost
		window.dispatchEvent(pointer('pointerup', [30, 60]))
		vi.mocked(options.onDrop).mock.calls[0][1]()
		await nextTick()
		expect(ghost.animate).toHaveBeenCalled()
		expect(ghost.className).toBe('')
	})

	it.each([
		['меньше движения', true, true],
		['нет animate у «призрака»', false, false],
	])('посадка сразу: %s', async (_, isReduced, hasAnimate) => {
		motion(isReduced)
		const target = document.createElement('div')
		const { options, sortable } = startDrag({ itemElement: () => target })
		const ghost = document.createElement('div')
		ghost.animate = (hasAnimate ? vi.fn() : undefined) as unknown as HTMLElement['animate']
		sortable.ghostRef.value = ghost
		window.dispatchEvent(pointer('pointerup', [30, 60]))
		vi.mocked(options.onDrop).mock.calls[0][1]()
		await nextTick()
		expect(sortable.drag.value).toBeNull()
	})

	it('Escape во время перетаскивания отменяет, прочие клавиши — нет', async () => {
		const { options, sortable } = startDrag()
		window.dispatchEvent(key('a'))
		expect(options.onCancel).not.toHaveBeenCalled()
		const escape = key('Escape')
		window.dispatchEvent(escape)
		expect(escape.defaultPrevented).toBe(true)
		expect(options.onCancel).toHaveBeenCalledWith('a', expect.any(Function))
		vi.mocked(options.onCancel).mock.calls[0][1]()
		await nextTick()
		expect(sortable.drag.value).toBeNull()
	})

	it('Escape до начала перетаскивания не отменяет', () => {
		const options = sortableOptions()
		const { sortable } = mountSortable(options)
		pressOn(sortable, ITEMS[0])
		const escape = key('Escape')
		window.dispatchEvent(escape)
		expect(escape.defaultPrevented).toBe(false)
		expect(options.onCancel).not.toHaveBeenCalled()
	})

	it('при размонтировании снимает слушатели окна', () => {
		const { options, wrapper, sortable } = startDrag()
		wrapper.unmount()
		expect(sortable.drag.value).toBeNull()
		window.dispatchEvent(pointer('pointermove', [30, 120]))
		window.dispatchEvent(pointer('pointerup', [30, 120]))
		expect(options.onDrop).not.toHaveBeenCalled()
		expect(sortable.drag.value).toBeNull()
	})

	it('перенос мышью на место 0: onPreview с нулём, бросок — с исходным местом', () => {
		const options = sortableOptions({ dropPlace: vi.fn(() => 0) })
		const { sortable } = mountSortable(options)
		pressOn(sortable, ITEMS[1])
		window.dispatchEvent(pointer('pointermove', [30, 10]))
		expect(options.onPreview).toHaveBeenCalledWith('b', 0)
		window.dispatchEvent(pointer('pointerup', [30, 10]))
		expect(options.onDrop).toHaveBeenCalledWith({ id: 'b', origin: 1 }, expect.any(Function))
	})

	it('pointercancel во время перетаскивания — отмена, как по Escape', async () => {
		const { options, sortable } = startDrag()
		window.dispatchEvent(pointer('pointercancel', [30, 60]))
		expect(options.onCancel).toHaveBeenCalledWith('a', expect.any(Function))
		vi.mocked(options.onCancel).mock.calls[0][1]()
		await nextTick()
		expect(sortable.drag.value).toBeNull()
		window.dispatchEvent(pointer('pointercancel', [30, 60]))
		expect(options.onCancel).toHaveBeenCalledTimes(1)
	})

	it('pointercancel до сдвига — нажатие забыто, без отмены', () => {
		const options = sortableOptions()
		const { sortable } = mountSortable(options)
		pressOn(sortable, ITEMS[0])
		window.dispatchEvent(pointer('pointercancel', [30, 30]))
		window.dispatchEvent(pointer('pointermove', [30, 90]))
		expect(options.onCancel).not.toHaveBeenCalled()
		expect(options.onStart).not.toHaveBeenCalled()
		expect(sortable.consumeClick()).toBe(false)
	})
})
