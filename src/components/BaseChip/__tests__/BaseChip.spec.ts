/**
 * Unit-тесты для BaseChip.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'
import BaseChip from '../ui/BaseChip.vue'

describe('BaseChip unit', () => {
	it('должен рендерить контент слота', () => {
		render(BaseChip, {
			slots: { default: 'Main Content' },
		})
		expect(screen.getByText('Main Content')).toBeInTheDocument()
	})

	it('должен рендерить индикатор с числовым контентом', () => {
		render(BaseChip, {
			props: { content: 5 },
		})
		expect(screen.getByText('5')).toBeInTheDocument()
	})

	it('должен рендерить индикатор со строковым контентом', () => {
		render(BaseChip, {
			props: { content: 'New' },
		})
		expect(screen.getByText('New')).toBeInTheDocument()
	})

	it('не должен рендерить индикатор если контент не передан', () => {
		const { container } = render(BaseChip)
		expect(container.querySelector('.base-chip__badge')).not.toBeInTheDocument()
	})

	it('не должен рендерить индикатор если контент — пустая строка', () => {
		const { container } = render(BaseChip, {
			props: { content: '' },
		})
		expect(container.querySelector('.base-chip__badge')).not.toBeInTheDocument()
	})

	it('должен показывать индикатор при content=0 если isHiddenOnZero=false (дефолт)', () => {
		render(BaseChip, {
			props: { content: 0 },
		})
		expect(screen.getByText('0')).toBeInTheDocument()
	})

	it('должен скрывать индикатор при content=0 если isHiddenOnZero=true', () => {
		const { container } = render(BaseChip, {
			props: { content: 0, isHiddenOnZero: true },
		})
		expect(container.querySelector('.base-chip__badge')).not.toBeInTheDocument()
	})

	it('должен скрывать индикатор при строковом content="0" и isHiddenOnZero=true', () => {
		const { container } = render(BaseChip, {
			props: { content: '0', isHiddenOnZero: true },
		})
		expect(container.querySelector('.base-chip__badge')).not.toBeInTheDocument()
	})

	it('должен ограничивать число через maxValue при hasOverflow=true', () => {
		render(BaseChip, {
			props: { content: 150, maxValue: 99, hasOverflow: true },
		})
		expect(screen.getByText('99+')).toBeInTheDocument()
	})

	it('должен ограничивать строковое число через maxValue при hasOverflow=true', () => {
		render(BaseChip, {
			props: { content: '150', maxValue: 99, hasOverflow: true },
		})
		expect(screen.getByText('99+')).toBeInTheDocument()
	})

	it('не должен ограничивать число если hasOverflow=false (дефолт)', () => {
		render(BaseChip, {
			props: { content: 150, maxValue: 99 },
		})
		expect(screen.getByText('150')).toBeInTheDocument()
	})

	it('должен показывать число как есть если оно меньше maxValue', () => {
		render(BaseChip, {
			props: { content: 50, maxValue: 99, hasOverflow: true },
		})
		expect(screen.getByText('50')).toBeInTheDocument()
	})

	it('должен использовать дефолтный maxValue=99 при hasOverflow=true', () => {
		render(BaseChip, {
			props: { content: 150, hasOverflow: true },
		})
		expect(screen.getByText('99+')).toBeInTheDocument()
	})

	it('не должен ограничивать нечисловую строку при hasOverflow=true', () => {
		render(BaseChip, {
			props: { content: 'New', hasOverflow: true },
		})
		expect(screen.getByText('New')).toBeInTheDocument()
	})

	describe('пропс placement', () => {
		it('должен применять класс base-chip__badge--top-right по умолчанию', () => {
			const { container } = render(BaseChip, { props: { content: 5 } })

			expect(container.querySelector('.base-chip__badge--top-right')).toBeInTheDocument()
		})

		it('должен применять класс base-chip__badge--top-left', () => {
			const { container } = render(BaseChip, { props: { content: 5, placement: 'top-left' } })

			expect(container.querySelector('.base-chip__badge--top-left')).toBeInTheDocument()
		})

		it('должен применять класс base-chip__badge--bottom-right', () => {
			const { container } = render(BaseChip, { props: { content: 5, placement: 'bottom-right' } })

			expect(container.querySelector('.base-chip__badge--bottom-right')).toBeInTheDocument()
		})

		it('должен применять класс base-chip__badge--bottom-left', () => {
			const { container } = render(BaseChip, { props: { content: 5, placement: 'bottom-left' } })

			expect(container.querySelector('.base-chip__badge--bottom-left')).toBeInTheDocument()
		})
	})

	describe('пропс variant', () => {
		it('не должен добавлять БЭМ-модификатор для варианта default', () => {
			const { container } = render(BaseChip, { props: { content: 5 } })

			const chip = container.querySelector('.base-chip')
			expect(chip?.className).not.toMatch(/base-chip--/)
		})

		it('должен применять вариант ghost', () => {
			const { container } = render(BaseChip, { props: { content: 5, variant: 'ghost' } })

			expect(container.querySelector('.base-chip--ghost')).toBeInTheDocument()
		})

		it('должен применять вариант outline', () => {
			const { container } = render(BaseChip, { props: { content: 5, variant: 'outline' } })

			expect(container.querySelector('.base-chip--outline')).toBeInTheDocument()
		})
	})

	describe('пропс sizeScale', () => {
		it('должен применять масштаб размера через CSS-переменную', () => {
			const { container } = render(BaseChip, { props: { content: 5, sizeScale: 150 } })

			const chip = container.querySelector('.base-chip') as HTMLElement
			expect(chip.style.getPropertyValue('--size-scale')).toBe('1.5')
		})
	})

	describe('пропс customClass', () => {
		it('должен добавлять строку класса к корневому элементу', () => {
			const { container } = render(BaseChip, {
				props: { customClass: 'custom-chip-class' },
			})

			expect(container.querySelector('.base-chip')).toHaveClass('custom-chip-class')
		})

		it('должен распределять объект классов по внутренним элементам', () => {
			const { container } = render(BaseChip, {
				props: {
					content: 5,
					customClass: {
						root: 'custom-chip-root',
						badge: 'custom-chip-badge',
					},
				},
			})

			expect(container.querySelector('.base-chip')).toHaveClass('custom-chip-root')
			expect(container.querySelector('.base-chip__badge')).toHaveClass('custom-chip-badge')
		})
	})

	describe('numericValue fallback', () => {
		it('должен вернуть null когда content не передан (undefined)', () => {
			const { container } = render(BaseChip, { props: { sizeScale: 100 } })

			// Индикатор не должен рендериться — isVisible вернёт false,
			// потому что numericValue = null и content = undefined
			expect(container.querySelector('.base-chip__badge')).not.toBeInTheDocument()
		})

		it('должен вернуть null для нечисловой строки в numericValue', () => {
			// Проверяем что нечисловая строка не ломает numericValue
			const { container } = render(BaseChip, {
				props: { content: 'hello-world', hasOverflow: true, maxValue: 99 },
			})

			// Индикатор отображается с оригинальной строкой, не обрабатывая overflow
			expect(container.querySelector('.base-chip__badge')).toBeInTheDocument()
		})
	})
})
