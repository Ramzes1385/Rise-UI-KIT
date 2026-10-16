import '@testing-library/jest-dom/vitest'
import { render } from '@testing-library/vue'
import BaseStepper from '../ui/BaseStepper.vue'

const ITEMS = [{ label: 'Корзина' }, { label: 'Доставка' }, { label: 'Оплата' }]

function summaryOf(container: Element): string | null {
	return container.querySelector('.base-stepper')!.getAttribute('data-summary')
}

describe('BaseStepper: подпись компактного вида', () => {
	it('горизонтальный степпер: «Шаг N из M: подпись» текущего шага в data-summary, текста в DOM не добавляет', () => {
		const { container, queryAllByText } = render(BaseStepper, { props: { modelValue: 2, items: ITEMS } })

		expect(summaryOf(container)).toBe('Шаг 2 из 3: Доставка')
		expect(queryAllByText('Доставка')).toHaveLength(1)
	})

	it('шаг без подписи — только «Шаг N из M»', () => {
		const { container } = render(BaseStepper, { props: { modelValue: 1, items: [{ label: '' }, { label: 'Адрес' }] } })

		expect(summaryOf(container)).toBe('Шаг 1 из 2')
	})

	it('значение вне диапазона берёт ближайший шаг, пустой список — пустая подпись', () => {
		vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const { container, rerender } = render(BaseStepper, { props: { modelValue: 9, items: ITEMS } })

		expect(summaryOf(container)).toBe('Шаг 3 из 3: Оплата')
		return rerender({ modelValue: 1, items: [] }).then(() => expect(summaryOf(container)).toBe(''))
	})

	it('вертикальный степпер подписи не получает', () => {
		const { container } = render(BaseStepper, { props: { modelValue: 2, items: ITEMS, orientation: 'vertical' } })

		expect(container.querySelector('.base-stepper')).not.toHaveAttribute('data-summary')
	})
})
