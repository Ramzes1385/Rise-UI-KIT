import { normalizeTasks } from '../../model/tasks/ganttTasks'
import type { GanttMetrics } from '../../types/BaseGanttModel.types'
import { dependencyArrow, rowWindow } from '../../model/view/ganttLayout'
import { boxOf, milestoneSize, spanOf } from '../../model/view/ganttBoxes'

const at = (day: number): Date => new Date(2026, 9, day)
const metrics: GanttMetrics = { scale: 'day', rowHeight: 40, listWidth: 280, headerHeight: 48, dayWidth: 10, firstDay: 1 }
const range = { start: at(1), days: 30 }
const [task, point] = normalizeTasks([
	{ id: 1, name: 'Задача', start: '2026-10-05', end: '2026-10-07' },
	{ id: 2, name: 'Веха', start: '2026-10-10', isMilestone: true },
])

describe('rowWindow', () => {
	it('берёт видимые строки и запас с обеих сторон', () => {
		expect(rowWindow({ top: 400, viewport: 200 }, { height: 40, count: 100 }, 2)).toEqual({ start: 8, end: 17 })
	})

	it('не выходит за пределы списка', () => {
		expect(rowWindow({ top: 0, viewport: 200 }, { height: 40, count: 3 }, 5)).toEqual({ start: 0, end: 3 })
		expect(rowWindow({ top: 10_000, viewport: 200 }, { height: 40, count: 3 }, 5)).toEqual({ start: 3, end: 3 })
		expect(rowWindow({ top: 0, viewport: 200 }, { height: 40, count: 0 }, 5)).toEqual({ start: 0, end: 0 })
	})
})

describe('dependencyArrow', () => {
	const from = { x: 0, width: 100, row: 0 }
	const fs = { rowHeight: 40, type: 'FS' } as const

	it('прямая линия в одной строке', () => {
		expect(dependencyArrow(from, { x: 150, width: 50, row: 0 }, fs).line).toBe('M100 20H150')
	})

	it('ломаная с одним изломом, если есть место справа от полосы', () => {
		expect(dependencyArrow(from, { x: 150, width: 50, row: 2 }, fs).line).toBe('M100 20H110V100H150')
	})

	it('обход между строками, если следующая полоса начинается раньше окончания предыдущей', () => {
		expect(dependencyArrow(from, { x: 50, width: 50, row: 1 }, fs).line).toBe('M100 20H110V40H40V60H50')
		expect(dependencyArrow({ ...from, row: 2 }, { x: 50, width: 50, row: 1 }, fs).line).toBe('M100 100H110V80H40V60H50')
	})

	it('наконечник — закрашенный треугольник у начала целевой полосы', () => {
		expect(dependencyArrow(from, { x: 150, width: 50, row: 1 }, fs).head).toBe('M150 60l-5 -3.5v7z')
	})

	it('«начало — начало»: линия уходит влево от начала предшественника, наконечник смотрит вправо', () => {
		const arrow = dependencyArrow(from, { x: 150, width: 50, row: 2 }, { rowHeight: 40, type: 'SS' })
		expect(arrow.line).toBe('M0 20H-10V100H150')
		expect(arrow.head).toBe('M150 100l-5 -3.5v7z')
	})

	it('«окончание — окончание»: линия входит в окончание справа, наконечник смотрит влево', () => {
		const arrow = dependencyArrow(from, { x: 150, width: 50, row: 2 }, { rowHeight: 40, type: 'FF' })
		expect(arrow.line).toBe('M100 20H210V100H200')
		expect(arrow.head).toBe('M200 100l5 -3.5v7z')
	})

	it('«начало — окончание»: прямой излом, если место есть, иначе обход между строками', () => {
		const far = { x: 400, width: 100, row: 0 }
		expect(dependencyArrow(far, { x: 100, width: 50, row: 2 }, { rowHeight: 40, type: 'SF' }).line).toBe('M400 20H160V100H150')
		const arrow = dependencyArrow(from, { x: 150, width: 50, row: 2 }, { rowHeight: 40, type: 'SF' })
		expect(arrow.line).toBe('M0 20H-10V40H210V100H200')
		expect(arrow.head).toBe('M200 100l5 -3.5v7z')
	})
})

describe('ganttBoxes', () => {
	it('spanOf берёт даты задачи или черновика', () => {
		expect(spanOf(task, null)).toEqual({ start: at(5), end: at(7) })
		expect(spanOf(task, { id: 1, edit: { kind: 'move', span: { start: at(8), end: at(9) } } })).toEqual({ start: at(8), end: at(9) })
		expect(spanOf(task, { id: 99, edit: { kind: 'move', span: { start: at(8), end: at(9) } } })).toEqual({ start: at(5), end: at(7) })
	})

	it('boxOf: полоса занимает дни включительно', () => {
		expect(boxOf({ span: spanOf(task, null), row: 3, isMilestone: false }, range, metrics)).toEqual({ x: 40, width: 30, row: 3 })
	})

	it('boxOf: веха — квадрат по центру дня', () => {
		const size = milestoneSize(metrics.rowHeight)
		expect(size).toBe(20)
		expect(boxOf({ span: spanOf(point, null), row: 0, isMilestone: true }, range, metrics)).toEqual({
			x: 90 + (10 - size) / 2,
			width: size,
			row: 0,
		})
	})
})
