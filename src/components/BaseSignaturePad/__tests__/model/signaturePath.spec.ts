import { appendPoints, signaturePath, signatureSvg, strokePath, toViewBox } from '../../model/signature/signaturePath'

const OPTIONS = { width: 400, height: 160, color: '#000000', lineWidth: 2.5 }

describe('путь подписи', () => {
	it('штрих из одной точки — точка, из двух — отрезок, из трёх и больше — кривые через середины', () => {
		expect(strokePath([])).toBe('')
		expect(strokePath([{ x: 10, y: 20 }])).toBe('M10 20h0.1')
		expect(
			strokePath([
				{ x: 10, y: 20 },
				{ x: 30.04, y: 40 },
			]),
		).toBe('M10 20L30 40')
		expect(
			strokePath([
				{ x: 0, y: 0 },
				{ x: 10, y: 10 },
				{ x: 20, y: 0 },
				{ x: 30, y: 10 },
			]),
		).toBe('M0 0Q10 10 15 5Q20 0 25 5L30 10')
	})

	it('штрихи склеиваются в один путь', () => {
		expect(
			signaturePath([
				[{ x: 1, y: 2 }],
				[
					{ x: 3, y: 4 },
					{ x: 5, y: 6 },
				],
			]),
		).toBe('M1 2h0.1M3 4L5 6')
	})

	it('новые точки ближе 1 единицы к последней пропускаются, координаты округляются до десятых', () => {
		const stroke = appendPoints(
			[{ x: 0, y: 0 }],
			[
				{ x: 0.5, y: 0.5 },
				{ x: 2.04, y: 0 },
				{ x: 2.5, y: 0.2 },
				{ x: 5.26, y: 1 },
			],
		)
		expect(stroke).toEqual([
			{ x: 0, y: 0 },
			{ x: 2, y: 0 },
			{ x: 5.3, y: 1 },
		])
		expect(appendPoints([], [{ x: 1, y: 1 }])).toEqual([{ x: 1, y: 1 }])
	})

	it('координаты указателя переводятся в единицы поля и не выходят за его края', () => {
		const rect = { left: 100, top: 50, width: 200, height: 80 }
		expect(toViewBox({ clientX: 200, clientY: 90 }, rect, { width: 400, height: 160 })).toEqual({ x: 200, y: 80 })
		expect(toViewBox({ clientX: 50, clientY: 500 }, rect, { width: 400, height: 160 })).toEqual({ x: 0, y: 160 })
		expect(toViewBox({ clientX: 30, clientY: 40 }, { left: 0, top: 0, width: 0, height: 0 }, { width: 400, height: 160 })).toEqual({
			x: 30,
			y: 40,
		})
	})

	it('SVG: размер поля, путь, цвет, толщина и необязательный фон; без штрихов — пустая строка', () => {
		const svg = signatureSvg([[{ x: 1, y: 2 }]], { ...OPTIONS, background: '#ffffff' })
		expect(svg).toBe(
			'<svg xmlns="http://www.w3.org/2000/svg" width="400" height="160" viewBox="0 0 400 160">' +
				'<rect width="400" height="160" fill="#ffffff"/>' +
				'<path d="M1 2h0.1" fill="none" stroke="#000000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
		)
		expect(signatureSvg([[{ x: 1, y: 2 }]], OPTIONS)).not.toContain('<rect')
		expect(signatureSvg([], OPTIONS)).toBe('')
	})
})
