import '@testing-library/jest-dom/vitest'
import BaseStepper from '../ui/BaseStepper.vue'
import { render, waitFor } from '@testing-library/vue'

const ITEMS = [{ label: 'Корзина' }, { label: 'Доставка' }, { label: 'Оплата' }, { label: 'Готово' }]

function stubReducedMotion(matches: boolean): void {
	vi.stubGlobal(
		'matchMedia',
		vi.fn(() => ({ matches, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
	)
}

const root = (container: Element) => container.querySelector('.base-stepper')
const fills = (container: Element, side: 'start' | 'end') =>
	[...container.querySelectorAll('.base-stepper__step')].map(step => Boolean(step.querySelector(`.base-stepper__line-fill--${side}`)))

describe('BaseStepper: заполнение линии', () => {
	beforeEach(() => stubReducedMotion(false))

	afterEach(() => {
		vi.unstubAllGlobals()
		document.documentElement.removeAttribute('data-rise-motion')
	})

	it('по горизонтали у шага половинки линии: входящая — кроме первого, исходящая — кроме последнего', () => {
		const { container } = render(BaseStepper, { props: { modelValue: 2, items: ITEMS } })

		expect(fills(container, 'start')).toEqual([false, true, true, true])
		expect(fills(container, 'end')).toEqual([true, true, true, false])
		container.querySelectorAll('.base-stepper__line-fill').forEach(fill => expect(fill).toHaveAttribute('aria-hidden', 'true'))
	})

	it('по вертикали — только исходящая линия', () => {
		const { container } = render(BaseStepper, { props: { modelValue: 2, items: ITEMS, orientation: 'vertical' } })

		expect(fills(container, 'start')).toEqual([false, false, false, false])
		expect(fills(container, 'end')).toEqual([true, true, true, false])
	})

	it('при монтировании шаг не «выпрыгивает»: класс --stepped только после смены шага', async () => {
		const { container, rerender } = render(BaseStepper, { props: { modelValue: 1, items: ITEMS } })

		expect(root(container)).not.toHaveClass('base-stepper--stepped')
		expect(root(container)).not.toHaveClass('base-stepper--instant')
		await rerender({ modelValue: 3 })
		expect(root(container)).toHaveClass('base-stepper--stepped')
		expect(container.querySelectorAll('.base-stepper__step--passed')).toHaveLength(2)
	})

	it('пресет none — линия и шаг сразу в конечном состоянии (--instant)', () => {
		document.documentElement.setAttribute('data-rise-motion', 'none')
		const { container } = render(BaseStepper, { props: { modelValue: 2, items: ITEMS, variant: 'animated' } })

		expect(root(container)).toHaveClass('base-stepper--instant')
	})

	it('«уменьшить движение» — тоже --instant', async () => {
		stubReducedMotion(true)
		const { container } = render(BaseStepper, { props: { modelValue: 2, items: ITEMS } })

		await waitFor(() => expect(root(container)).toHaveClass('base-stepper--instant'))
	})
})
