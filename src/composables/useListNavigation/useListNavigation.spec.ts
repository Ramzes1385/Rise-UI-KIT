import '@testing-library/jest-dom/vitest'
import { useListNavigation } from './useListNavigation'

describe('useListNavigation', () => {
	function createOptions(overrides: { isLoop?: boolean; onEscape?: () => void } = {}) {
		const onSelect = vi.fn()
		const onEscape = overrides.onEscape ?? vi.fn()
		return {
			itemCount: () => 5,
			onSelect,
			onEscape,
			isLoop: overrides.isLoop ?? false,
			_onSelect: onSelect,
			_onEscape: onEscape,
		}
	}

	it('начинает с highlightedIndex = -1', () => {
		const opts = createOptions()
		const { highlightedIndex } = useListNavigation(opts)
		expect(highlightedIndex.value).toBe(-1)
	})

	describe('handleKeydown', () => {
		it('ArrowDown увеличивает индекс', () => {
			const opts = createOptions()
			const { handleKeydown, highlightedIndex } = useListNavigation(opts)
			handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
			expect(highlightedIndex.value).toBe(0)
			handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
			expect(highlightedIndex.value).toBe(1)
		})

		it('ArrowUp уменьшает индекс', () => {
			const opts = createOptions()
			const { handleKeydown, highlightedIndex } = useListNavigation(opts)
			handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
			handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
			handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
			expect(highlightedIndex.value).toBe(0)
		})

		it('ArrowUp не уходит ниже 0 без loop', () => {
			const opts = createOptions()
			const { handleKeydown, highlightedIndex } = useListNavigation(opts)
			handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
			expect(highlightedIndex.value).toBe(-1)
		})

		it('ArrowDown зацикливается при isLoop', () => {
			const opts = createOptions({ isLoop: true })
			const { handleKeydown, highlightedIndex } = useListNavigation(opts)
			for (let i = 0; i < 5; i++) {
				handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
			}
			expect(highlightedIndex.value).toBe(4)
			handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
			expect(highlightedIndex.value).toBe(0)
		})

		it('ArrowUp зацикливается при isLoop', () => {
			const opts = createOptions({ isLoop: true })
			const { handleKeydown, highlightedIndex } = useListNavigation(opts)
			handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
			expect(highlightedIndex.value).toBe(4)
		})

		it('Enter вызывает onSelect', () => {
			const opts = createOptions()
			const { handleKeydown } = useListNavigation(opts)
			handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
			handleKeydown(new KeyboardEvent('keydown', { key: 'Enter' }))
			expect(opts._onSelect).toHaveBeenCalledWith(0)
		})

		it('Enter не вызывает onSelect при -1', () => {
			const opts = createOptions()
			const { handleKeydown } = useListNavigation(opts)
			handleKeydown(new KeyboardEvent('keydown', { key: 'Enter' }))
			expect(opts._onSelect).not.toHaveBeenCalled()
		})

		it('Escape вызывает onEscape', () => {
			const opts = createOptions()
			const { handleKeydown } = useListNavigation(opts)
			handleKeydown(new KeyboardEvent('keydown', { key: 'Escape' }))
			expect(opts._onEscape).toHaveBeenCalled()
		})
	})

	describe('reset', () => {
		it('сбрасывает индекс', () => {
			const opts = createOptions()
			const { handleKeydown, reset, highlightedIndex } = useListNavigation(opts)
			handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
			expect(highlightedIndex.value).toBe(0)
			reset()
			expect(highlightedIndex.value).toBe(-1)
		})
	})

	it('не двигает индекс при itemCount=0', () => {
		const opts = { itemCount: () => 0, onSelect: vi.fn(), isLoop: false }
		const { handleKeydown, highlightedIndex } = useListNavigation(opts)
		handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
		expect(highlightedIndex.value).toBe(-1)
	})

	it('не двигает индекс ArrowUp при itemCount=0', () => {
		const opts = { itemCount: () => 0, onSelect: vi.fn(), isLoop: false }
		const { handleKeydown, highlightedIndex } = useListNavigation(opts)
		handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
		expect(highlightedIndex.value).toBe(-1)
	})

	it('ArrowDown не зацикливается без isLoop на последнем элементе', () => {
		const opts = createOptions({ isLoop: false })
		const { handleKeydown, highlightedIndex } = useListNavigation(opts)
		for (let i = 0; i < 5; i++) {
			handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
		}
		expect(highlightedIndex.value).toBe(4)
		handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
		expect(highlightedIndex.value).toBe(4)
	})

	it('Escape не вызывает onEscape если не передан', () => {
		const opts = { itemCount: () => 5, onSelect: vi.fn(), isLoop: false }
		const { handleKeydown } = useListNavigation(opts)
		expect(() => {
			handleKeydown(new KeyboardEvent('keydown', { key: 'Escape' }))
		}).not.toThrow()
	})

	it('игнорирует неизвестные клавиши', () => {
		const opts = createOptions()
		const { handleKeydown, highlightedIndex } = useListNavigation(opts)
		handleKeydown(new KeyboardEvent('keydown', { key: 'Tab' }))
		expect(highlightedIndex.value).toBe(-1)
	})
})
