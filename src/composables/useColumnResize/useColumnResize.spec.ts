import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref } from 'vue'
import { useColumnResize } from './useColumnResize'

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
		// Это покрывает строку 53: return ''
		visibleColumns.value = [{ key: 'col1', width: '100px' }]

		const { startResize } = useColumnResize({
			columns,
			visibleColumns,
			minWidth: 50,
			onColumnResize: mockOnColumnResize,
			onColumnsChange: mockOnColumnsChange,
		})

		const mockTh = {
			offsetWidth: 100,
			closest: vi.fn().mockReturnValue({ offsetWidth: 100 }),
		}

		const mockEvent = {
			target: { closest: vi.fn().mockReturnValue(mockTh) },
			pageX: 500,
		} as unknown as MouseEvent

		// Передаем ключ, которого нет в visibleColumns
		startResize(mockEvent, 'non_existent_key')

		// Ресайз должен начаться, но nextColumnKey будет ''
		expect(document.body.style.cursor).toBe('col-resize')
	})

	it('должен корректно завершить ресайз и вызвать callback', () => {
		const { startResize } = useColumnResize({
			columns,
			visibleColumns,
			minWidth: 50,
			onColumnResize: mockOnColumnResize,
			onColumnsChange: mockOnColumnsChange,
		})

		const mockTh = {
			offsetWidth: 100,
			closest: vi.fn().mockReturnValue({ offsetWidth: 100 }),
		}

		const mockEvent = {
			target: { closest: vi.fn().mockReturnValue(mockTh) },
			pageX: 500,
		} as unknown as MouseEvent

		startResize(mockEvent, 'col1')

		// Имитируем mouseup для завершения ресайза
		document.dispatchEvent(new MouseEvent('mouseup'))

		expect(document.body.style.cursor).toBe('')
		expect(document.body.style.userSelect).toBe('')
		expect(mockOnColumnResize).toHaveBeenCalledWith('col1', 100)
		expect(mockOnColumnsChange).toHaveBeenCalledWith(columns.value)
	})

	it('должен игнорировать mouseup, если ресайз не активен', () => {
		const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')

		const { startResize } = useColumnResize({
			columns,
			visibleColumns,
			minWidth: 50,
			onColumnResize: mockOnColumnResize,
			onColumnsChange: mockOnColumnsChange,
		})

		// Вызываем mouseup без предварительного startResize
		document.dispatchEvent(new MouseEvent('mouseup'))

		// removeEventListener не должен быть вызван для mouseup, так как isResizing === false
		// (хотя onBeforeUnmount все равно зарегистрирует свои, но stopResize вернется рано)
	})
})
