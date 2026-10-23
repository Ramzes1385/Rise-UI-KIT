import { centerOf, pickInDirection } from '../../model/interaction/spatial'

const FROM = { id: 'a', x: 100, y: 100 }
const CANDIDATES = [
	FROM,
	{ id: 'right', x: 200, y: 110 },
	{ id: 'right-far', x: 400, y: 100 },
	{ id: 'right-off', x: 150, y: 200 },
	{ id: 'left', x: 20, y: 100 },
	{ id: 'up', x: 100, y: 10 },
	{ id: 'down', x: 110, y: 300 },
]

describe('spatial', () => {
	it('выбирает ближайший объект в направлении с весом поперечного смещения', () => {
		expect(pickInDirection(FROM, CANDIDATES, 'right')).toBe('right')
		expect(pickInDirection(FROM, CANDIDATES, 'left')).toBe('left')
		expect(pickInDirection(FROM, CANDIDATES, 'up')).toBe('up')
		expect(pickInDirection(FROM, CANDIDATES, 'down')).toBe('right-off')
	})

	it('без объектов в направлении возвращает undefined', () => {
		expect(pickInDirection(FROM, [FROM, { id: 'b', x: 100.5, y: 300 }], 'right')).toBeUndefined()
	})

	it('centerOf считает центр прямоугольника элемента', () => {
		const element = document.createElement('div')
		element.getBoundingClientRect = () => ({ left: 10, top: 20, width: 30, height: 40 }) as DOMRect
		expect(centerOf('x', element)).toEqual({ id: 'x', x: 25, y: 40 })
	})
})
