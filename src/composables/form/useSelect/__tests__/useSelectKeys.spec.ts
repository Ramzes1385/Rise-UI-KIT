import { ref } from 'vue'
import { useSelectKeys } from '../useSelectKeys'

function setup(state: { isOpen?: boolean; activeIndex?: number; isTyping?: boolean; isDisabled?: boolean; isSearchable?: boolean } = {}) {
	const select = {
		isOpen: ref(state.isOpen ?? false),
		activeIndex: ref(state.activeIndex ?? -1),
		openDropdown: vi.fn(),
		toggleDropdown: vi.fn(),
		handleClose: vi.fn(),
		selectActive: vi.fn(),
		moveActive: vi.fn(),
		setActiveEdge: vi.fn(),
		typeaheadActive: vi.fn(),
		isTypingAhead: vi.fn(() => state.isTyping ?? false),
	}
	const keys = useSelectKeys({
		select,
		isDisabled: () => state.isDisabled ?? false,
		isSearchable: state.isSearchable === undefined ? undefined : () => Boolean(state.isSearchable),
	})
	return { select, keys }
}

function press(keys: ReturnType<typeof setup>['keys'], key: string, init: KeyboardEventInit = {}): KeyboardEvent {
	const event = new KeyboardEvent('keydown', { key, cancelable: true, ...init })
	keys.handleTriggerKeydown(event)
	return event
}

describe('useSelectKeys', () => {
	it('Enter и пробел открывают закрытый список, в открытом выбирают активную опцию', () => {
		const closed = setup()
		expect(press(closed.keys, 'Enter').defaultPrevented).toBe(true)
		press(closed.keys, ' ')
		expect(closed.select.toggleDropdown).toHaveBeenCalledTimes(2)
		const open = setup({ isOpen: true, activeIndex: 2 })
		press(open.keys, 'Enter')
		expect(open.select.selectActive).toHaveBeenCalledOnce()
		const empty = setup({ isOpen: true, activeIndex: -1 })
		press(empty.keys, 'Enter')
		expect(empty.select.toggleDropdown).toHaveBeenCalledOnce()
	})

	it('стрелки открывают список, в открытом двигают активную опцию', () => {
		const closed = setup()
		expect(press(closed.keys, 'ArrowDown').defaultPrevented).toBe(true)
		expect(closed.select.openDropdown).toHaveBeenCalledOnce()
		const open = setup({ isOpen: true })
		press(open.keys, 'ArrowDown')
		press(open.keys, 'ArrowUp')
		expect(open.select.moveActive.mock.calls).toEqual([[1], [-1]])
	})

	it('Home и End открывают список на первой и последней опции', () => {
		const { keys, select } = setup()
		press(keys, 'Home')
		press(keys, 'End')
		expect(select.openDropdown).toHaveBeenCalledTimes(2)
		expect(select.setActiveEdge.mock.calls).toEqual([['first'], ['last']])
	})

	it('Tab закрывает открытый список и не мешает уходу фокуса', () => {
		const closed = setup()
		expect(press(closed.keys, 'Tab').defaultPrevented).toBe(false)
		expect(closed.select.handleClose).not.toHaveBeenCalled()
		const open = setup({ isOpen: true })
		press(open.keys, 'Tab')
		expect(open.select.isOpen.value).toBe(false)
		expect(open.select.handleClose).toHaveBeenCalledOnce()
		const other = setup({ isOpen: true })
		other.keys.closeDropdown()
		expect(other.select.isOpen.value).toBe(false)
	})

	it('буквы открывают список и ищут опцию; пробел во время набора — часть поиска', () => {
		const { keys, select } = setup()
		expect(press(keys, 'к').defaultPrevented).toBe(true)
		expect(select.openDropdown).toHaveBeenCalledOnce()
		expect(select.typeaheadActive).toHaveBeenCalledWith('к')
		const typing = setup({ isTyping: true })
		press(typing.keys, ' ')
		expect(typing.select.typeaheadActive).toHaveBeenCalledWith(' ')
		expect(typing.select.toggleDropdown).not.toHaveBeenCalled()
	})

	it('сочетания, служебные клавиши, поле поиска и блокировка — без действий', () => {
		const { keys, select } = setup()
		for (const init of [{ ctrlKey: true }, { metaKey: true }, { altKey: true }]) press(keys, 'a', init)
		press(keys, 'Shift')
		const searchable = setup({ isSearchable: true })
		press(searchable.keys, 'a')
		const disabled = setup({ isDisabled: true })
		press(disabled.keys, 'Enter')
		for (const state of [select, searchable.select, disabled.select]) {
			expect(state.openDropdown).not.toHaveBeenCalled()
			expect(state.toggleDropdown).not.toHaveBeenCalled()
			expect(state.typeaheadActive).not.toHaveBeenCalled()
		}
	})
})
