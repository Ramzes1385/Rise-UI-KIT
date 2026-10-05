import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import BaseChart from '../ui/BaseChart.vue'
import { setLocale } from '@/locales/state'
import { createUiKitPlugin } from '@/plugin'
import type { ChartSeries } from '../types/BaseChart.types'
import { render, screen, within } from '@testing-library/vue'

const labels = ['Янв', 'Фев', 'Мар']
const series: ChartSeries[] = [
	{ name: 'Выручка', values: [120, 240, 180] },
	{ name: 'Расходы', values: [90, null, 60] },
]
const props = { label: 'Финансы', labels, series }
const many = Array.from({ length: 12 }, (_, index) => `т${index}`)
const manyProps = { label: 'Ряд', labels: many, series: [{ name: 'Ряд', values: many.map((_, index) => index) }] }

const yTicks = (container: Element) => [...container.querySelectorAll('.base-chart__y-tick')].map(tick => tick.textContent)
const xTicks = (container: Element) => [...container.querySelectorAll('.base-chart__x-tick')].map(tick => tick.textContent?.trim())

describe('BaseChart unit', () => {
	beforeEach(() => {
		vi.stubGlobal(
			'matchMedia',
			vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
		)
	})

	afterEach(() => {
		vi.unstubAllGlobals()
	})

	it('рендерит область графика со сводкой и подсказкой про стрелки', () => {
		render(BaseChart, { props })
		const plot = screen.getByRole('img', { name: 'Финансы: Выручка, Расходы; значения от 60 до 240' })
		expect(plot).toHaveAttribute('tabindex', '0')
		expect(plot).toHaveAccessibleDescription(/Стрелки влево и вправо/)
		expect(plot).toHaveAccessibleDescription(/Home и End.*PageUp и PageDown.*Escape/)
	})

	it('пишет --size-scale только при масштабе, отличном от 100', () => {
		const { container } = render(BaseChart, { props: { ...props, sizeScale: 125 } })
		expect((container.querySelector('.base-chart') as HTMLElement).style.getPropertyValue('--size-scale')).toBe('1.25')
	})

	it('добавляет customClass к корню, области и легенде', () => {
		const { container } = render(BaseChart, {
			props: { ...props, customClass: { root: 'my-root', plot: 'my-plot', legend: 'my-legend' } },
		})
		expect(container.querySelector('.base-chart')).toHaveClass('my-root', 'base-chart--line')
		expect(screen.getByRole('img')).toHaveClass('my-plot')
		expect(screen.getByRole('list', { name: 'Ряды графика' })).toHaveClass('my-legend')
	})

	describe('оси', () => {
		it('подписывает Y «круглыми» делениями и X — подписями категорий', () => {
			const { container } = render(BaseChart, { props })
			expect(yTicks(container)).toEqual(['50', '100', '150', '200', '250'])
			expect(xTicks(container)).toEqual(labels)
		})

		it('у столбиков включает в шкалу ноль', () => {
			const { container } = render(BaseChart, { props: { ...props, variant: 'bar' } })
			expect(yTicks(container)).toEqual(['0', '50', '100', '150', '200', '250'])
		})

		it('показывает отрицательные значения ниже нуля', () => {
			const { container } = render(BaseChart, {
				props: { label: 'Баланс', labels: ['a', 'b'], series: [{ name: 'Баланс', values: [-3, 7.3] }], variant: 'area' },
			})
			expect(yTicks(container).map(text => text?.replace('−', '-'))).toEqual(['-4', '-2', '0', '2', '4', '6', '8'])
		})

		it('слушает yTickCount', () => {
			const { container } = render(BaseChart, { props: { ...props, variant: 'bar', yTickCount: 2 } })
			expect(yTicks(container)).toEqual(['0', '100', '200', '300'])
		})

		it('форматирует даты по языку кита и labelFormat', async () => {
			const dates = [new Date(2026, 0, 5), new Date(2026, 1, 5)]
			const { container, rerender } = render(BaseChart, {
				props: { label: 'Визиты', labels: dates, series: [{ name: 'Визиты', values: [1, 2] }] },
			})
			expect(xTicks(container)).toEqual(['5 янв.', '5 февр.'])
			await rerender({ labelFormat: { month: 'long' } })
			expect(xTicks(container)).toEqual(['январь', 'февраль'])
		})

		it('форматирует числа подписей и значения через valueFormat', () => {
			const { container } = render(BaseChart, {
				props: {
					label: 'Цена',
					labels: [12000, 15000],
					series: [{ name: 'Цена', values: [1000, 2000] }],
					valueFormat: { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 },
				},
			})
			expect(xTicks(container)).toEqual(['12 000', '15 000'])
			expect(yTicks(container)[0]).toMatch(/^1\s000\s₽$/)
		})

		it('formatValue и formatLabel важнее Intl-опций', () => {
			const { container } = render(BaseChart, {
				props: {
					...props,
					valueFormat: { style: 'percent' },
					formatValue: (value: number) => `${value} шт.`,
					formatLabel: (label: unknown) => `[${String(label)}]`,
				},
			})
			expect(yTicks(container)[0]).toBe('50 шт.')
			expect(xTicks(container)).toEqual(['[Янв]', '[Фев]', '[Мар]'])
		})

		it('прореживает подписи X по ширине из ResizeObserver и отключает наблюдение при размонтировании', async () => {
			const original = globalThis.ResizeObserver
			const disconnect = vi.fn()
			let notify: (entries: { contentRect: { width: number } }[]) => void = () => undefined
			globalThis.ResizeObserver = class {
				constructor(callback: typeof notify) {
					notify = callback
				}
				observe() {}
				disconnect = disconnect
			} as unknown as typeof ResizeObserver
			try {
				const { container, unmount } = render(BaseChart, { props: manyProps })
				expect(xTicks(container)).toHaveLength(6)
				notify([{ contentRect: { width: 400 } }])
				await nextTick()
				expect(xTicks(container)).toEqual(['т0', 'т3', 'т6', 'т9'])
				notify([{ contentRect: { width: 100 } }])
				await nextTick()
				expect(xTicks(container)).toEqual(['т0', 'т6'])
				notify([])
				await nextTick()
				expect(xTicks(container)).toHaveLength(6)
				unmount()
				expect(disconnect).toHaveBeenCalled()
			} finally {
				globalThis.ResizeObserver = original
			}
		})

		it('без ResizeObserver показывает до 6 подписей', () => {
			const original = globalThis.ResizeObserver
			Reflect.deleteProperty(globalThis, 'ResizeObserver')
			try {
				const { container, unmount } = render(BaseChart, { props: manyProps })
				expect(xTicks(container)).toHaveLength(6)
				unmount()
			} finally {
				globalThis.ResizeObserver = original
			}
		})

		it('крайние подписи X у линии прижаты к краям классами --start и --end', () => {
			const { container } = render(BaseChart, { props })
			const ticks = [...container.querySelectorAll('.base-chart__x-tick')]
			expect(ticks[0]).toHaveClass('base-chart__x-tick--start')
			expect(ticks[0]).not.toHaveClass('base-chart__x-tick--end')
			expect(ticks[1].className).toBe('base-chart__x-tick')
			expect(ticks[2]).toHaveClass('base-chart__x-tick--end')
		})

		it('у столбиков и у одной точки подписи по центру полос, без --start и --end', async () => {
			const { container, rerender } = render(BaseChart, { props: { ...props, variant: 'bar' } })
			const edges = () => container.querySelectorAll('.base-chart__x-tick--start, .base-chart__x-tick--end')
			expect(container.querySelectorAll('.base-chart__x-tick')).toHaveLength(3)
			expect(edges()).toHaveLength(0)
			await rerender({ variant: 'line', labels: ['a'], series: [{ name: 'Один', values: [5] }] })
			expect(container.querySelectorAll('.base-chart__x-tick')).toHaveLength(1)
			expect(edges()).toHaveLength(0)
		})
	})

	describe('NaN и Infinity', () => {
		const broken = { label: 'Р', labels: ['a', 'b', 'c'], series: [{ name: 'Р', values: [1, Number.NaN, Number.POSITIVE_INFINITY] }] }

		it('считаются «нет значения» в таблице и не попадают в сводку', () => {
			render(BaseChart, { props: broken })
			expect(screen.getByRole('img', { name: 'Р: Р; значения от 1 до 1' })).toBeInTheDocument()
			const rows = within(screen.getByRole('table')).getAllByRole('row')
			expect(rows[2]).toHaveTextContent('bнет значения')
			expect(rows[3]).toHaveTextContent('cнет значения')
		})

		it('-Infinity в столбиках не рисует столбик и не ломает шкалу', () => {
			const { container } = render(BaseChart, {
				props: { ...broken, variant: 'bar', series: [{ name: 'Р', values: [2, Number.NEGATIVE_INFINITY, 4] }] },
			})
			expect(container.querySelectorAll('.base-chart__bar')).toHaveLength(2)
			expect(yTicks(container).every(text => text !== undefined && !/NaN|∞/.test(text ?? ''))).toBe(true)
		})
	})

	describe('ряды', () => {
		it('рисует по линии на ряд с разрывом на null и сетку по делениям', () => {
			const { container } = render(BaseChart, { props })
			const lines = container.querySelectorAll('.base-chart__line')
			expect(lines).toHaveLength(2)
			expect(lines[1].getAttribute('d')?.match(/M/g)).toHaveLength(2)
			expect(container.querySelectorAll('.base-chart__grid')).toHaveLength(5)
			expect(container.querySelector('.base-chart__area')).toBeNull()
			expect(container.querySelector('.base-chart__bar')).toBeNull()
		})

		it('у area рисует и область, и линию', () => {
			const { container } = render(BaseChart, { props: { ...props, variant: 'area' } })
			expect(container.querySelectorAll('.base-chart__area')).toHaveLength(2)
			expect(container.querySelectorAll('.base-chart__line')).toHaveLength(2)
			expect(container.querySelector('.base-chart')).toHaveClass('base-chart--area')
		})

		it('у bar рисует столбики группой без пустых значений', () => {
			const { container } = render(BaseChart, { props: { ...props, variant: 'bar' } })
			const bars = container.querySelectorAll('.base-chart__bar')
			expect(bars).toHaveLength(5)
			expect(container.querySelector('.base-chart__line')).toBeNull()
			expect(Number(bars[0].getAttribute('width'))).toBeCloseTo((100 / 3) * 0.35)
		})

		it('стопкой ставит столбики друг на друга шириной 60% полосы', () => {
			const { container } = render(BaseChart, { props: { ...props, variant: 'bar', isStacked: true } })
			const bars = [...container.querySelectorAll('.base-chart__bar')]
			expect(Number(bars[0].getAttribute('width'))).toBeCloseTo(20)
			expect(bars[0].getAttribute('x')).toBe(bars[3].getAttribute('x'))
			expect(yTicks(container).at(-1)).toBe('250')
		})

		it('стопка областей с отрицательными значениями растёт вниз от нуля', () => {
			const { container } = render(BaseChart, {
				props: {
					label: 'Поток',
					labels: ['a', 'b'],
					variant: 'area',
					isStacked: true,
					series: [
						{ name: 'Приход', values: [2, 3] },
						{ name: 'Уход', values: [-1, -4] },
					],
				},
			})
			expect(yTicks(container)[0]?.replace('−', '-')).toBe('-4')
			expect(container.querySelectorAll('.base-chart__area')).toHaveLength(2)
		})

		it('без сетки и легенды не рисует их', () => {
			const { container } = render(BaseChart, { props: { ...props, hasGrid: false, hasLegend: false } })
			expect(container.querySelector('.base-chart__grid')).toBeNull()
			expect(screen.queryByRole('list')).toBeNull()
		})

		it('красит ряды токенами по индексу, цвет ряда важнее, после восьмого — по кругу', () => {
			const colored: ChartSeries[] = Array.from({ length: 9 }, (_, index) => ({ name: `р${index}`, values: [index] }))
			colored[1] = { ...colored[1], color: 'red' }
			const { container } = render(BaseChart, { props: { label: 'Цвета', labels: ['a'], series: colored } })
			const strokes = [...container.querySelectorAll('.base-chart__line')].map(line => line.getAttribute('stroke'))
			expect(strokes[0]).toBe('var(--rise-chart-1)')
			expect(strokes[1]).toBe('red')
			expect(strokes[2]).toBe('var(--rise-chart-3)')
			expect(strokes[8]).toBe('var(--rise-chart-1)')
		})

		it('одна точка рисуется точкой посередине', () => {
			const { container } = render(BaseChart, { props: { label: 'Один', labels: ['a'], series: [{ name: 'Один', values: [5] }] } })
			expect(container.querySelector('.base-chart__line')).toHaveAttribute('d', 'M50.00 50.00 L50.00 50.00')
			expect(container.querySelector('.base-chart__x-tick')).toHaveStyle({ left: '50%' })
		})
	})

	describe('таблица для скринридера', () => {
		it('повторяет все данные: подпись, колонки всех рядов и «нет значения» вместо null', () => {
			render(BaseChart, { props: { ...props, hiddenSeries: ['Расходы'] } })
			const table = screen.getByRole('table', { name: 'Финансы' })
			expect(
				within(table)
					.getAllByRole('columnheader')
					.map(cell => cell.textContent),
			).toEqual(['Категория', 'Выручка', 'Расходы'])
			expect(within(table).getAllByRole('row')[2]).toHaveTextContent('Фев240нет значения')
		})

		it('берёт заголовок первой колонки из labelsTitle', () => {
			render(BaseChart, { props: { ...props, labelsTitle: 'Месяц' } })
			expect(screen.getByRole('columnheader', { name: 'Месяц' })).toBeInTheDocument()
		})
	})

	describe('пусто', () => {
		it('без подписей показывает «Нет данных» без области, легенды и таблицы', () => {
			render(BaseChart, { props: { ...props, labels: [] } })
			expect(screen.getByText('Нет данных')).toBeInTheDocument()
			expect(screen.queryByRole('img')).toBeNull()
			expect(screen.queryByRole('list')).toBeNull()
			expect(screen.queryByRole('table')).toBeNull()
		})

		it('без рядов показывает слот empty', () => {
			render(BaseChart, { props: { ...props, series: [] }, slots: { empty: 'Загрузите данные' } })
			expect(screen.getByText('Загрузите данные')).toBeInTheDocument()
		})

		it('ряды без чисел и все скрытые ряды — сводка из одного label', async () => {
			const { rerender } = render(BaseChart, { props: { ...props, series: [{ name: 'Пусто', values: [null, null, null] }] } })
			expect(screen.getByRole('img', { name: 'Финансы' })).toBeInTheDocument()
			await rerender({ series, hiddenSeries: ['Выручка', 'Расходы'] })
			expect(screen.getByRole('img', { name: 'Финансы' })).toBeInTheDocument()
		})
	})

	it('берёт высоту из createUiKitPlugin({ defaults })', () => {
		render(BaseChart, { props, global: { plugins: [createUiKitPlugin({ defaults: { BaseChart: { height: 300 } } })] } })
		expect(screen.getByRole('img')).toHaveStyle({ height: '300px' })
	})

	it('высота по умолчанию — 240px', () => {
		render(BaseChart, { props })
		expect(screen.getByRole('img')).toHaveStyle({ height: '240px' })
	})

	it('смена языка меняет строки и даты', async () => {
		const { container } = render(BaseChart, {
			props: { label: 'Visits', labels: [new Date(2026, 0, 5)], series: [{ name: 'Visits', values: [null] }] },
		})
		setLocale('en')
		await nextTick()
		expect(xTicks(container)).toEqual(['Jan 5'])
		expect(screen.getByRole('columnheader', { name: 'Category' })).toBeInTheDocument()
		expect(screen.getByRole('cell')).toHaveTextContent('no value')
		expect(screen.getByRole('list', { name: 'Chart series' })).toBeInTheDocument()
	})
})
