import { columnVars, responsiveVars, toGridColumn } from '../model/gridResponsive'

describe('responsiveVars', () => {
	it('undefined даёт пустой объект', () => {
		expect(responsiveVars('p', undefined)).toEqual({})
	})

	it('число пишется в шаг base', () => {
		expect(responsiveVars('p', 12)).toEqual({ '--p-base': 12 })
	})

	it('объект раскладывается по шагам в порядке base, sm, md, lg, xl', () => {
		expect(Object.entries(responsiveVars('p', { xl: 4, base: 1, md: 2 }))).toEqual([
			['--p-base', 1],
			['--p-md', 2],
			['--p-xl', 4],
		])
	})

	it('ноль не считается пропуском', () => {
		expect(responsiveVars('p', { sm: 0 })).toEqual({ '--p-sm': 0 })
	})
})

describe('toGridColumn', () => {
	it('число без отступа даёт span', () => {
		expect(toGridColumn(4, 0)).toBe('span 4')
	})

	it('full без отступа занимает всю строку', () => {
		expect(toGridColumn('full', 0)).toBe('1 / -1')
	})

	it('отступ сдвигает начало колонки', () => {
		expect(toGridColumn(4, 2)).toBe('3 / span 4')
	})

	it('full с отступом идёт до последней линии', () => {
		expect(toGridColumn('full', 2)).toBe('3 / -1')
	})
})

describe('columnVars', () => {
	it('без span и offset переменных нет', () => {
		expect(columnVars(undefined, undefined)).toEqual({})
	})

	it('число span пишется в base', () => {
		expect(columnVars(6, undefined)).toEqual({ '--base-grid-item-column-base': 'span 6' })
	})

	it('только offset берёт span 1', () => {
		expect(columnVars(undefined, 3)).toEqual({ '--base-grid-item-column-base': '4 / span 1' })
	})

	it('шаги без значений пропускаются', () => {
		expect(columnVars({ base: 12, lg: 4 }, undefined)).toEqual({
			'--base-grid-item-column-base': 'span 12',
			'--base-grid-item-column-lg': 'span 4',
		})
	})

	it('full на шаге', () => {
		expect(columnVars({ base: 'full' }, undefined)).toEqual({ '--base-grid-item-column-base': '1 / -1' })
	})

	it('смена offset на другом шаге наследует предыдущий span', () => {
		expect(columnVars({ base: 6 }, { md: 2 })).toEqual({
			'--base-grid-item-column-base': 'span 6',
			'--base-grid-item-column-md': '3 / span 6',
		})
	})

	it('смена span на другом шаге наследует предыдущий offset', () => {
		expect(columnVars({ md: 3 }, { base: 1 })).toEqual({
			'--base-grid-item-column-base': '2 / span 1',
			'--base-grid-item-column-md': '2 / span 3',
		})
	})

	it('offset 0 на шаге сбрасывает унаследованный отступ', () => {
		expect(columnVars(4, { base: 2, lg: 0 })).toEqual({
			'--base-grid-item-column-base': '3 / span 4',
			'--base-grid-item-column-lg': 'span 4',
		})
	})
})
