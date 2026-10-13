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

const frames: FrameRequestCallback[] = []

function flushFrames(): void {
	const pending = frames.splice(0)
	for (const callback of pending) callback(0)
}

beforeEach(() => {
	frames.length = 0
	vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => frames.push(callback))
	vi.stubGlobal('cancelAnimationFrame', (id: number) => {
		frames[id - 1] = () => {}
	})
})

afterEach(() => {
	vi.unstubAllGlobals()
})

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
		} as unknown as PointerEvent

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
		} as unknown as PointerEvent

		result.startResize(mockEvent, 'col1')

		document.dispatchEvent(new Event('pointerup'))

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

		result.startResize({ target: mockTarget, pageX: 500 } as unknown as PointerEvent, 'col1')
		expect(document.body.style.userSelect).toBe('none')

		wrapper.unmount()

		expect(document.body.style.userSelect).toBe('')
		expect(document.body.style.cursor).toBe('')

		// Слушатели сняты: поздние события не меняют ширину и не эмитят результат
		document.dispatchEvent(new Event('pointermove'))
		document.dispatchEvent(new Event('pointerup'))
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

		result.startResize({ target: mockTarget, pageX: 500 } as unknown as PointerEvent, 'col1')
		document.dispatchEvent(new Event('pointerup'))

		expect(document.body.style.cursor).toBe('progress')
		expect(document.body.style.userSelect).toBe('text')
		wrapper.unmount()
	})

	it('должен игнорировать pointerup, если ресайз не активен', () => {
		const { wrapper } = withSetup(() =>
			useColumnResize({
				columns,
				visibleColumns,
				minWidth: 50,
				onColumnResize: mockOnColumnResize,
				onColumnsChange: mockOnColumnsChange,
			}),
		)

		document.dispatchEvent(new Event('pointerup'))
		wrapper.unmount()
	})
})

