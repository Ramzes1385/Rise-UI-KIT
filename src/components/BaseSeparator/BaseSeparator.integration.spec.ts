/**
 * Integration-тесты для BaseSeparator.
 * Проверяют рендер с реальными дочерними компонентами и слотами.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'

import BaseSeparator from './BaseSeparator.vue'

describe('BaseSeparator integration', () => {
	it('должен рендерить разделитель с меткой', () => {
		const { container } = render(BaseSeparator, {
			props: { label: 'Или' },
		})

		expect(screen.getByText('Или')).toBeInTheDocument()
		expect(container.querySelector('.base-separator--with-content')).toBeInTheDocument()
		expect(container.querySelectorAll('.base-separator__line')).toHaveLength(2)
	})

	it('должен рендерить разделитель со слотом default', () => {
		const { container } = render(BaseSeparator, {
			slots: { default: 'Кастомный контент' },
		})

		expect(screen.getByText('Кастомный контент')).toBeInTheDocument()
		expect(container.querySelector('.base-separator--with-content')).toBeInTheDocument()
	})

	it('должен рендерить простую линию без контента', () => {
		const { container } = render(BaseSeparator)

		expect(container.querySelector('.base-separator--with-content')).not.toBeInTheDocument()
		expect(container.querySelector('.base-separator__line')).toBeInTheDocument()
	})

	it('должен применять модификатор --dashed', () => {
		const { container } = render(BaseSeparator, {
			props: { isDashed: true },
		})

		expect(container.querySelector('.base-separator--dashed')).toBeInTheDocument()
	})

	it('должен устанавливать role=separator для горизонтального разделителя', () => {
		const { container } = render(BaseSeparator, {
			props: { orientation: 'horizontal' },
		})

		expect(container.querySelector('.base-separator')?.getAttribute('role')).toBe('separator')
	})

	it('не должен устанавливать role для вертикального разделителя', () => {
		const { container } = render(BaseSeparator, {
			props: { orientation: 'vertical' },
		})

		expect(container.querySelector('.base-separator')?.getAttribute('role')).toBeNull()
	})
})
