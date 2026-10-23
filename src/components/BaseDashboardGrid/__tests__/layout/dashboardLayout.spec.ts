import type { DashboardLayoutItem } from '../../types/BaseDashboardGrid.types'
import {
	clampItem,
	collides,
	collisionsOf,
	layoutBottom,
	layoutsEqual,
	moveItem,
	normalizeLayout,
	placeAll,
	resizeItem,
	resolveCollisions,
	sortLayout,
} from '../../model/layout/dashboardLayout'

const item = (id: string, at: [number, number], extra: Partial<DashboardLayoutItem> = {}): DashboardLayoutItem => ({
	id,
	x: at[0],
	y: at[1],
	w: 2,
	h: 2,
	...extra,
})

const cell = (layout: DashboardLayoutItem[], id: string): [number, number] => {
	const found = layout.find(other => other.id === id) as DashboardLayoutItem
	return [found.x, found.y]
}

const vertical = { cols: 4, compactType: 'vertical' } as const
const free = { cols: 4, compactType: 'none' } as const

describe('dashboardLayout: пересечения и порядок', () => {
	it('collides: пересечение, соседство и тот же id', () => {
		expect(collides(item('a', [0, 0]), item('b', [1, 1]))).toBe(true)
		expect(collides(item('a', [0, 0]), item('b', [2, 0]))).toBe(false)
		expect(collides(item('a', [0, 0]), item('b', [0, 2]))).toBe(false)
		expect(collides(item('a', [0, 0]), item('a', [1, 1]))).toBe(false)
	})

	it('collisionsOf, layoutBottom и sortLayout', () => {
		const layout = [item('a', [2, 4]), item('b', [0, 0]), item('c', [1, 0])]
		expect(collisionsOf(layout, item('x', [0, 0])).map(other => other.id)).toEqual(['b', 'c'])
		expect(layoutBottom(layout)).toBe(6)
		expect(layoutBottom([])).toBe(0)
		expect(sortLayout(layout).map(other => other.id)).toEqual(['b', 'c', 'a'])
		expect(layout[0].id).toBe('a')
	})

	it('layoutsEqual сравнивает клетки и размеры', () => {
		expect(layoutsEqual([item('a', [0, 0])], [item('a', [0, 0])])).toBe(true)
		expect(layoutsEqual([item('a', [0, 0])], [item('a', [0, 1])])).toBe(false)
		expect(layoutsEqual([item('a', [0, 0])], [])).toBe(false)
	})
})

describe('dashboardLayout: clampItem', () => {
	it('ограничивает размер колонками и пределами', () => {
		expect(clampItem(item('a', [0, 0], { w: 10, h: 1 }), 4).w).toBe(4)
		expect(clampItem(item('a', [0, 0], { w: 1, h: 1, minW: 2 }), 4).w).toBe(2)
		expect(clampItem(item('a', [0, 0], { w: 4, h: 1, maxW: 3 }), 4).w).toBe(3)
		expect(clampItem(item('a', [0, 0], { w: 1, h: 1, minH: 2 }), 4).h).toBe(2)
		expect(clampItem(item('a', [0, 0], { w: 1, h: 9, maxH: 3 }), 4).h).toBe(3)
		expect(clampItem(item('a', [0, 0], { w: 1, h: 9 }), 4).h).toBe(9)
	})

	it('пределы шире сетки и maxW меньше minW приводятся к допустимым', () => {
		expect(clampItem(item('a', [0, 0], { w: 1, h: 1, minW: 9 }), 4).w).toBe(4)
		expect(clampItem(item('a', [0, 0], { w: 1, h: 1, minW: 3, maxW: 1 }), 4).w).toBe(3)
		expect(clampItem(item('a', [0, 0], { w: 1, h: 1, minH: 3, maxH: 1 }), 4).h).toBe(3)
	})

	it('удерживает клетку внутри сетки и округляет', () => {
		expect(clampItem(item('a', [-3, -1]), 4)).toMatchObject({ x: 0, y: 0 })
		expect(clampItem(item('a', [9, 0]), 4).x).toBe(2)
		expect(clampItem(item('a', [1.6, 0.4], { w: 1.4, h: 1.6 }), 4)).toMatchObject({ x: 2, y: 0, w: 1, h: 2 })
	})

	it('нечисловые значения заменяются безопасными', () => {
		const broken = item('a', [Number.NaN, Number.NaN], { w: Number.NaN, h: Number.NaN, minW: 2, minH: 3 })
		expect(clampItem(broken, 4)).toMatchObject({ x: 0, y: 0, w: 2, h: 3 })
	})
})

