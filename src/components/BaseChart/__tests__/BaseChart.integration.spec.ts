import '@testing-library/jest-dom/vitest'
import BaseChart from '../ui/BaseChart.vue'
import { defineComponent, h, ref } from 'vue'
import userEvent from '@testing-library/user-event'
import type { ChartSeries } from '../types/BaseChart.types'
import { fireEvent, render, screen } from '@testing-library/vue'

const labels = ['Янв', 'Фев', 'Мар', 'Апр', 'Май']
const series: ChartSeries[] = [
	{ name: 'Выручка', values: [120, 240, 180, 200, 210] },
	{ name: 'Расходы', values: [90, null, 60, 70, 80] },
]
const props = { label: 'Финансы', labels, series }

const plot = () => screen.getByRole('img')
const status = () => screen.getByRole('status')
const tooltip = (container: Element) => container.querySelector('.base-chart__tooltip')
const legendButton = (name: string) => screen.getByRole('button', { name })

describe('BaseChart integration', () => {
	beforeEach(() => {
		vi.stubGlobal(
			'matchMedia',
			vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
		)
	})

	afterEach(() => {
		vi.unstubAllGlobals()
	})

	describe('подсказка мышью', () => {
		it('показывает ближайшую точку, пунктир и метки видимых рядов со значением', async () => {
			const { container } = render(BaseChart, { props })
			await fireEvent.pointerMove(plot(), { clientX: 30 })
			const tip = tooltip(container)
			expect(tip).toHaveAttribute('aria-hidden', 'true')
			expect(tip).toHaveTextContent('ФевВыручка240Расходынет значения')
			expect(tip).not.toHaveClass('base-chart__tooltip--start')
			expect(tip).toHaveAttribute('style', expect.stringContaining('--base-chart-guide-x: 0px'))
			expect(container.querySelector('.base-chart__guide')).toHaveAttribute('x1', '25')
			expect(container.querySelectorAll('.base-chart__marker')).toHaveLength(1)
		})

		it('справа от середины ставит подсказку слева от точки', async () => {
			const { container } = render(BaseChart, { props })
			await fireEvent.pointerMove(plot(), { clientX: 90 })
			expect(tooltip(container)).toHaveClass('base-chart__tooltip--start')
			expect(tooltip(container)).toHaveTextContent('Май')
		})

		it('у столбиков выбирает полосу и не рисует меток', async () => {
			const { container } = render(BaseChart, { props: { ...props, variant: 'bar' } })
			await fireEvent.pointerMove(plot(), { clientX: 39 })
			expect(tooltip(container)).toHaveTextContent('Фев')
			expect(container.querySelector('.base-chart__marker')).toBeNull()
		})

		it('уход указателя и потеря фокуса снимают подсказку', async () => {
			const { container } = render(BaseChart, { props })
			await fireEvent.pointerMove(plot(), { clientX: 50 })
			await fireEvent.pointerLeave(plot())
			expect(tooltip(container)).toBeNull()
			expect(container.querySelector('.base-chart__guide')).toBeNull()
			await fireEvent.pointerMove(plot(), { clientX: 50 })
			await fireEvent.blur(plot())
			expect(tooltip(container)).toBeNull()
		})

		it('при нулевой ширине области ничего не выбирает', async () => {
			const { container } = render(BaseChart, { props })
			plot().getBoundingClientRect = () => ({ left: 0, width: 0 }) as DOMRect
			await fireEvent.pointerMove(plot(), { clientX: 30 })
			expect(tooltip(container)).toBeNull()
		})

		it('скрытый ряд не попадает в подсказку и метки', async () => {
			const { container } = render(BaseChart, { props: { ...props, hiddenSeries: ['Выручка'] } })
			await fireEvent.pointerMove(plot(), { clientX: 0 })
			expect(tooltip(container)).toHaveTextContent('ЯнвРасходы90')
			expect(tooltip(container)).not.toHaveTextContent('Выручка')
			expect(container.querySelectorAll('.base-chart__marker')).toHaveLength(1)
		})

		it('слот tooltip получает точку', async () => {
			const { container } = render(BaseChart, {
				props,
				slots: {
					tooltip: `<template #tooltip="{ point }">{{ point.index }}|{{ point.label }}|{{ point.values.map(v => v.value).join(';') }}</template>`,
				},
			})
			await fireEvent.pointerMove(plot(), { clientX: 100 })
			expect(tooltip(container)).toHaveTextContent('4|Май|210;80')
		})
	})

	describe('клавиатура', () => {
		it('Tab ставит фокус на область, стрелки ходят по точкам и объявляют их', async () => {
			const user = userEvent.setup()
			render(BaseChart, { props })
			await user.tab()
			expect(plot()).toHaveFocus()
			await user.keyboard('{ArrowRight}')
			expect(status()).toHaveTextContent('Янв: Выручка: 120, Расходы: 90')
			await user.keyboard('{ArrowRight}')
			expect(status()).toHaveTextContent('Фев: Выручка: 240, Расходы: нет значения')
			await user.keyboard('{ArrowLeft}')
			expect(status()).toHaveTextContent('Янв:')
			await user.keyboard('{ArrowLeft}')
			expect(status()).toHaveTextContent('Янв:')
		})

		it('← с пустого — последняя точка, → на конце остаётся, Home и End', async () => {
			const user = userEvent.setup()
			render(BaseChart, { props })
			await user.tab()
			await user.keyboard('{ArrowLeft}')
			expect(status()).toHaveTextContent('Май:')
			await user.keyboard('{ArrowRight}')
			expect(status()).toHaveTextContent('Май:')
			await user.keyboard('{Home}')
			expect(status()).toHaveTextContent('Янв:')
			await user.keyboard('{End}')
			expect(status()).toHaveTextContent('Май:')
		})

		it('PageDown и PageUp шагают на десятую часть точек', async () => {
			const user = userEvent.setup()
			const many = Array.from({ length: 30 }, (_, index) => `т${index}`)
			render(BaseChart, { props: { label: 'Ряд', labels: many, series: [{ name: 'Ряд', values: many.map((_, index) => index) }] } })
			await user.tab()
			await user.keyboard('{PageDown}')
			expect(status()).toHaveTextContent('т3: Ряд: 3')
			await user.keyboard('{PageDown}')
			expect(status()).toHaveTextContent('т6:')
			await user.keyboard('{PageUp}')
			expect(status()).toHaveTextContent('т3:')
			await user.keyboard('{End}{PageDown}')
			expect(status()).toHaveTextContent('т29:')
			await user.keyboard('{Home}{PageUp}')
			expect(status()).toHaveTextContent('т0:')
			await user.keyboard('{Escape}{PageUp}')
			expect(status()).toHaveTextContent('т26:')
		})

		it('Escape снимает подсказку, прочие клавиши не перехватываются', async () => {
			const user = userEvent.setup()
			const { container } = render(BaseChart, { props })
			await user.tab()
			await user.keyboard('{ArrowRight}')
			expect(tooltip(container)).not.toBeNull()
			await user.keyboard('{Escape}')
			expect(tooltip(container)).toBeNull()
			const handled = new KeyboardEvent('keydown', { key: 'Home', cancelable: true })
			plot().dispatchEvent(handled)
			expect(handled.defaultPrevented).toBe(true)
			const other = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true })
			plot().dispatchEvent(other)
			expect(other.defaultPrevented).toBe(false)
		})

		it('Escape без выбранной точки не перехватывается — модалка вокруг графика закроется', async () => {
			const user = userEvent.setup()
			render(BaseChart, { props })
			await user.tab()
			const idle = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true })
			plot().dispatchEvent(idle)
			expect(idle.defaultPrevented).toBe(false)
			await user.keyboard('{End}')
			const active = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true })
			plot().dispatchEvent(active)
			expect(active.defaultPrevented).toBe(true)
			const again = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true })
			plot().dispatchEvent(again)
			expect(again.defaultPrevented).toBe(false)
		})

		it('NaN и Infinity объявляются и показываются как «нет значения», в слот tooltip — null', async () => {
			const user = userEvent.setup()
			const { container } = render(BaseChart, {
				props: { label: 'Р', labels: ['a', 'b', 'c'], series: [{ name: 'Р', values: [1, Number.NaN, Number.POSITIVE_INFINITY] }] },
				slots: { tooltip: `<template #tooltip="{ point }">{{ point.label }}={{ String(point.values[0].value) }}</template>` },
			})
			await user.tab()
			await user.keyboard('{End}')
			expect(status()).toHaveTextContent('c: Р: нет значения')
			expect(tooltip(container)).toHaveTextContent('c=null')
			await user.keyboard('{ArrowLeft}')
			expect(status()).toHaveTextContent('b: Р: нет значения')
			expect(tooltip(container)).toHaveTextContent('b=null')
		})

		it('в подсказке без слота NaN показан как «нет значения»', async () => {
			const user = userEvent.setup()
			const { container } = render(BaseChart, {
				props: { label: 'Р', labels: ['a', 'b'], series: [{ name: 'Р', values: [1, Number.NaN] }] },
			})
			await user.tab()
			await user.keyboard('{End}')
			expect(tooltip(container)).toHaveTextContent('нет значения')
		})
	})

	describe('легенда', () => {
		it('кнопка скрывает и возвращает ряд, эмитит update:hiddenSeries', async () => {
			const user = userEvent.setup()
			const { container, emitted } = render(BaseChart, { props })
			expect(legendButton('Расходы')).toHaveAttribute('aria-pressed', 'true')
			await user.click(legendButton('Расходы'))
			expect(legendButton('Расходы')).toHaveAttribute('aria-pressed', 'false')
			expect(legendButton('Расходы')).toHaveClass('base-chart__legend-item--hidden')
			expect(container.querySelectorAll('.base-chart__line--hidden')).toHaveLength(1)
			expect(container.querySelectorAll('.base-chart__line')).toHaveLength(2)
			expect(plot()).toHaveAccessibleName('Финансы: Выручка; значения от 120 до 240')
			await user.click(legendButton('Расходы'))
			expect(container.querySelectorAll('.base-chart__line--hidden')).toHaveLength(0)
			expect(emitted('update:hiddenSeries')).toEqual([[['Расходы']], [[]]])
		})

		it('скрытие ряда пересчитывает стопку', async () => {
			const user = userEvent.setup()
			const { container } = render(BaseChart, { props: { ...props, variant: 'bar', isStacked: true } })
			const tallest = () =>
				Math.max(...[...container.querySelectorAll('.base-chart__bar')].map(bar => Number(bar.getAttribute('height'))))
			expect(container.querySelectorAll('.base-chart__bar')).toHaveLength(9)
			await user.click(legendButton('Выручка'))
			const hidden = [...container.querySelectorAll('.base-chart__bar--hidden')]
			expect(hidden).toHaveLength(5)
			expect(hidden.every(bar => Number(bar.getAttribute('height')) === 0)).toBe(true)
			expect(container.querySelector('.base-chart__y-tick:last-child')).toHaveTextContent('100')
			expect(tallest()).toBeCloseTo(90)
		})

		it('с v-model:hidden-series показывает внешнее состояние', async () => {
			const user = userEvent.setup()
			const hidden = ref<string[]>(['Выручка'])
			render(
				defineComponent({
					setup: () => () =>
						h(BaseChart, {
							...props,
							hiddenSeries: hidden.value,
							'onUpdate:hiddenSeries': (next: string[]) => {
								hidden.value = next
							},
						}),
				}),
			)
			expect(legendButton('Выручка')).toHaveAttribute('aria-pressed', 'false')
			await user.click(legendButton('Выручка'))
			expect(hidden.value).toEqual([])
			expect(legendButton('Выручка')).toHaveAttribute('aria-pressed', 'true')
			await user.click(legendButton('Расходы'))
			expect(hidden.value).toEqual(['Расходы'])
		})
	})

	describe('обновление данных', () => {
		it('перерисовывает ряды, оси и таблицу при новых данных', async () => {
			const { container, rerender } = render(BaseChart, { props })
			const before = container.querySelector('.base-chart__line')?.getAttribute('d')
			await rerender({ labels: ['a', 'b'], series: [{ name: 'Новый', values: [1000, 2000] }] })
			expect(container.querySelector('.base-chart__line')?.getAttribute('d')).not.toBe(before)
			expect(screen.getAllByRole('row')).toHaveLength(3)
			expect(legendButton('Новый')).toBeInTheDocument()
			expect(container.querySelector('.base-chart__y-tick:last-child')).toHaveTextContent(/^2\s000$/)
		})

		it('снимает подсказку, если выбранной точки больше нет', async () => {
			const { container, rerender } = render(BaseChart, { props })
			await fireEvent.pointerMove(plot(), { clientX: 100 })
			expect(tooltip(container)).not.toBeNull()
			await rerender({ labels: ['a', 'b'], series: [{ name: 'Ряд', values: [1, 2] }] })
			expect(tooltip(container)).toBeNull()
		})

		it('переход в пустое состояние и обратно', async () => {
			const { rerender } = render(BaseChart, { props })
			await rerender({ series: [] })
			expect(screen.queryByRole('img')).toBeNull()
			await rerender({ series })
			expect(plot()).toBeInTheDocument()
		})
	})
})
