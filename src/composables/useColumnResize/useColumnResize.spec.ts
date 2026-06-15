import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { defineComponent, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useColumnResize } from './useColumnResize'

function withSetup(fn: () => ReturnType<typeof useColumnResize>) {
	let result: ReturnType<typeof useColumnResize>
	const wrapper = mount(
		defineComponent({
			setup() {
				result = fn()
				return () => {}
			},
		}),
	)
	return { result: result!, wrapper }
}

describe('useColumnResize', () => {
	const mockOnColumnResize = vi.fn()
	const mockOnColumnsChange = vi.fn()

	const createMockColumns = () => [
		{ key: 'col1', width: '100px' },
		{ key: 'col2', width: '150px' },
		{ key: 'col3', width: '200px' },
	]

	let columns: ReturnType<typeof ref>
	let visibleColumns: ReturnType<typeof ref>

	beforeEach(() => {
		vi.clearAllMocks()
		columns = ref(createMockColumns())
		visibleColumns = ref(createMockColumns())
	})

	afterEach(() => {
		document.body.style.cursor = ''
		document.body.style.userSelect = ''
	})

	it('должен вернуть пустую строку, если колонка не найдена в visibleColumns', () => {
		visibleColumns.value = [{ key: 'col1', width: '100px' }]

		const { result, wrapper } = withSetup(() =>
			useColumnResize({
				columns,
				visibleColumns,
				minWidth: 50,
				onColumnResize: mockOnColumnResize,
				onColumnsChange: mockOnColumnsChange,
			}),
		)

		const mockTh = {
			offsetWidth: 100,
			closest: vi.fn().mockReturnValue({ offsetWidth: 100 }),
		}

		const mockEvent = {
			target: { closest: vi.fn().mockReturnValue(mockTh) },
			pageX: 500,
		} as unknown as MouseEvent

		result.startResize(mockEvent, 'non_existent_key')

		expect(document.body.style.cursor).toBe('col-resize')
		wrapper.unmount()
	})

	it('должен корректно завершить ресайз и вызвать callback', () => {
		const { result, wrapper } = withSetup(() =>
			useColumnResize({
				columns,
				visibleColumns,
				minWidth: 50,
				onColumnResize: mockOnColumnResize,
				onColumnsChange: mockOnColumnsChange,
			}),
		)

		const mockTh = {
			offsetWidth: 100,
			closest: vi.fn().mockReturnValue({ offsetWidth: 100 }),
		}

		const mockEvent = {
			target: { closest: vi.fn().mockReturnValue(mockTh) },
			pageX: 500,
		} as unknown as MouseEvent

		result.startResize(mockEvent, 'col1')

		document.dispatchEvent(new MouseEvent('mouseup'))

		expect(document.body.style.cursor).toBe('')
		expect(document.body.style.userSelect).toBe('')
		expect(mockOnColumnResize).toHaveBeenCalledWith('col1', 100)
		expect(mockOnColumnsChange).toHaveBeenCalledWith(columns.value)
		wrapper.unmount()
	})

	it('должен игнорировать mouseup, если ресайз не активен', () => {
		const { wrapper } = withSetup(() =>
			useColumnResize({
				columns,
				visibleColumns,
				minWidth: 50,
				onColumnResize: mockOnColumnResize,
				onColumnsChange: mockOnColumnsChange,
			}),
		)

		document.dispatchEvent(new MouseEvent('mouseup'))
		wrapper.unmount()
	})
})
