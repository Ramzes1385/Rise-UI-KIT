import { firstSpot, lastSpot, nextSpot } from '../../input/spatialNav'

const spot = (id: string, x: number, y: number) => ({ id, x, y })
const GRID = [spot('a', 0, 0), spot('b', 10, 0), spot('c', 0, 10), spot('d', 10, 10)]

describe('порядок чтения', () => {
	it('первый — сверху слева, последний — снизу справа; пусто — null', () => {
		expect(firstSpot([GRID[3], GRID[1], GRID[2], GRID[0]])?.id).toBe('a')
		expect(lastSpot([GRID[0], GRID[3], GRID[1], GRID[2]])?.id).toBe('d')
		expect(firstSpot([spot('r', 5, 0), spot('l', 1, 0)])?.id).toBe('l')
		expect(firstSpot([])).toBeNull()
		expect(lastSpot([])).toBeNull()
	})

	it('исходный массив не меняется', () => {
		const spots = [GRID[3], GRID[0]]
		firstSpot(spots)
		lastSpot(spots)
		expect(spots.map(item => item.id)).toEqual(['d', 'a'])
	})
})

describe('nextSpot', () => {
	it('стрелки ведут к соседу в своём направлении', () => {
		expect(nextSpot(GRID, 'a', 'right')?.id).toBe('b')
		expect(nextSpot(GRID, 'a', 'down')?.id).toBe('c')
		expect(nextSpot(GRID, 'd', 'left')?.id).toBe('c')
		expect(nextSpot(GRID, 'd', 'up')?.id).toBe('b')
	})

	it('впереди никого — null (фокус остаётся)', () => {
		expect(nextSpot(GRID, 'a', 'left')).toBeNull()
		expect(nextSpot(GRID, 'a', 'up')).toBeNull()
		expect(nextSpot(GRID, 'd', 'right')).toBeNull()
		expect(nextSpot(GRID, 'd', 'down')).toBeNull()
		expect(nextSpot([spot('only', 0, 0)], 'only', 'right')).toBeNull()
	})

	it('нет текущего или он неизвестен — первый в порядке чтения', () => {
		expect(nextSpot(GRID, null, 'right')?.id).toBe('a')
		expect(nextSpot(GRID, 'нет', 'down')?.id).toBe('a')
		expect(nextSpot([], null, 'down')).toBeNull()
	})

	it('вбок штрафуется вдвое: ближе по оси побеждает дальнего на оси при малом уходе', () => {
		const spots = [spot('from', 0, 0), spot('straight', 10, 0), spot('aside', 6, 1), spot('far', 6, 5)]
		expect(nextSpot(spots, 'from', 'right')?.id).toBe('aside')
		expect(nextSpot([spots[0], spots[1], spots[3]], 'from', 'right')?.id).toBe('straight')
	})
})
