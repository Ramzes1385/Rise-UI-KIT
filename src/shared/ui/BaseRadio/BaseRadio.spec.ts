/**
 * Unit-тесты для BaseRadio.
 * Проверяют рендер, пропсы и CSS-модификаторы.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'

import type { BaseRadioOption } from './BaseRadio.types'
import BaseRadio from './BaseRadio.vue'

const OPTIONS: BaseRadioOption[] = [
	{ value: 'metal', label: 'Металл' },
	{ value: 'wood', label: 'Дерево' },
	{ value: 'stone', label: 'Камень' },
	{ value: 'glass', label: 'Стекло', isDisabled: true },
]

describe('BaseRadio unit', () => {
	describe('рендер', () => {
		it('должен рендерить все опции', () => {
			const { container } = render(BaseRadio, {
				props: { modelValue: '', options: OPTIONS, name: 'test' },
			})

			const labels = container.querySelectorAll('.base-radio')
			expect(labels).toHaveLength(OPTIONS.length)
		})

		it('должен рендерить текст каждой опции', () => {
			render(BaseRadio, {
				props: { modelValue: '', options: OPTIONS, name: 'test' },
			})

			OPTIONS.forEach(option => {
				expect(screen.getByText(option.label)).toBeInTheDocument()
			})
		})

		it('должен рендерить radio-input для каждой опции', () => {
			const { container } = render(BaseRadio, {
				props: { modelValue: '', options: OPTIONS, name: 'test' },
			})

			const inputs = container.querySelectorAll('input[type="radio"]')
			expect(inputs).toHaveLength(OPTIONS.length)
		})
	})

	describe('пропс name', () => {
		it('должен устанавливать name на все input', () => {
			const { container } = render(BaseRadio, {
				props: { modelValue: '', options: OPTIONS, name: 'material' },
			})

			const inputs = container.querySelectorAll<HTMLInputElement>('input[type="radio"]')
			inputs.forEach(input => {
				expect(input.name).toBe('material')
			})
		})
	})

	describe('пропс modelValue', () => {
		it('должен отмечать выбранную опцию', () => {
			const { container } = render(BaseRadio, {
				props: { modelValue: 'metal', options: OPTIONS, name: 'test' },
			})

			const checkedInput = container.querySelector<HTMLInputElement>('input[type="radio"]:checked')
			expect(checkedInput?.value).toBe('metal')
		})

		it('должен рендерить точку для выбранной опции', () => {
			const { container } = render(BaseRadio, {
				props: { modelValue: 'metal', options: OPTIONS, name: 'test' },
			})

			const dots = container.querySelectorAll('.base-radio__dot')
			expect(dots).toHaveLength(1)
		})
	})

	describe('пропс isVertical', () => {
		it('должен добавлять класс --vertical когда isVertical=true', () => {
			const { container } = render(BaseRadio, {
				props: { modelValue: '', options: OPTIONS, name: 'test', isVertical: true },
			})

			expect(container.firstElementChild?.classList.contains('base-radio-group--vertical')).toBe(true)
		})

		it('не должен добавлять класс --vertical по умолчанию', () => {
			const { container } = render(BaseRadio, {
				props: { modelValue: '', options: OPTIONS, name: 'test' },
			})

			expect(container.firstElementChild?.classList.contains('base-radio-group--vertical')).toBe(false)
		})
	})

	describe('пропс hasError', () => {
		it('должен добавлять класс --error когда hasError=true', () => {
			const { container } = render(BaseRadio, {
				props: { modelValue: '', options: OPTIONS, name: 'test', hasError: true },
			})

			const errorItems = container.querySelectorAll('.base-radio--error')
			expect(errorItems.length).toBeGreaterThan(0)
		})
	})

	describe('отключённая опция', () => {
		it('должен добавлять класс --disabled на отключённую опцию', () => {
			const { container } = render(BaseRadio, {
				props: { modelValue: '', options: OPTIONS, name: 'test' },
			})

			const disabledItems = container.querySelectorAll('.base-radio--disabled')
			expect(disabledItems).toHaveLength(1)
		})

		it('должен устанавливать disabled на input отключённой опции', () => {
			const { container } = render(BaseRadio, {
				props: { modelValue: '', options: OPTIONS, name: 'test' },
			})

			const disabledInputs = container.querySelectorAll<HTMLInputElement>('input[type="radio"]:disabled')
			expect(disabledInputs).toHaveLength(1)
		})
	})

	describe('пропс sizeScale', () => {
		it('не должен устанавливать style когда sizeScale=1', () => {
			const { container } = render(BaseRadio, {
				props: { modelValue: '', options: OPTIONS, name: 'test', sizeScale: 100 },
			})

			expect(container.firstElementChild?.getAttribute('style')).toBeNull()
		})

		it('должен устанавливать --size-scale когда sizeScale=150', () => {
			const { container } = render(BaseRadio, {
				props: { modelValue: '', options: OPTIONS, name: 'test', sizeScale: 150 },
			})

			expect(container.firstElementChild?.getAttribute('style')).toContain('--size-scale: 1.5')
		})
	})
})
