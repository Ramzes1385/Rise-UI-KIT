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

	describe('пропс sizeScale', () => {
		it('не должен устанавливать --size-scale когда sizeScale=100', () => {
			const { container } = render(BaseSeparator, { props: { sizeScale: 100 } })

			const el = container.querySelector('.base-separator') as HTMLElement
			expect(el.style.getPropertyValue('--size-scale')).toBe('')
		})

		it('должен устанавливать --size-scale когда sizeScale=150', () => {
			const { container } = render(BaseSeparator, { props: { sizeScale: 150 } })

			const el = container.querySelector('.base-separator') as HTMLElement
			expect(el.style.getPropertyValue('--size-scale')).toBe('1.5')
		})

		it('должен устанавливать --size-scale когда sizeScale=75', () => {
			const { container } = render(BaseSeparator, { props: { sizeScale: 75 } })

			const el = container.querySelector('.base-separator') as HTMLElement
			expect(el.style.getPropertyValue('--size-scale')).toBe('0.75')
		})
	})

	describe('слот default', () => {
		it('должен рендерить содержимое слота', () => {
			const { container } = render(BaseSeparator, {
				slots: { default: 'Кастомный контент' },
			})

			expect(container.querySelector('.base-separator__content')?.textContent).toBe('Кастомный контент')
		})

		it('должен добавлять класс --with-content когда есть слот', () => {
			const { container } = render(BaseSeparator, {
				slots: { default: '<span>Текст</span>' },
			})

			expect(container.querySelector('.base-separator')?.classList.contains('base-separator--with-content')).toBe(true)
		})

		it('должен рендерить две линии вокруг слота', () => {
			const { container } = render(BaseSeparator, {
				slots: { default: 'Контент' },
			})

			expect(container.querySelector('.base-separator__line--before')).toBeInTheDocument()
			expect(container.querySelector('.base-separator__line--after')).toBeInTheDocument()
		})
	})

	describe('пропс color', () => {
		it('должен задавать кастомный цвет через style', () => {
			const { container } = render(BaseSeparator, {
				props: { color: { text: { base: '#ff0000' } } },
			})

			expect(container.querySelector('.base-separator')?.getAttribute('style')).toContain('--custom-text: #ff0000')
		})
	})

	it('не должен устанавливать role для вертикального разделителя', () => {
		const { container } = render(BaseSeparator, {
			props: { orientation: 'vertical' },
		})

		expect(container.querySelector('.base-separator')?.getAttribute('role')).toBeNull()
	})

	it('не должен добавлять класс --dashed по умолчанию', () => {
		const { container } = render(BaseSeparator)

		expect(container.querySelector('.base-separator')?.classList.contains('base-separator--dashed')).toBe(false)
	})

	describe('пропс customClass', () => {
		it('должен добавлять строку класса к корневому элементу', () => {
			const { container } = render(BaseSeparator, {
				props: { customClass: 'custom-sep-class' },
			})

			expect(container.querySelector('.base-separator')).toHaveClass('custom-sep-class')
		})

		it('должен распределять объект классов по внутренним элементам', () => {
			const { container } = render(BaseSeparator, {
				props: {
					label: 'Или',
					customClass: {
						root: 'custom-root',
						line: 'custom-line',
						content: 'custom-content',
					},
				},
			})

			expect(container.querySelector('.base-separator')).toHaveClass('custom-root')
			expect(container.querySelector('.base-separator__line')).toHaveClass('custom-line')
			expect(container.querySelector('.base-separator__content')).toHaveClass('custom-content')
		})
	})
})