describe('dashboardLayout: placeAll', () => {
	it('vertical поднимает виджеты вверх до упора', () => {
		const layout = placeAll([item('a', [0, 0]), item('b', [0, 5])], 'vertical')
		expect(cell(layout, 'b')).toEqual([0, 2])
	})

	it('vertical не поднимает выше соседа', () => {
		const layout = placeAll([item('a', [0, 0]), item('b', [0, 2]), item('c', [2, 7])], 'vertical')
		expect(cell(layout, 'b')).toEqual([0, 2])
		expect(cell(layout, 'c')).toEqual([2, 0])
	})

	it('закреплённые виджеты остаются на месте, остальные их обходят', () => {
		const layout = placeAll([item('s', [0, 2], { w: 2, h: 2, isStatic: true }), item('a', [0, 0]), item('b', [0, 3])], 'vertical')
		expect(cell(layout, 's')).toEqual([0, 2])
		expect(cell(layout, 'a')).toEqual([0, 0])
		expect(cell(layout, 'b')).toEqual([0, 4])
	})

	it('none оставляет промежутки, но разводит пересечения', () => {
		const layout = placeAll([item('a', [0, 0]), item('b', [0, 1]), item('c', [2, 6])], 'none')
		expect(cell(layout, 'b')).toEqual([0, 2])
		expect(cell(layout, 'c')).toEqual([2, 6])
	})

	it('сохраняет исходный порядок элементов', () => {
		const layout = placeAll([item('b', [0, 4]), item('a', [0, 0])], 'vertical')
		expect(layout.map(other => other.id)).toEqual(['b', 'a'])
	})
})

describe('dashboardLayout: resolveCollisions', () => {
	it('сдвигает задетые виджеты вниз цепочкой', () => {
		const layout = [item('a', [0, 1]), item('b', [0, 2]), item('c', [0, 4])]
		const next = resolveCollisions(layout, 'a', false)
		expect(cell(next, 'b')).toEqual([0, 3])
		expect(cell(next, 'c')).toEqual([0, 5])
		expect(layout[1].y).toBe(2)
	})

	it('preferUp переносит задетый виджет выше, если там свободно', () => {
		const next = resolveCollisions([item('a', [0, 2]), item('b', [0, 2])], 'a', true)
		expect(cell(next, 'b')).toEqual([0, 0])
	})

	it('preferUp сдвигает вниз, если выше занято', () => {
		const next = resolveCollisions([item('a', [0, 1]), item('b', [0, 2])], 'a', true)
		expect(cell(next, 'b')).toEqual([0, 3])
	})

	it('виджет, наехавший на закреплённый, оказывается под ним', () => {
		const next = resolveCollisions([item('a', [0, 1]), item('s', [0, 2], { w: 2, h: 2, isStatic: true })], 'a', false)
		expect(cell(next, 'a')).toEqual([0, 4])
		expect(cell(next, 's')).toEqual([0, 2])
	})

	it('сдвинутый виджет, упёршийся в закреплённый, обходит его', () => {
		const layout = [item('a', [0, 0]), item('b', [0, 1]), item('s', [0, 2], { w: 2, h: 2, isStatic: true })]
		const next = resolveCollisions(layout, 'a', false)
		expect(cell(next, 'b')).toEqual([0, 4])
	})
})

