import { finderPath, isFinderModule, modulePath, roundedSquare } from '../../model/draw/qrShapes'

function withCells(cells: readonly (readonly [number, number])[]): boolean[][] {
	const modules = Array.from({ length: 21 }, () => Array<boolean>(21).fill(false))
	cells.forEach(([x, y]) => {
		modules[y][x] = true
	})
	return modules
}

const FINDER_CELL = [0, 0] as const

describe('формы QR-кода', () => {
	it('«глазки» — квадраты 7×7 в трёх углах, правый нижний угол свободен', () => {
		expect([isFinderModule(21, 0, 0), isFinderModule(21, 6, 6), isFinderModule(21, 14, 6), isFinderModule(21, 0, 14)]).toEqual([
			true,
			true,
			true,
			true,
		])
		expect([isFinderModule(21, 7, 0), isFinderModule(21, 13, 0), isFinderModule(21, 14, 14), isFinderModule(21, 7, 14)]).toEqual([
			false,
			false,
			false,
			false,
		])
	})

	it('квадрат: без радиусов — прямые стороны, со своим радиусом у каждого угла — дуги', () => {
		expect(roundedSquare([0, 0], 7, [0, 0, 0, 0])).toBe('M0 0h7v7h-7v-7z')
		expect(roundedSquare([1, 2], 1, [0.5, 0, 0, 0.5])).toBe('M1.5 2h0.5v1h-0.5a0.5 0.5 0 0 1 -0.5 -0.5v0a0.5 0.5 0 0 1 0.5 -0.5z')
	})

	it('«глазки»: кольцо, просвет и центр в трёх углах со сдвигом на поле', () => {
		const square = finderPath(21, 4, 'square')
		expect(square).toBe(
			[
				'M4 4h7v7h-7v-7zM5 5h5v5h-5v-5zM6 6h3v3h-3v-3z',
				'M18 4h7v7h-7v-7zM19 5h5v5h-5v-5zM20 6h3v3h-3v-3z',
				'M4 18h7v7h-7v-7zM5 19h5v5h-5v-5zM6 20h3v3h-3v-3z',
			].join(''),
		)
		expect(finderPath(21, 0, 'rounded')).toMatch(
			/^M2 0h3a2 2 0 0 1 2 2v3a2 2 0 0 1 -2 2h-3a2 2 0 0 1 -2 -2v-3a2 2 0 0 1 2 -2zM2 1h3a1 1/,
		)
		expect(finderPath(21, 0, 'circle')).toMatch(
			/^M0 3\.5a3\.5 3\.5 0 1 0 7 0a3\.5 3\.5 0 1 0 -7 0zM1 3\.5a2\.5 2\.5 0 1 0 5 0a2\.5 2\.5 0 1 0 -5 0zM2 3\.5a1\.5/,
		)
		expect(finderPath(21, 0, 'circle').match(/z/g)).toHaveLength(9)
	})

	it('квадратные модули: серии по строкам со сдвигом на поле, без «глазков» и выреза под логотип', () => {
		const modules = withCells([FINDER_CELL, [8, 8], [9, 8], [11, 8], [10, 10], [8, 12]])
		const area = { start: 9, side: 3, image: 2 }
		expect(modulePath(modules, { margin: 1, shape: 'square', area: null })).toBe('M9 9h2v1h-2zM12 9h1v1h-1zM11 11h1v1h-1zM9 13h1v1h-1z')
		expect(modulePath(modules, { margin: 0, shape: 'square', area })).toBe('M8 8h2v1h-2zM11 8h1v1h-1zM8 12h1v1h-1z')
	})

	it('точки: круг радиусом 0.45 модуля в центре каждого модуля', () => {
		expect(modulePath(withCells([[8, 8]]), { margin: 0, shape: 'dots', area: null })).toBe(
			'M8.05 8.5a0.45 0.45 0 1 0 0.9 0a0.45 0.45 0 1 0 -0.9 0z',
		)
	})

	it('скругления: угол скруглён, только если обе соседние стороны свободны', () => {
		expect(
			modulePath(
				withCells([
					[8, 8],
					[9, 8],
				]),
				{ margin: 0, shape: 'rounded', area: null },
			),
		).toBe(
			[
				'M8.5 8h0.5v1h-0.5a0.5 0.5 0 0 1 -0.5 -0.5v0a0.5 0.5 0 0 1 0.5 -0.5z',
				'M9 8h0.5a0.5 0.5 0 0 1 0.5 0.5v0a0.5 0.5 0 0 1 -0.5 0.5h-0.5v-1z',
			].join(''),
		)
		expect(modulePath(withCells([[8, 8]]), { margin: 2, shape: 'rounded', area: null })).toBe(
			'M10.5 10h0a0.5 0.5 0 0 1 0.5 0.5v0a0.5 0.5 0 0 1 -0.5 0.5h0a0.5 0.5 0 0 1 -0.5 -0.5v0a0.5 0.5 0 0 1 0.5 -0.5z',
		)
	})
})
