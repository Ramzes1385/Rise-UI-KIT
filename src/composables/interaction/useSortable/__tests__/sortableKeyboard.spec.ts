import { ref } from 'vue'
import { ITEMS, key, mountSortable, sortableOptions } from './sortableHarness'

function rootWithItem() {
	const root = document.createElement('div')
	const inside = document.createElement('button')
	const outside = document.createElement('button')
	root.append(inside)
	document.body.append(root, outside)
	return { root, inside, outside, rootRef: ref<HTMLElement | null>(root) }
}

function leaveFocus(from: HTMLElement, to: HTMLElement): void {
	from.focus()
	to.focus()
	vi.runAllTimers()
}

describe('useSortable: клавиатура', () => {
	it('без взятого элемента клавиши не обрабатывает', () => {
		const { sortable } = mountSortable(sortableOptions())
		const event = key(' ')
		expect(sortable.handleGrabbedKeydown(event)).toBe(false)
		expect(event.defaultPrevented).toBe(false)
		expect(sortable.grabbedId.value).toBeNull()
	})

	it('не берёт элемент, если перестановка выключена или элемента нет', () => {
		const disabled = sortableOptions({ isDisabled: () => true })
		mountSortable(disabled).sortable.grab(ITEMS[0])
		expect(disabled.onStart).not.toHaveBeenCalled()

		const missing = sortableOptions({ locate: () => null })
		const { sortable } = mountSortable(missing)
		sortable.grab(ITEMS[0])
		expect(sortable.grabbedId.value).toBeNull()
		expect(missing.onStart).not.toHaveBeenCalled()
		expect(missing.onAnnounce).not.toHaveBeenCalled()
	})

	it('берёт элемент: onStart с источником keyboard и объявление PICKED', () => {
		const options = sortableOptions()
		const { sortable } = mountSortable(options)
		sortable.grab(ITEMS[1])
		expect(sortable.grabbedId.value).toBe('b')
		expect(options.onStart).toHaveBeenCalledWith('b', 'keyboard')
		expect(options.onAnnounce).toHaveBeenCalledWith('PICKED', 'b')
	})

	it('стрелка двигает на место из stepPlace, объявляет MOVED и возвращает фокус', () => {
		const options = sortableOptions()
		const { sortable } = mountSortable(options)
		sortable.grab(ITEMS[0])
		const event = key('ArrowDown')
		expect(sortable.handleGrabbedKeydown(event)).toBe(true)
		expect(event.defaultPrevented).toBe(true)
		expect(options.stepPlace).toHaveBeenCalledWith('a', 'ArrowDown')
		expect(options.onPreview).toHaveBeenCalledWith('a', 2)
		expect(options.onAnnounce).toHaveBeenLastCalledWith('MOVED', 'a')
		expect(options.focusItem).toHaveBeenCalledWith('a')
	})

	it('шагать некуда — ни переноса, ни объявления, но клавиша поглощена', () => {
		const options = sortableOptions()
		const { sortable } = mountSortable(options)
		sortable.grab(ITEMS[0])
		const event = key('ArrowUp')
		sortable.handleGrabbedKeydown(event)
		expect(event.defaultPrevented).toBe(true)
		expect(options.onPreview).not.toHaveBeenCalled()
		expect(options.onAnnounce).toHaveBeenCalledTimes(1)
		expect(options.focusItem).not.toHaveBeenCalled()
	})

	it.each([' ', 'Enter'])('«%s» кладёт: onDrop с местом, откуда взяли; done снимает захват и ставит фокус', name => {
		const options = sortableOptions()
		const { sortable } = mountSortable(options)
		sortable.grab(ITEMS[1])
		const event = key(name)
		sortable.handleGrabbedKeydown(event)
		expect(event.defaultPrevented).toBe(true)
		expect(options.onDrop).toHaveBeenCalledWith({ id: 'b', origin: 1 }, expect.any(Function))
		expect(sortable.grabbedId.value).toBe('b')
		vi.mocked(options.onDrop).mock.calls[0][1]()
		expect(sortable.grabbedId.value).toBeNull()
		expect(options.focusItem).toHaveBeenCalledWith('b')
	})

	it('Escape отменяет: onCancel, done снимает захват и возвращает фокус', () => {
		const options = sortableOptions()
		const { sortable } = mountSortable(options)
		sortable.grab(ITEMS[2])
		const event = key('Escape')
		sortable.handleGrabbedKeydown(event)
		expect(event.defaultPrevented).toBe(true)
		expect(options.onCancel).toHaveBeenCalledWith('c', expect.any(Function))
		vi.mocked(options.onCancel).mock.calls[0][1]()
		expect(sortable.grabbedId.value).toBeNull()
		expect(options.focusItem).toHaveBeenCalledWith('c')
	})

	it('Tab отменяет без preventDefault и без возврата фокуса — фокус уходит дальше', () => {
		const options = sortableOptions()
		const { sortable } = mountSortable(options)
		sortable.grab(ITEMS[0])
		const event = key('Tab')
		expect(sortable.handleGrabbedKeydown(event)).toBe(true)
		expect(event.defaultPrevented).toBe(false)
		expect(options.onCancel).toHaveBeenCalledWith('a', expect.any(Function))
		vi.mocked(options.onCancel).mock.calls[0][1]()
		expect(sortable.grabbedId.value).toBeNull()
		expect(options.focusItem).not.toHaveBeenCalled()
	})

	it('прочие клавиши взятый элемент не трогают и не отменяют', () => {
		const options = sortableOptions()
		const { sortable } = mountSortable(options)
		sortable.grab(ITEMS[0])
		const event = key('a')
		expect(sortable.handleGrabbedKeydown(event)).toBe(true)
		expect(event.defaultPrevented).toBe(false)
		expect(options.onCancel).not.toHaveBeenCalled()
		expect(sortable.grabbedId.value).toBe('a')
	})

	it('moveKeys заменяет клавиши шага: стрелка влево не двигает', () => {
		const options = sortableOptions({ moveKeys: ['ArrowDown'] })
		const { sortable } = mountSortable(options)
		sortable.grab(ITEMS[0])
		const left = key('ArrowLeft')
		sortable.handleGrabbedKeydown(left)
		expect(left.defaultPrevented).toBe(false)
		expect(options.stepPlace).not.toHaveBeenCalled()
		sortable.handleGrabbedKeydown(key('ArrowDown'))
		expect(options.onPreview).toHaveBeenCalledWith('a', 2)
	})

	it('шаг на место 0 — тоже перенос: onPreview с нулём и объявление', () => {
		const options = sortableOptions({ stepPlace: vi.fn(() => 0) })
		const { sortable } = mountSortable(options)
		sortable.grab(ITEMS[1])
		sortable.handleGrabbedKeydown(key('Home'))
		expect(options.onPreview).toHaveBeenCalledWith('b', 0)
		expect(options.onAnnounce).toHaveBeenLastCalledWith('MOVED', 'b')
		expect(options.focusItem).toHaveBeenCalledWith('b')
	})

	describe('уход фокуса из корня не по Tab', () => {
		beforeEach(() => vi.useFakeTimers())
		afterEach(() => {
			vi.useRealTimers()
			document.body.replaceChildren()
		})

		it('фокус ушёл за пределы корня — отмена без возврата фокуса', () => {
			const dom = rootWithItem()
			const options = sortableOptions({ rootRef: dom.rootRef })
			const { sortable } = mountSortable(options)
			sortable.grab(ITEMS[0])
			leaveFocus(dom.inside, dom.outside)
			expect(options.onCancel).toHaveBeenCalledWith('a', expect.any(Function))
			vi.mocked(options.onCancel).mock.calls[0][1]()
			expect(sortable.grabbedId.value).toBeNull()
			expect(options.focusItem).not.toHaveBeenCalled()
		})

		it('фокус пропал на миг и вернулся внутрь корня (перенос узла) — без отмены', () => {
			const dom = rootWithItem()
			const options = sortableOptions({ rootRef: dom.rootRef })
			const { sortable } = mountSortable(options)
			sortable.grab(ITEMS[0])
			dom.inside.focus()
			dom.outside.focus()
			dom.inside.focus()
			vi.runAllTimers()
			expect(options.onCancel).not.toHaveBeenCalled()
			expect(sortable.grabbedId.value).toBe('a')
		})

		it('после броска уход фокуса ничего не отменяет — слушатель снят', () => {
			const dom = rootWithItem()
			const options = sortableOptions({ rootRef: dom.rootRef })
			const { sortable } = mountSortable(options)
			sortable.grab(ITEMS[0])
			sortable.handleGrabbedKeydown(key('Enter'))
			vi.mocked(options.onDrop).mock.calls[0][1]()
			leaveFocus(dom.inside, dom.outside)
			expect(options.onCancel).not.toHaveBeenCalled()
		})

		it('бросок раньше проверки фокуса — проверка уже ничего не отменяет', () => {
			const dom = rootWithItem()
			const options = sortableOptions({ rootRef: dom.rootRef })
			const { sortable } = mountSortable(options)
			sortable.grab(ITEMS[0])
			dom.inside.focus()
			dom.outside.focus()
			sortable.handleGrabbedKeydown(key('Enter'))
			vi.mocked(options.onDrop).mock.calls[0][1]()
			vi.runAllTimers()
			expect(options.onCancel).not.toHaveBeenCalled()
		})

		it('уход фокуса после отмены по Tab не отменяет второй раз', () => {
			const dom = rootWithItem()
			const options = sortableOptions({ rootRef: dom.rootRef, onCancel: vi.fn((_id: string, done: () => void) => done()) })
			const { sortable } = mountSortable(options)
			sortable.grab(ITEMS[0])
			dom.inside.focus()
			sortable.handleGrabbedKeydown(key('Tab'))
			dom.outside.focus()
			vi.runAllTimers()
			expect(options.onCancel).toHaveBeenCalledTimes(1)
		})

		it('без корня и после размонтирования — без отмены', () => {
			const dom = rootWithItem()
			const rootless = sortableOptions()
			mountSortable(rootless).sortable.grab(ITEMS[0])
			const options = sortableOptions({ rootRef: dom.rootRef })
			const { sortable, wrapper } = mountSortable(options)
			sortable.grab(ITEMS[0])
			wrapper.unmount()
			leaveFocus(dom.inside, dom.outside)
			expect(rootless.onCancel).not.toHaveBeenCalled()
			expect(options.onCancel).not.toHaveBeenCalled()
		})

		it('повторный захват не вешает второй слушатель', () => {
			const dom = rootWithItem()
			const options = sortableOptions({ rootRef: dom.rootRef })
			const { sortable } = mountSortable(options)
			sortable.grab(ITEMS[0])
			sortable.grab(ITEMS[1])
			leaveFocus(dom.inside, dom.outside)
			expect(options.onCancel).toHaveBeenCalledTimes(1)
			expect(options.onCancel).toHaveBeenCalledWith('b', expect.any(Function))
		})
	})
})
