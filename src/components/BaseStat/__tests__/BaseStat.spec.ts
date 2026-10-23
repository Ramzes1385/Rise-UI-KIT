import '@testing-library/jest-dom/vitest'
import BaseStat from '../ui/BaseStat.vue'
import { setLocale } from '@/locales/state'
import { createUiKitPlugin } from '@/plugin'
import { render, screen } from '@testing-library/vue'

const text = (element: Element | null): string => (element?.textContent ?? '').replace(/\s+/g, ' ').trim()

describe('BaseStat unit', () => {
	afterEach(() => setLocale('ru'))

	it('показывает подпись и значение парой dt и dd', () => {
		const { container } = render(BaseStat, { props: { label: 'Заказы', value: 1284 } })
		expect(container.querySelector('dt')).toHaveTextContent('Заказы')
		expect(text(container.querySelector('dd.base-stat__value'))).toBe('1 284')
	})

	it('форматирует число по valueFormat и языку кита', async () => {
		document.documentElement.setAttribute('data-rise-motion', 'none')
		const { container, rerender } = render(BaseStat, {
			props: { label: 'Выручка', value: 4_820_000, valueFormat: { style: 'currency', currency: 'RUB', notation: 'compact' } },
		})
		expect(text(container.querySelector('.base-stat__value'))).toBe('4,8 млн ₽')
		setLocale('en')
		await rerender({ value: 1500 })
		expect(text(container.querySelector('.base-stat__value'))).toBe('RUB 1.5K')
		document.documentElement.removeAttribute('data-rise-motion')
	})

	it('строку выводит как есть, без значения — пусто', async () => {
		const { container, rerender } = render(BaseStat, { props: { label: 'Статус', value: 'Норма' } })
		expect(text(container.querySelector('.base-stat__value'))).toBe('Норма')
		await rerender({ value: undefined })
		expect(text(container.querySelector('.base-stat__value'))).toBe('')
	})

	it('без change нет строки изменения', () => {
		const { container } = render(BaseStat, { props: { label: 'Заказы', value: 1 } })
		expect(container.querySelector('.base-stat__change')).toBeNull()
	})

	it('рост: стрелка вверх, знак плюс, хороший тон и подпись периода', () => {
		const { container } = render(BaseStat, { props: { label: 'Выручка', value: 1, change: 0.12, changeLabel: 'за неделю' } })
		const change = container.querySelector('.base-stat__change')
		expect(text(change)).toBe('+12 % за неделю')
		expect(change).toHaveClass('base-stat__change--positive')
		expect(container.querySelector('.base-stat__trend .base-icon__svg')).toHaveStyle({ transform: 'scaleY(-1)' })
	})

	it('снижение — плохой тон, при isInverse — хороший', async () => {
		const { container, rerender } = render(BaseStat, { props: { label: 'Отток', value: 1, change: -0.004 } })
		expect(text(container.querySelector('.base-stat__delta'))).toBe('-0,4 %')
		expect(container.querySelector('.base-stat__change')).toHaveClass('base-stat__change--negative')
		await rerender({ isInverse: true })
		expect(container.querySelector('.base-stat__change')).toHaveClass('base-stat__change--positive')
		await rerender({ change: 0.1 })
		expect(container.querySelector('.base-stat__change')).toHaveClass('base-stat__change--negative')
	})

	it('ноль — без знака и нейтрально', () => {
		const { container } = render(BaseStat, { props: { label: 'Заказы', value: 1, change: 0 } })
		expect(text(container.querySelector('.base-stat__delta'))).toBe('0 %')
		expect(container.querySelector('.base-stat__change')).toHaveClass('base-stat__change--neutral')
		expect(text(container.querySelector('.base-stat__change'))).toBe('0 %')
	})

	it('changeFormat заменяет формат: пункты вместо процентов', () => {
		const { container } = render(BaseStat, {
			props: { label: 'Возвраты', value: '2,1 %', change: -0.4, changeFormat: { style: 'decimal' }, changeLabel: 'п. п.' },
		})
		expect(text(container.querySelector('.base-stat__change'))).toBe('-0,4 п. п.')
	})

	it('NaN не показывает изменение', () => {
		const { container } = render(BaseStat, { props: { label: 'Заказы', value: 1, change: Number.NaN } })
		expect(container.querySelector('.base-stat__change')).toBeNull()
	})

	it('загрузка: заглушки вместо значения и изменения, aria-busy', async () => {
		const { container, rerender } = render(BaseStat, { props: { label: 'Заказы', value: 12, change: 0.1, isLoading: true } })
		expect(container.querySelector('.base-stat')).toHaveAttribute('aria-busy', 'true')
		expect(container.querySelectorAll('.base-skeleton')).toHaveLength(2)
		expect(screen.queryByText('12')).toBeNull()
		await rerender({ change: undefined })
		expect(container.querySelectorAll('.base-skeleton')).toHaveLength(1)
		await rerender({ isLoading: false })
		expect(container.querySelector('.base-stat')).not.toHaveAttribute('aria-busy')
	})

	it('слоты label, value, change, icon и chart', () => {
		const { container } = render(BaseStat, {
			props: { label: 'Заказы', value: 5, change: -0.2 },
			slots: {
				label: '<b>Свои заказы</b>',
				value: '<template #value="{ formatted }">[{{ formatted }}]</template>',
				change: '<template #change="{ formatted, trend, tone }">{{ formatted }} {{ trend }} {{ tone }}</template>',
				icon: '<i>значок</i>',
				chart: '<svg data-testid="chart" />',
			},
		})
		expect(screen.getByText('Свои заказы')).toBeInTheDocument()
		expect(text(container.querySelector('.base-stat__value'))).toBe('[5]')
		expect(text(container.querySelector('.base-stat__change'))).toBe('-20 % down negative')
		expect(container.querySelector('.base-stat')).toHaveClass('base-stat--with-icon')
		expect(container.querySelector('.base-stat__icon')).toHaveTextContent('значок')
		expect(screen.getByTestId('chart').parentElement).toHaveClass('base-stat__chart')
	})

	it('без слотов icon и chart нет обёрток', () => {
		const { container } = render(BaseStat, { props: { label: 'Заказы', value: 1 } })
		expect(container.querySelector('.base-stat__icon')).toBeNull()
		expect(container.querySelector('.base-stat__chart')).toBeNull()
		expect(container.querySelector('.base-stat')).not.toHaveClass('base-stat--with-icon')
	})

	it('добавляет модификатор варианта, кроме default', () => {
		const { container } = render(BaseStat, { props: { label: 'Заказы', variant: 'soft' } })
		expect(container.querySelector('.base-stat')).toHaveClass('base-stat--soft')
	})

	it('пишет --size-scale только при масштабе, отличном от 100', () => {
		const { container } = render(BaseStat, { props: { label: 'Заказы', sizeScale: 125 } })
		expect((container.querySelector('.base-stat') as HTMLElement).style.getPropertyValue('--size-scale')).toBe('1.25')
	})

	it('добавляет customClass к частям', () => {
		const { container } = render(BaseStat, {
			props: { label: 'Заказы', value: 1, change: 0.1, customClass: { root: 'r', label: 'l', value: 'v', change: 'c', chart: 'g' } },
			slots: { chart: '<span />' },
		})
		const parts = [
			['', 'r'],
			['__label', 'l'],
			['__value', 'v'],
			['__change', 'c'],
			['__chart', 'g'],
		]
		for (const [part, name] of parts) expect(container.querySelector(`.base-stat${part}`)).toHaveClass(name)
	})

	it('берёт умолчания из createUiKitPlugin({ defaults })', () => {
		const { container } = render(BaseStat, {
			props: { label: 'Отток', value: 1, change: 0.1 },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseStat: { isInverse: true, variant: 'soft' } } })] },
		})
		expect(container.querySelector('.base-stat')).toHaveClass('base-stat--soft')
		expect(container.querySelector('.base-stat__change')).toHaveClass('base-stat__change--negative')
	})
})
