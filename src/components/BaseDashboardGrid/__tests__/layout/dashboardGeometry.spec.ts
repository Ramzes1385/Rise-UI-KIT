import type { DashboardLayoutItem, DashboardPointerDrag } from '../../types/BaseDashboardGrid.types'
import {
	breakpointFor,
	cellAt,
	colsFor,
	createMetrics,
	draggedRect,
	gridHeight,
	itemRect,
	pickLayout,
	resolveBreakpoints,
	sizeAt,
} from '../../model/layout/dashboardGeometry'

const metrics = createMetrics(430, 4, { rowHeight: 50, gap: 10 })
const item = (cell: Omit<DashboardLayoutItem, 'id'>): DashboardLayoutItem => ({ id: 'a', ...cell })

describe('dashboardGeometry: размеры', () => {
	it('createMetrics считает ширину колонки с промежутками', () => {
		expect(metrics).toEqual({ cols: 4, colWidth: 100, rowHeight: 50, gap: 10 })
		expect(createMetrics(0, 4, { rowHeight: 50, gap: 10 }).colWidth).toBe(0)
	})

	it('itemRect переводит клетки в px', () => {
		expect(itemRect(item({ x: 1, y: 2, w: 2, h: 3 }), metrics)).toEqual({ left: 110, top: 120, width: 210, height: 170 })
	})

	it('cellAt и sizeAt округляют до клетки', () => {
		expect(cellAt({ left: 160, top: 70 }, metrics)).toEqual({ x: 1, y: 1 })
		expect(sizeAt({ width: 210, height: 170 }, metrics)).toEqual({ w: 2, h: 3 })
	})

	it('нулевой шаг не делит на ноль', () => {
		const zero = createMetrics(0, 1, { rowHeight: 0, gap: 0 })
		expect(cellAt({ left: 5, top: 5 }, zero)).toEqual({ x: 5, y: 5 })
		expect(sizeAt({ width: 3, height: 3 }, zero)).toEqual({ w: 3, h: 3 })
	})

	it('gridHeight: нижний край без последнего промежутка, пустая — 0', () => {
		expect(gridHeight([item({ x: 0, y: 0, w: 1, h: 2 }), item({ x: 1, y: 2, w: 1, h: 1 })], metrics)).toBe(3 * 60 - 10)
		expect(gridHeight([], metrics)).toBe(0)
	})
})

describe('dashboardGeometry: брейкпоинты и колонки', () => {
	const points = resolveBreakpoints({ md: 500 })

	it('resolveBreakpoints дополняет умолчаниями', () => {
		expect(points).toEqual({ sm: 0, md: 500, lg: 1024 })
		expect(resolveBreakpoints()).toEqual({ sm: 0, md: 640, lg: 1024 })
	})

	it('breakpointFor выбирает по ширине; без ширины — lg', () => {
		expect(breakpointFor(0, points)).toBe('lg')
		expect(breakpointFor(1024, points)).toBe('lg')
		expect(breakpointFor(600, points)).toBe('md')
		expect(breakpointFor(499, points)).toBe('sm')
	})

	it('colsFor: число, по брейкпоинтам, запасные значения', () => {
		expect(colsFor(6, 'sm')).toBe(6)
		expect(colsFor({ sm: 2, lg: 8 }, 'sm')).toBe(2)
		expect(colsFor({ lg: 8 }, 'md')).toBe(8)
		expect(colsFor({}, 'md')).toBe(12)
		expect(colsFor(0, 'md')).toBe(12)
		expect(colsFor(Number.NaN, 'md')).toBe(12)
		expect(colsFor(2.4, 'md')).toBe(2)
	})

	it('pickLayout берёт свою раскладку, потом ближайшую шире', () => {
		const lg = [item({ x: 0, y: 0, w: 1, h: 1 })]
		const md = [item({ x: 1, y: 0, w: 1, h: 1 })]
		expect(pickLayout({ lg, md }, 'md')).toBe(md)
		expect(pickLayout({ lg }, 'sm')).toBe(lg)
		expect(pickLayout({ md }, 'lg')).toBe(md)
		expect(pickLayout({ sm: [] }, 'md')).toEqual([])
		expect(pickLayout({}, 'lg')).toBeUndefined()
	})
})

describe('dashboardGeometry: draggedRect', () => {
	const drag = (mode: 'move' | 'resize'): DashboardPointerDrag => ({
		id: 'a',
		mode,
		pointerId: 1,
		startX: 0,
		startY: 0,
		origin: item({ x: 1, y: 1, w: 2, h: 2 }),
		base: [],
	})

	it('move смещает и не выпускает за левый, правый и верхний края', () => {
		expect(draggedRect(drag('move'), { dx: 30, dy: 5 }, metrics)).toMatchObject({ left: 140, top: 65 })
		expect(draggedRect(drag('move'), { dx: -999, dy: -999 }, metrics)).toMatchObject({ left: 0, top: 0 })
		expect(draggedRect(drag('move'), { dx: 999, dy: 0 }, metrics)).toMatchObject({ left: 430 - 210 })
	})

	it('resize меняет размер, но не меньше одной клетки', () => {
		expect(draggedRect(drag('resize'), { dx: 100, dy: 10 }, metrics)).toMatchObject({ left: 110, top: 60, width: 310, height: 120 })
		expect(draggedRect(drag('resize'), { dx: -999, dy: -999 }, metrics)).toMatchObject({ width: 100, height: 50 })
	})
})