describe('dashboardLayout: normalizeLayout', () => {
	afterEach(() => vi.restoreAllMocks())

	it('ограничивает, разводит и уплотняет', () => {
		const layout = normalizeLayout([item('a', [0, 0], { w: 9, h: 1 }), item('b', [1, 0], { w: 2, h: 1 })], vertical)
		expect(layout[0].w).toBe(4)
		expect(cell(layout, 'b')).toEqual([1, 1])
	})

	it('повторяющийся id пропускается с предупреждением', () => {
		const spy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const layout = normalizeLayout([item('a', [0, 0]), item('a', [2, 0])], free)
		expect(layout).toHaveLength(1)
		expect(spy).toHaveBeenCalledOnce()
		expect(spy.mock.calls[0][0]).toContain('«a»')
	})

	it('пустая раскладка остаётся пустой', () => {
		expect(normalizeLayout([], vertical)).toEqual([])
	})
})

describe('dashboardLayout: moveItem', () => {
	const base = [item('a', [0, 0]), item('b', [0, 2])]

	it('неизвестный и закреплённый виджеты не двигаются', () => {
		expect(moveItem(base, { id: 'x', x: 1, y: 1 }, vertical)).toBe(base)
		const pinned = [item('s', [0, 0], { w: 2, h: 2, isStatic: true })]
		expect(moveItem(pinned, { id: 's', x: 1, y: 1 }, vertical)).toBe(pinned)
	})

	it('вниз на соседа меняет их местами', () => {
		const next = moveItem(base, { id: 'a', x: 0, y: 2 }, vertical)
		expect(cell(next, 'a')).toEqual([0, 2])
		expect(cell(next, 'b')).toEqual([0, 0])
	})

	it('вверх на соседа сдвигает его вниз', () => {
		const next = moveItem(base, { id: 'b', x: 0, y: 0 }, vertical)
		expect(cell(next, 'b')).toEqual([0, 0])
		expect(cell(next, 'a')).toEqual([0, 2])
	})

	it('удерживает виджет в сетке', () => {
		expect(cell(moveItem(base, { id: 'a', x: 9, y: 0 }, vertical), 'a')[0]).toBe(2)
	})

	it('при none виджет остаётся там, куда его положили', () => {
		expect(cell(moveItem([item('a', [0, 0])], { id: 'a', x: 1, y: 5 }, free), 'a')).toEqual([1, 5])
	})

	it('vertical поднимает одиночный виджет к верху', () => {
		expect(cell(moveItem([item('a', [0, 0])], { id: 'a', x: 1, y: 5 }, vertical), 'a')).toEqual([1, 0])
	})
})

describe('dashboardLayout: resizeItem', () => {
	const base = [item('a', [0, 0]), item('b', [2, 0])]

	it('неизвестный и закреплённый виджеты не меняют размер', () => {
		expect(resizeItem(base, { id: 'x', w: 3, h: 3 }, vertical)).toBe(base)
		const pinned = [item('s', [0, 0], { w: 2, h: 2, isStatic: true })]
		expect(resizeItem(pinned, { id: 's', w: 3, h: 3 }, vertical)).toBe(pinned)
	})

	it('расширение сдвигает соседа вниз', () => {
		const next = resizeItem(base, { id: 'a', w: 3, h: 2 }, vertical)
		expect(next[0].w).toBe(3)
		expect(cell(next, 'b')).toEqual([2, 2])
	})

	it('ширина ограничена краем сетки, высота — пределом minH', () => {
		const next = resizeItem([item('a', [2, 0], { w: 1, h: 1, minH: 2 })], { id: 'a', w: 9, h: 1 }, vertical)
		expect(next[0]).toMatchObject({ x: 2, w: 2, h: 2 })
	})
})
