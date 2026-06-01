/**
 * Unit-тесты для BaseRadio.
 * Проверяют рендер, пропсы и CSS-модификаторы.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'

import { BaseText } from '@components/BaseText'
import type { BaseRadioOption } from './BaseRadio.types'
import BaseRadio from './BaseRadio.vue'

const OPTIONS: BaseRadioOption[] = [
	{ value: 'metal', label: 'Металл' },
	{ value: 'wood', label: 'Дерево' },
	{ value: 'stone', label: 'Камень' },
	{ value: 'glass', label: 'Стекло', isDisabled: true },
]

const GLOBAL_COMPONENTS = { global: { components: { BaseText } } }

describe('BaseRadio unit', () => {
	describe('рендер', () => {
		it('должен рендерить все опции', () => {
			const { container } = render(BaseRadio, {
				props: { modelValue: '', options: OPTIONS, name: 'test' },
				...GLOBAL_COMPONENTS,
			})

			const labels = container.querySelectorAll('.base-radio')
			expect(labels).toHaveLength(OPTIONS.length)
		})

		it('должен рендерить текст каждой опции', () => {
			render(BaseRadio, {
				props: { modelValue: '', options: OPTIONS, name: 'test' },
				...GLOBAL_COMPONENTS,
			})

			OPTIONS.forEach(option => {
				expect(screen.getByText(option.label)).toBeInTheDocument()
			})
		})

		it('должен рендерить radio-input для каждой опции', () => {
			const { container } = render(BaseRadio, {
				props: { modelValue: '', options: OPTIONS, name: 'test' },
				...GLOBAL_COMPONENTS,
			})

			const inputs = container.querySelectorAll('input[type="radio"]')
			expect(inputs).toHaveLength(OPTIONS.length)
		})
	})

	describe('пропс label', () => {
		it('должен рендерить заголовок группы когда передан label', () => {
			const { container } = render(BaseRadio, {
				props: { modelValue: '', options: OPTIONS, name: 'test', label: 'Выберите материал' },
				...GLOBAL_COMPONENTS,
			})

			expect(screen.getByText('Выберите материал')).toBeInTheDocument()
			expect(container.querySelector('.base-radio-group__label')).toBeInTheDocument()
		})

		it('не должен рендерить заголовок группы когда label не передан', () => {
			const { container } = render(BaseRadio, {
				props: { modelValue: '', options: OPTIONS, name: 'test' },
				...GLOBAL_COMPONENTS,
			})

			expect(container.querySelector('.base-radio-group__label')).not.toBeInTheDocument()
		})
	})

	describe('пропс name', () => {
		it('должен устанавливать name на все input', () => {
			const { container } = render(BaseRadio, {
				props: { modelValue: '', options: OPTIONS, name: 'material' },
				...GLOBAL_COMPONENTS,
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
				...GLOBAL_COMPONENTS,
			})

			const checkedInput = container.querySelector<HTMLInputElement>('input[type="radio"]:checked')
			expect(checkedInput?.value).toBe('metal')
		})

		it('должен рендерить точку для выбранной опции', () => {
			const { container } = render(BaseRadio, {
				props: { modelValue: 'metal', options: OPTIONS, name: 'test' },
				...GLOBAL_COMPONENTS,
			})

			const dots = container.querySelectorAll('.base-radio__dot')
			expect(dots).toHaveLength(1)
		})
	})

	describe('пропс isVertical', () => {
		it('должен добавлять класс --vertical на контейнер опций когда isVertical=true', () => {
			const { container } = render(BaseRadio, {
				props: { modelValue: '', options: OPTIONS, name: 'test', isVertical: true },
				...GLOBAL_COMPONENTS,
			})

			const optionsContainer = container.querySelector('.base-radio-group__options')
			expect(optionsContainer?.classList.contains('base-radio-group__options--vertical')).toBe(true)
		})

		it('не должен добавлять класс --vertical по умолчанию', () => {
			const { container } = render(BaseRadio, {
				props: { modelValue: '', options: OPTIONS, name: 'test' },
				...GLOBAL_COMPONENTS,
			})

			const optionsContainer = container.querySelector('.base-radio-group__options')
			expect(optionsContainer?.classList.contains('base-radio-group__options--vertical')).toBe(false)
		})
	})

	describe('пропс isRequired', () => {
		it('должен рендерить звёздочку когда isRequired=true и label передан', () => {
			render(BaseRadio, {
				props: { modelValue: '', options: OPTIONS, name: 'test', label: 'Материал', isRequired: true },
				...GLOBAL_COMPONENTS,
			})

			const required = document.querySelector('.base-radio-group__required')
			expect(required).toBeInTheDocument()
		})

		it('не должен рендерить звёздочку когда isRequired=false', () => {
			const { container } = render(BaseRadio, {
				props: { modelValue: '', options: OPTIONS, name: 'test', label: 'Материал', isRequired: false },
				...GLOBAL_COMPONENTS,
			})

			expect(container.querySelector('.base-radio-group__required')).not.toBeInTheDocument()
		})
	})

	describe('пропс error', () => {
		it('должен добавлять класс --error на группу когда передан error', () => {
			const { container } = render(BaseRadio, {
				props: { modelValue: '', options: OPTIONS, name: 'test', error: 'Обязательное поле' },
				...GLOBAL_COMPONENTS,
			})

			expect(container.firstElementChild?.classList.contains('base-radio-group--error')).toBe(true)
		})

		it('должен добавлять класс --error на опции когда передан error', () => {
			const { container } = render(BaseRadio, {
				props: { modelValue: '', options: OPTIONS, name: 'test', error: 'Обязательное поле' },
				...GLOBAL_COMPONENTS,
			})

			const errorItems = container.querySelectorAll('.base-radio--error')
			expect(errorItems.length).toBeGreaterThan(0)
		})

		it('должен рендерить текст ошибки когда передан error', () => {
			render(BaseRadio, {
				props: { modelValue: '', options: OPTIONS, name: 'test', error: 'Обязательное поле' },
				...GLOBAL_COMPONENTS,
			})

			expect(screen.getByText('Обязательное поле')).toBeInTheDocument()
		})

		it('не должен рендерить текст ошибки когда error не передан', () => {
			const { container } = render(BaseRadio, {
				props: { modelValue: '', options: OPTIONS, name: 'test' },
				...GLOBAL_COMPONENTS,
			})

			expect(container.querySelector('.base-radio-group__error-text')).not.toBeInTheDocument()
		})
	})

	describe('отключённая опция', () => {
		it('должен добавлять класс --disabled на отключённую опцию', () => {
			const { container } = render(BaseRadio, {
				props: { modelValue: '', options: OPTIONS, name: 'test' },
				...GLOBAL_COMPONENTS,
			})

			const disabledItems = container.querySelectorAll('.base-radio--disabled')
			expect(disabledItems).toHaveLength(1)
		})

		it('должен устанавливать disabled на input отключённой опции', () => {
			const { container } = render(BaseRadio, {
				props: { modelValue: '', options: OPTIONS, name: 'test' },
				...GLOBAL_COMPONENTS,
			})

			const disabledInputs = container.querySelectorAll<HTMLInputElement>('input[type="radio"]:disabled')
			expect(disabledInputs).toHaveLength(1)
		})
	})

	describe('пропс sizeScale', () => {
		it('не должен устанавливать style когда sizeScale=1', () => {
			const { container } = render(BaseRadio, {
				props: { modelValue: '', options: OPTIONS, name: 'test', sizeScale: 100 },
				...GLOBAL_COMPONENTS,
			})

			expect(container.firstElementChild?.getAttribute('style')).toBeNull()
		})

		it('должен устанавливать --size-scale когда sizeScale=150', () => {
			const { container } = render(BaseRadio, {
				props: { modelValue: '', options: OPTIONS, name: 'test', sizeScale: 150 },
				...GLOBAL_COMPONENTS,
			})

			expect(container.firstElementChild?.getAttribute('style')).toContain('--size-scale: 1.5')
		})
	})

	describe('пропс customClass', () => {
		it('должен добавлять строку класса к корневому элементу', () => {
			const { container } = render(BaseRadio, {
				props: { modelValue: '', options: OPTIONS, name: 'test', customClass: 'custom-radio-root' },
				...GLOBAL_COMPONENTS,
			})

			expect(container.querySelector('.base-radio-group')).toHaveClass('custom-radio-root')
		})

		it('должен распределять объект классов по внутренним элементам', () => {
			const { container } = render(BaseRadio, {
				props: {
					modelValue: 'metal',
					options: OPTIONS,
					name: 'test',
					label: 'Выберите материал',
					error: 'Ошибка',
					customClass: {
						root: 'custom-root',
						label: 'custom-label',
						options: 'custom-options',
						radio: 'custom-radio',
						wrapper: 'custom-wrapper',
						input: 'custom-input',
						circle: 'custom-circle',
						dot: 'custom-dot',
						optionLabel: 'custom-option-label',
						errorText: 'custom-error-text',
					},
				},
				...GLOBAL_COMPONENTS,
			})

			expect(container.querySelector('.base-radio-group')).toHaveClass('custom-root')
			expect(container.querySelector('.base-radio-group__label')).toHaveClass('custom-label')
			expect(container.querySelector('.base-radio-group__options')).toHaveClass('custom-options')
			expect(container.querySelector('.base-radio')).toHaveClass('custom-radio')
			expect(container.querySelector('.base-radio__wrapper')).toHaveClass('custom-wrapper')
			expect(container.querySelector('.base-radio__input')).toHaveClass('custom-input')
			expect(container.querySelector('.base-radio__circle')).toHaveClass('custom-circle')
			expect(container.querySelector('.base-radio__dot')).toHaveClass('custom-dot')
			expect(container.querySelector('.base-radio__option-label')).toHaveClass('custom-option-label')
			expect(container.querySelector('.base-radio-group__error-text')).toHaveClass('custom-error-text')
		})
	})
})
