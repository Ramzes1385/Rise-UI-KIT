import type { Ref } from 'vue'
import { mount } from '@vue/test-utils'
import { defineComponent, ref } from 'vue'
import { useColumnResize } from '../useColumnResize'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

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

	let columns: Ref<Array<{ key: string; width: string }>>
	let visibleColumns: Ref<Array<{ key: string; width: string }>>

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

		const mockTh = document.createElement('th')
		Object.defineProperty(mockTh, 'offsetWidth', { value: 100 })
		vi.spyOn(mockTh, 'closest').mockReturnValue(mockTh)

		const mockTarget = document.createElement('div')
		vi.spyOn(mockTarget, 'closest').mockReturnValue(mockTh)

		const mockEvent = {
			target: mockTarget,
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

		const mockTh = document.createElement('th')
		Object.defineProperty(mockTh, 'offsetWidth', { value: 100 })
		vi.spyOn(mockTh, 'closest').mockReturnValue(mockTh)

		const mockTarget = document.createElement('div')
		vi.spyOn(mockTarget, 'closest').mockReturnValue(mockTh)

		const mockEvent = {
			target: mockTarget,
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

	// Регрессия TBL-12: размонтирование посреди перетаскивания
	it('при размонтировании во время ресайза снимает слушатели и возвращает стили body', () => {
		const { result, wrapper } = withSetup(() =>
			useColumnResize({
				columns,
				visibleColumns,
				minWidth: 50,
				onColumnResize: mockOnColumnResize,
				onColumnsChange: mockOnColumnsChange,
			}),
		)

		const mockTh = document.createElement('th')
		Object.defineProperty(mockTh, 'offsetWidth', { value: 100 })
		const mockTarget = document.createElement('div')
		vi.spyOn(mockTarget, 'closest').mockReturnValue(mockTh)

		result.startResize({ target: mockTarget, pageX: 500 } as unknown as MouseEvent, 'col1')
		expect(document.body.style.userSelect).toBe('none')

		wrapper.unmount()

		expect(document.body.style.userSelect).toBe('')
		expect(document.body.style.cursor).toBe('')

		// Слушатели сняты: поздние события не меняют ширину и не эмитят результат
		document.dispatchEvent(new MouseEvent('mousemove'))
		document.dispatchEvent(new MouseEvent('mouseup'))
		expect(columns.value[0].width).toBe('100px')
		expect(mockOnColumnResize).not.toHaveBeenCalled()
	})

	it('после ресайза возвращает стили body, которые были до его начала', () => {
		document.body.style.cursor = 'progress'
		document.body.style.userSelect = 'text'
		const { result, wrapper } = withSetup(() =>
			useColumnResize({
				columns,
				visibleColumns,
				minWidth: 50,
				onColumnResize: mockOnColumnResize,
				onColumnsChange: mockOnColumnsChange,
			}),
		)

		const mockTh = document.createElement('th')
		Object.defineProperty(mockTh, 'offsetWidth', { value: 100 })
		const mockTarget = document.createElement('div')
		vi.spyOn(mockTarget, 'closest').mockReturnValue(mockTh)

		result.startResize({ target: mockTarget, pageX: 500 } as unknown as MouseEvent, 'col1')
		document.dispatchEvent(new MouseEvent('mouseup'))

		expect(document.body.style.cursor).toBe('progress')
		expect(document.body.style.userSelect).toBe('text')
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

describe('useColumnResize — перетаскивание по реальной строке заголовков', () => {
	type Column = { key: string; width?: string }

	function buildHeader(widths: number[]) {
		const table = document.createElement('table')
		const tr = document.createElement('tr')
		const ths = widths.map(width => {
			const th = document.createElement('th')
			Object.defineProperty(th, 'offsetWidth', { value: width })
			const handle = document.createElement('span')
			th.appendChild(handle)
			tr.appendChild(th)
			return { th, handle }
		})
		table.appendChild(tr)
		document.body.appendChild(table)
		return { table, ths }
	}

	function setup(initial: Column[], visible = initial) {
		const columns = ref<Column[]>(initial)
		const visibleColumns = ref<Column[]>(visible)
		const onColumnResize = vi.fn()
		const onColumnsChange = vi.fn()
		const { result, wrapper } = withSetup(() =>
			useColumnResize({ columns, visibleColumns, minWidth: 50, onColumnResize, onColumnsChange }),
		)
		return { columns, result, wrapper, onColumnResize, onColumnsChange }
	}

	function press(target: EventTarget, pageX: number): MouseEvent {
		return { target, pageX } as unknown as MouseEvent
	}

	function move(pageX: number): void {
		const event = new MouseEvent('mousemove')
		Object.defineProperty(event, 'pageX', { value: pageX })
		document.dispatchEvent(event)
	}

	let cleanup: (() => void) | null = null

	afterEach(() => {
		cleanup?.()
		cleanup = null
		document.body.style.cursor = ''
		document.body.style.userSelect = ''
	})

	it('расширяет колонку за счёт соседней справа и сообщает итоговую ширину', () => {
		const { table, ths } = buildHeader([100, 150, 200])
		const ctx = setup([
			{ key: 'a', width: '100px' },
			{ key: 'b', width: '150px' },
			{ key: 'c', width: '200px' },
		])
		cleanup = () => {
			ctx.wrapper.unmount()
			table.remove()
		}

		ctx.result.startResize(press(ths[0].handle, 10), 'a')
		move(40)

		expect(ctx.columns.value[0].width).toBe('130px')
		expect(ctx.columns.value[1].width).toBe('120px')
		expect(ctx.columns.value[2].width).toBe('200px')

		document.dispatchEvent(new MouseEvent('mouseup'))
		expect(ctx.onColumnResize).toHaveBeenCalledWith('a', 130)
		expect(ctx.onColumnsChange).toHaveBeenCalledWith(ctx.columns.value)
	})

	it('не даёт соседней колонке стать уже минимума и не сжимает колонку меньше минимума', () => {
		const { table, ths } = buildHeader([100, 150])
		const ctx = setup(
			[
				{ key: 'a', width: '100px' },
				{ key: 'b', width: '150px' },
				{ key: 'c', width: '80px' },
			],
			[
				{ key: 'a', width: '100px' },
				{ key: 'b', width: '150px' },
			],
		)
		cleanup = () => {
			ctx.wrapper.unmount()
			table.remove()
		}

		ctx.result.startResize(press(ths[0].handle, 0), 'a')
		move(1000)
		expect(ctx.columns.value[0].width).toBe('200px')
		expect(ctx.columns.value[1].width).toBe('50px')

		move(-1000)
		expect(ctx.columns.value[0].width).toBe('50px')
		expect(ctx.columns.value[1].width).toBe('200px')
	})

	it('у последней колонки соседом берётся предыдущая', () => {
		const { table, ths } = buildHeader([100, 150])
		const ctx = setup([
			{ key: 'a', width: '100px' },
			{ key: 'b', width: '150px' },
		])
		cleanup = () => {
			ctx.wrapper.unmount()
			table.remove()
		}

		ctx.result.startResize(press(ths[1].handle, 0), 'b')
		move(-30)

		expect(ctx.columns.value[1].width).toBe('120px')
		expect(ctx.columns.value[0].width).toBe('130px')
	})

	it('единственная видимая колонка растёт без ограничения сверху', () => {
		const { table, ths } = buildHeader([100])
		const ctx = setup([{ key: 'a', width: '100px' }])
		cleanup = () => {
			ctx.wrapper.unmount()
			table.remove()
		}

		ctx.result.startResize(press(ths[0].handle, 0), 'a')
		move(5000)

		expect(ctx.columns.value[0].width).toBe('5100px')
	})

	it('колонка без ширины без движения мыши сообщает ширину 0', () => {
		const { table, ths } = buildHeader([100])
		const ctx = setup([{ key: 'a' }])
		cleanup = () => {
			ctx.wrapper.unmount()
			table.remove()
		}

		ctx.result.startResize(press(ths[0].handle, 0), 'a')
		document.dispatchEvent(new MouseEvent('mouseup'))

		expect(ctx.onColumnResize).toHaveBeenCalledWith('a', 0)
	})

	it('повторный старт без mouseup сохраняет исходные стили body', () => {
		document.body.style.cursor = 'wait'
		document.body.style.userSelect = 'auto'
		const { table, ths } = buildHeader([100, 150])
		const ctx = setup([
			{ key: 'a', width: '100px' },
			{ key: 'b', width: '150px' },
		])
		cleanup = () => {
			ctx.wrapper.unmount()
			table.remove()
		}

		ctx.result.startResize(press(ths[0].handle, 0), 'a')
		ctx.result.startResize(press(ths[0].handle, 0), 'a')
		expect(document.body.style.cursor).toBe('col-resize')

		document.dispatchEvent(new MouseEvent('mouseup'))
		expect(document.body.style.cursor).toBe('wait')
		expect(document.body.style.userSelect).toBe('auto')
	})

	it('размонтирование без активного перетаскивания не трогает стили body', () => {
		document.body.style.cursor = 'help'
		const ctx = setup([{ key: 'a', width: '100px' }])
		ctx.wrapper.unmount()
		expect(document.body.style.cursor).toBe('help')
	})

	it('нажатие вне заголовка колонки не начинает перетаскивание', () => {
		const ctx = setup([{ key: 'a', width: '100px' }])
		cleanup = () => ctx.wrapper.unmount()

		ctx.result.startResize(press(null as unknown as EventTarget, 0), 'a')
		ctx.result.startResize(press(document.createElement('span'), 0), 'a')

		expect(document.body.style.cursor).toBe('')
		document.dispatchEvent(new MouseEvent('mouseup'))
		expect(ctx.onColumnResize).not.toHaveBeenCalled()
	})
})
