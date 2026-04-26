/**
 * Unit-тесты для BaseSelect.
 * Проверяют рендер, пропсы и CSS-модификаторы.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'

import type { BaseSelectOption } from './BaseSelect.types'
import BaseSelect from './BaseSelect.vue'

/** Стандартный набор опций для тестов */
const OPTIONS: BaseSelectOption[] = [
	{ value: 'metal', label: 'Металл' },
	{ value: 'wood', label: 'Дерево' },
	{ value: 'stone', label: 'Камень' },
	{ value: 'glass', label: 'Стекло', description: 'Прозрачный материал' },
	{ value: 'ceramic', label: 'Керамика', isDisabled: true },
]

describe('BaseSelect unit', () => {
	describe('рендер', () => {
		it('должен рендерить селект', () => {
			const { container } = render(BaseSelect, {
				props: { modelValue: '', options: OPTIONS },
			})

			expect(container.querySelector('.base-select')).toBeInTheDocument()
		})

		it('должен отображать placeholder', () => {
			render(BaseSelect, {
				props: { modelValue: '', options: OPTIONS, placeholder: 'Выберите...' },
			})

			expect(screen.getByText('Выберите...')).toBeInTheDocument()
		})
	})

	describe('пропс variant', () => {
		it('должен применять модификатор --outline по умолчанию', () => {
			const { container } = render(BaseSelect, {
				props: { modelValue: '', options: OPTIONS },
			})

			const select = container.querySelector('.base-select')
			expect(select?.classList.contains('base-select--outline')).toBe(true)
		})

		it('должен применять модификатор --ghost', () => {
			const { container } = render(BaseSelect, {
				props: { modelValue: '', options: OPTIONS, variant: 'ghost' },
			})

			const select = container.querySelector('.base-select')
			expect(select?.classList.contains('base-select--ghost')).toBe(true)
		})

		it('должен применять модификатор --underline', () => {
			const { container } = render(BaseSelect, {
				props: { modelValue: '', options: OPTIONS, variant: 'underline' },
			})

			const select = container.querySelector('.base-select')
			expect(select?.classList.contains('base-select--underline')).toBe(true)
		})
	})

	describe('пропс isDisabled', () => {
		it('должен добавлять класс --disabled когда isDisabled=true', () => {
			const { container } = render(BaseSelect, {
				props: { modelValue: '', options: OPTIONS, isDisabled: true },
			})

			const select = container.querySelector('.base-select')
			expect(select?.classList.contains('base-select--disabled')).toBe(true)
		})
	})

	describe('пропс hasError', () => {
		it('должен добавлять класс --error когда hasError=true', () => {
			const { container } = render(BaseSelect, {
				props: { modelValue: '', options: OPTIONS, hasError: true },
			})

			const select = container.querySelector('.base-select')
			expect(select?.classList.contains('base-select--error')).toBe(true)
		})
	})

	describe('пропс isMultiple', () => {
		it('должен добавлять класс --multiple когда isMultiple=true', () => {
			const { container } = render(BaseSelect, {
				props: { modelValue: [], options: OPTIONS, isMultiple: true },
			})

			const select = container.querySelector('.base-select')
			expect(select?.classList.contains('base-select--multiple')).toBe(true)
		})
	})

	describe('выбранное значение', () => {
		it('должен отображать лейбл выбранной опции', () => {
			render(BaseSelect, {
				props: { modelValue: 'metal', options: OPTIONS },
			})

			expect(screen.getByText('Металл')).toBeInTheDocument()
		})

		it('должен отображать placeholder когда значение не выбрано', () => {
			render(BaseSelect, {
				props: { modelValue: '', options: OPTIONS, placeholder: 'Выберите материал' },
			})

			expect(screen.getByText('Выберите материал')).toBeInTheDocument()
		})
	})
})
