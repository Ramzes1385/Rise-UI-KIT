/**
 * Unit-тесты для BaseSeparator.
 * Проверяют рендер, пропсы и CSS-модификаторы.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'

import BaseSeparator from './BaseSeparator.vue'

describe('BaseSeparator unit', () => {
	describe('рендер', () => {
		it('должен рендерить разделитель', () => {
			const { container } = render(BaseSeparator)

			expect(container.querySelector('.base-separator')).toBeInTheDocument()
		})

		it('должен рендерить линию по умолчанию', () => {
			const { container } = render(BaseSeparator)

			expect(container.querySelector('.base-separator__line')).toBeInTheDocument()
		})

		it('должен устанавливать role=separator для горизонтального', () => {
			const { container } = render(BaseSeparator)

			expect(container.querySelector('.base-separator')?.getAttribute('role')).toBe('separator')
		})
	})

	describe('пропс label', () => {
		it('должен рендерить метку когда передана', () => {
			render(BaseSeparator, { props: { label: 'Или' } })

			expect(screen.getByText('Или')).toBeInTheDocument()
		})

		it('должен добавлять класс --with-content когда есть метка', () => {
			const { container } = render(BaseSeparator, { props: { label: 'Или' } })

			expect(container.querySelector('.base-separator')?.classList.contains('base-separator--with-content')).toBe(true)
		})
	})

	describe('пропс orientation', () => {
		it('должен применять модификатор --horizontal по умолчанию', () => {
			const { container } = render(BaseSeparator)

			expect(container.querySelector('.base-separator')?.classList.contains('base-separator--horizontal')).toBe(true)
		})

		it('должен применять модификатор --vertical когда orientation=vertical', () => {
			const { container } = render(BaseSeparator, { props: { orientation: 'vertical' } })

			expect(container.querySelector('.base-separator')?.classList.contains('base-separator--vertical')).toBe(true)
		})
	})

	describe('пропс isDashed', () => {
		it('должен добавлять класс --dashed когда isDashed=true', () => {
			const { container } = render(BaseSeparator, { props: { isDashed: true } })

			expect(container.querySelector('.base-separator')?.classList.contains('base-separator--dashed')).toBe(true)
		})
	})

	describe('пропс thickness', () => {
		it('должен устанавливать CSS-переменную --sep-thickness', () => {
			const { container } = render(BaseSeparator, { props: { thickness: 3 } })

			const el = container.querySelector('.base-separator') as HTMLElement
			expect(el.style.getPropertyValue('--sep-thickness')).toBe('3px')
		})
	})

	describe('пропс spacing', () => {
		it('должен устанавливать CSS-переменные --sep-pad-y и --sep-pad-x на контенте', () => {
			const { container } = render(BaseSeparator, { props: { spacing: 10, label: 'Тест' } })

			const content = container.querySelector('.base-separator__content') as HTMLElement
			expect(content.style.getPropertyValue('--sep-pad-y')).toBe('10px')
			expect(content.style.getPropertyValue('--sep-pad-x')).toBe('20px')
		})
	})
})
