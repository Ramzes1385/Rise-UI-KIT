import '@testing-library/jest-dom/vitest'
import { setLocale } from '@/locales/state'
import BaseSparkline from '../ui/BaseSparkline.vue'
import { fireEvent, render, screen } from '@testing-library/vue'

const rect = { left: 0, width: 200, top: 0, height: 32, right: 200, bottom: 32, x: 0, y: 0 } as DOMRect
const lineRect = { ...rect, left: 4, width: 192, x: 4, right: 196 } as DOMRect

function mockGeometry(): void {
	vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
		if (this instanceof SVGElement) return lineRect
		if (this.classList.contains('base-sparkline__bar')) {
			const index = [...(this.parentElement?.children ?? [])].indexOf(this)
			return { ...rect, left: index * 24, width: 20 } as DOMRect
		}
		return rect
	})
}

describe('BaseSparkline', () => {
	afterEach(() => {
		setLocale('ru')
		vi.restoreAllMocks()
	})

	it('линия со сводкой для скринридера и точкой на последнем значении', () => {
		const { container } = render(BaseSparkline, { props: { values: [3, 9, 5], label: 'Заказы' } })

		expect(screen.getByRole('img', { name: 'Заказы: от 3 до 9, последнее значение 5' })).toBeInTheDocument()
		expect(container.querySelector('.base-sparkline__line')).toHaveAttribute('d', 'M0.00 28.00 L50.00 4.00 L100.00 20.00')
		expect(container.querySelector('.base-sparkline__area')).toBeNull()
		expect((container.querySelector('.base-sparkline__dot') as HTMLElement).style.getPropertyValue('--sparkline-x')).toBe('100')
		expect((container.querySelector('.base-sparkline') as HTMLElement).style.height).toBe('32px')
	})

	it('наведение: ближайшее значение и подпись; уход — подсказка пропадает', async () => {
		mockGeometry()
		const { container } = render(BaseSparkline, {
			props: {
				values: [3, 9, 5],
				labels: ['янв', 'фев', 'мар'],
				label: 'Заказы',
				variant: 'area',
				formatValue: (value: number) => `${value} шт.`,
			},
		})
		const root = container.querySelector('.base-sparkline') as HTMLElement

		expect(container.querySelector('.base-sparkline__area')).toHaveAttribute('d', expect.stringContaining('Z'))
		await fireEvent.pointerMove(root, { clientX: 95 })
		expect(container.querySelector('.base-sparkline__tooltip')).toHaveTextContent('9 шт.фев')
		expect((container.querySelector('.base-sparkline__dot') as HTMLElement).style.getPropertyValue('--sparkline-x')).toBe('50')
		await fireEvent.pointerLeave(root)
		expect(container.querySelector('.base-sparkline__tooltip')).toBeNull()
		expect(screen.getByRole('img')).toHaveAccessibleName('Заказы: от 3 шт. до 9 шт., последнее значение 5 шт.')
	})

	it('столбики, пустой набор, один столбик и свой цвет', async () => {
		mockGeometry()
		const { container, rerender } = render(BaseSparkline, {
			props: { values: [2, -4, 0], label: 'Баланс', variant: 'bar', markColor: 'rgb(1, 2, 3)', height: 40, sizeScale: 125 },
		})
		const bars = container.querySelectorAll<HTMLElement>('.base-sparkline__bar')

		expect([...bars].map(bar => bar.style.height)).toEqual(['50%', '100%', '4%'])
		expect((container.querySelector('.base-sparkline') as HTMLElement).style.getPropertyValue('--sparkline-color')).toBe('rgb(1, 2, 3)')
		await fireEvent.pointerMove(container.querySelector('.base-sparkline') as HTMLElement, { clientX: 0 })
		expect(bars[0]).toHaveClass('base-sparkline__bar--active')
		await rerender({ values: [] })
		expect(screen.getByRole('img', { name: 'Баланс' })).toBeInTheDocument()
		await fireEvent.pointerMove(container.querySelector('.base-sparkline') as HTMLElement, { clientX: 10 })
		expect(container.querySelector('.base-sparkline__tooltip')).toBeNull()
		await rerender({ values: [7], variant: 'line' })
		expect(container.querySelector('.base-sparkline__line')).toHaveAttribute('d', 'M50.00 20.00')
	})

	it('наведение считает по геометрии линии, а не корня: отступ 4 px на краях не сдвигает ближайшую точку', async () => {
		mockGeometry()
		const { container } = render(BaseSparkline, {
			props: { values: [1, 2, 3, 4, 5], labels: ['a', 'b', 'c', 'd', 'e'], label: 'Ряд' },
		})
		const root = container.querySelector('.base-sparkline') as HTMLElement
		const tooltip = (): string => container.querySelector('.base-sparkline__tooltip')?.textContent ?? ''

		await fireEvent.pointerMove(root, { clientX: 26 })
		expect(tooltip()).toContain('a')
		await fireEvent.pointerMove(root, { clientX: 30 })
		expect(tooltip()).toContain('b')
		await fireEvent.pointerMove(root, { clientX: 1 })
		expect(tooltip()).toContain('a')
		await fireEvent.pointerMove(root, { clientX: 199 })
		expect(tooltip()).toContain('e')
	})

	it('столбики: ближайший столбик по их реальному положению, а не по доле ширины корня', async () => {
		mockGeometry()
		const { container } = render(BaseSparkline, { props: { values: [2, 4, 6], label: 'Баланс', variant: 'bar' } })
		const bars = container.querySelectorAll('.base-sparkline__bar')
		const root = container.querySelector('.base-sparkline') as HTMLElement

		await fireEvent.pointerMove(root, { clientX: 150 })
		expect(bars[2]).toHaveClass('base-sparkline__bar--active')
		await fireEvent.pointerMove(root, { clientX: 30 })
		expect(bars[1]).toHaveClass('base-sparkline__bar--active')
		expect(bars[2]).not.toHaveClass('base-sparkline__bar--active')
	})
})