describe('useColumnResize — перетаскивание по реальной строке заголовков', () => {
	type Column = { key: string; width?: string; minWidth?: string; maxWidth?: string }

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

	function press(target: EventTarget, pageX: number): PointerEvent {
		return { target, pageX } as unknown as PointerEvent
	}

	function move(pageX: number, pointerId?: number): void {
		const event = new Event('pointermove')
		Object.defineProperty(event, 'pageX', { value: pageX })
		if (pointerId !== undefined) Object.defineProperty(event, 'pointerId', { value: pointerId })
		document.dispatchEvent(event)
		flushFrames()
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

		document.dispatchEvent(new Event('pointerup'))
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

	it('колонка без ширины без движения указателя сообщает ширину 0', () => {
		const { table, ths } = buildHeader([100])
		const ctx = setup([{ key: 'a' }])
		cleanup = () => {
			ctx.wrapper.unmount()
			table.remove()
		}

		ctx.result.startResize(press(ths[0].handle, 0), 'a')
		document.dispatchEvent(new Event('pointerup'))

		expect(ctx.onColumnResize).toHaveBeenCalledWith('a', 0)
	})

	it('повторный старт без pointerup сохраняет исходные стили body', () => {
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

		document.dispatchEvent(new Event('pointerup'))
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
		document.dispatchEvent(new Event('pointerup'))
		expect(ctx.onColumnResize).not.toHaveBeenCalled()
	})

	it('TBL-12: правая и средняя кнопки мыши ресайз не начинают', () => {
		const { table, ths } = buildHeader([100, 150])
		const ctx = setup([
			{ key: 'a', width: '100px' },
			{ key: 'b', width: '150px' },
		])
		cleanup = () => {
			ctx.wrapper.unmount()
			table.remove()
		}
		ctx.result.startResize({ target: ths[0].handle, pageX: 0, button: 2 } as unknown as PointerEvent, 'a')
		expect(document.body.style.cursor).toBe('')
	})

	it('движения за один кадр сливаются: ширина считается раз за кадр по последнему положению', () => {
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
		for (const pageX of [10, 20, 30]) {
			const event = new Event('pointermove')
			Object.defineProperty(event, 'pageX', { value: pageX })
			document.dispatchEvent(event)
		}
		expect(frames).toHaveLength(1)
		expect(ctx.columns.value[0].width).toBe('100px')
		flushFrames()
		expect(ctx.columns.value[0].width).toBe('130px')
	})

	it('отпускание указателя применяет ещё не отрисованное движение', () => {
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
		const event = new Event('pointermove')
		Object.defineProperty(event, 'pageX', { value: 25 })
		document.dispatchEvent(event)
		document.dispatchEvent(new Event('pointerup'))
		expect(ctx.onColumnResize).toHaveBeenCalledWith('a', 125)
		flushFrames()
		expect(ctx.columns.value[0].width).toBe('125px')
	})

	it('pointercancel завершает жест так же, как отпускание', () => {
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
		move(15)
		document.dispatchEvent(new Event('pointercancel'))
		expect(ctx.onColumnResize).toHaveBeenCalledWith('a', 115)
		expect(document.body.style.userSelect).toBe('')
	})

	it('касание: чужой указатель (второй палец) жест не двигает и не завершает', () => {
		const { table, ths } = buildHeader([100, 150])
		const ctx = setup([
			{ key: 'a', width: '100px' },
			{ key: 'b', width: '150px' },
		])
		cleanup = () => {
			ctx.wrapper.unmount()
			table.remove()
		}
		ctx.result.startResize(
			{ target: ths[0].handle, pageX: 0, pointerId: 7, pointerType: 'touch', isPrimary: true, button: 0 } as unknown as PointerEvent,
			'a',
		)
		move(40, 8)
		expect(ctx.columns.value[0].width).toBe('100px')
		const foreignEnd = new Event('pointerup')
		Object.defineProperty(foreignEnd, 'pointerId', { value: 8 })
		document.dispatchEvent(foreignEnd)
		expect(ctx.onColumnResize).not.toHaveBeenCalled()
		move(40, 7)
		expect(ctx.columns.value[0].width).toBe('140px')
		const end = new Event('pointerup')
		Object.defineProperty(end, 'pointerId', { value: 7 })
		document.dispatchEvent(end)
		expect(ctx.onColumnResize).toHaveBeenCalledWith('a', 140)
	})

	it('не основной указатель (второй палец) ресайз не начинает', () => {
		const { table, ths } = buildHeader([100, 150])
		const ctx = setup([
			{ key: 'a', width: '100px' },
			{ key: 'b', width: '150px' },
		])
		cleanup = () => {
			ctx.wrapper.unmount()
			table.remove()
		}
		ctx.result.startResize({ target: ths[0].handle, pageX: 0, button: 0, isPrimary: false } as unknown as PointerEvent, 'a')
		expect(document.body.style.cursor).toBe('')
	})

	it('размонтирование отменяет отложенный кадр: движение после него ничего не меняет', () => {
		const { table, ths } = buildHeader([100, 150])
		const ctx = setup([
			{ key: 'a', width: '100px' },
			{ key: 'b', width: '150px' },
		])
		ctx.result.startResize(press(ths[0].handle, 0), 'a')
		const event = new Event('pointermove')
		Object.defineProperty(event, 'pageX', { value: 30 })
		document.dispatchEvent(event)
		ctx.wrapper.unmount()
		flushFrames()
		expect(ctx.columns.value[0].width).toBe('100px')
		table.remove()
	})

	it('minWidth и maxWidth колонки ограничивают её ширину, сосед занимает остаток', () => {
		const { table, ths } = buildHeader([100, 150])
		const ctx = setup([
			{ key: 'a', width: '100px', minWidth: '80px', maxWidth: '130px' },
			{ key: 'b', width: '150px' },
		])
		cleanup = () => {
			ctx.wrapper.unmount()
			table.remove()
		}
		ctx.result.startResize(press(ths[0].handle, 0), 'a')
		move(500)
		expect(ctx.columns.value.map(column => column.width)).toEqual(['130px', '120px'])
		move(-500)
		expect(ctx.columns.value.map(column => column.width)).toEqual(['80px', '170px'])
	})

	it('minWidth и maxWidth соседа тоже соблюдаются, единицы кроме px игнорируются', () => {
		const { table, ths } = buildHeader([100, 150])
		const ctx = setup([
			{ key: 'a', width: '100px', minWidth: '5rem' },
			{ key: 'b', width: '150px', minWidth: '120px', maxWidth: '200px' },
		])
		cleanup = () => {
			ctx.wrapper.unmount()
			table.remove()
		}
		ctx.result.startResize(press(ths[0].handle, 0), 'a')
		move(500)
		expect(ctx.columns.value.map(column => column.width)).toEqual(['130px', '120px'])
		move(-500)
		expect(ctx.columns.value.map(column => column.width)).toEqual(['50px', '200px'])
	})

	it('несовместимые границы оставляют ширину как была', () => {
		const { table, ths } = buildHeader([100, 150])
		const ctx = setup([
			{ key: 'a', width: '100px', minWidth: '300px' },
			{ key: 'b', width: '150px' },
		])
		cleanup = () => {
			ctx.wrapper.unmount()
			table.remove()
		}
		ctx.result.startResize(press(ths[0].handle, 0), 'a')
		move(20)
		expect(ctx.columns.value.map(column => column.width)).toEqual(['100px', '150px'])
	})

	it('resizeBy меняет ширину колонки и соседа на шаг клавиатуры и сообщает итог', () => {
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
		ctx.result.resizeBy(ths[0].th, 'a', 10)
		expect(ctx.columns.value.map(column => column.width)).toEqual(['110px', '140px', '200px'])
		expect(ctx.onColumnResize).toHaveBeenCalledWith('a', 110)
		expect(ctx.onColumnsChange).toHaveBeenCalledTimes(1)
	})

	it('resizeBy берёт ширину ячейки на экране, а не column.width: проценты и растянутая колонка (п. 3 проверки)', () => {
		const { table, ths } = buildHeader([200, 180, 300])
		const ctx = setup([
			{ key: 'a', width: '20%' },
			{ key: 'b', width: '100px' },
			{ key: 'c', width: '12rem' },
		])
		cleanup = () => {
			ctx.wrapper.unmount()
			table.remove()
		}
		ctx.result.resizeBy(ths[0].th, 'a', 10)
		expect(ctx.onColumnResize).toHaveBeenLastCalledWith('a', 210)
		expect(ctx.columns.value[1].width).toBe('170px')
		ctx.result.resizeBy(ths[1].th, 'b', 10)
		expect(ctx.onColumnResize).toHaveBeenLastCalledWith('b', 190)
	})

	it('resizeBy у колонки без ширины берёт ширину ячейки, у единственной колонки соседа нет', () => {
		const { table, ths } = buildHeader([120])
		const ctx = setup([{ key: 'a' }])
		cleanup = () => {
			ctx.wrapper.unmount()
			table.remove()
		}
		ctx.result.resizeBy(ths[0].th, 'a', -100)
		expect(ctx.columns.value[0].width).toBe('50px')
		expect(ctx.onColumnResize).toHaveBeenCalledWith('a', 50)
	})

	it('вне компонента composable работает без хука размонтирования', () => {
		const columns = ref<Column[]>([{ key: 'a', width: '100px' }])
		const api = useColumnResize({
			columns,
			visibleColumns: columns,
			minWidth: 50,
			onColumnResize: vi.fn(),
			onColumnsChange: vi.fn(),
		})
		expect(typeof api.startResize).toBe('function')
	})
})
