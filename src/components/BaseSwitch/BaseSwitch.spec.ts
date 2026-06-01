/**
 * Unit-тесты для BaseSwitch.
 * Проверяют рендер, пропсы и CSS-модификаторы.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'

import BaseSwitch from './BaseSwitch.vue'

describe('BaseSwitch unit', () => {
	describe('рендер', () => {
		it('должен рендерить переключатель', () => {
			const { container } = render(BaseSwitch, {
				props: { modelValue: false },
			})

			expect(container.querySelector('.base-switch')).toBeInTheDocument()
		})

		it('должен рендерить checkbox input', () => {
			const { container } = render(BaseSwitch, {
				props: { modelValue: false },
			})

			expect(container.querySelector('input[type="checkbox"]')).toBeInTheDocument()
		})

		it('должен рендерить слайдер', () => {
			const { container } = render(BaseSwitch, {
				props: { modelValue: false },
			})

			expect(container.querySelector('.base-switch__slider')).toBeInTheDocument()
		})
	})

	describe('пропс label', () => {
		it('должен рендерить лейбл когда передан', () => {
			render(BaseSwitch, {
				props: { modelValue: false, label: 'Уведомления' },
			})

			expect(screen.getByText('Уведомления')).toBeInTheDocument()
		})

		it('не должен рендерить лейбл когда не передан', () => {
			const { container } = render(BaseSwitch, {
				props: { modelValue: false },
			})

			expect(container.querySelector('.base-switch__label')).not.toBeInTheDocument()
		})
	})

	describe('пропс modelValue', () => {
		it('должен отмечать input когда modelValue=true', () => {
			const { container } = render(BaseSwitch, {
				props: { modelValue: true },
			})

			const input = container.querySelector<HTMLInputElement>('input[type="checkbox"]')
			expect(input?.checked).toBe(true)
		})

		it('не должен отмечать input когда modelValue=false', () => {
			const { container } = render(BaseSwitch, {
				props: { modelValue: false },
			})

			const input = container.querySelector<HTMLInputElement>('input[type="checkbox"]')
			expect(input?.checked).toBe(false)
		})
	})

	describe('пропс isDisabled', () => {
		it('должен добавлять класс --disabled когда isDisabled=true', () => {
			const { container } = render(BaseSwitch, {
				props: { modelValue: false, isDisabled: true },
			})

			expect(container.querySelector('.base-switch')?.classList.contains('base-switch--disabled')).toBe(true)
		})

		it('должен устанавливать disabled на input', () => {
			const { container } = render(BaseSwitch, {
				props: { modelValue: false, isDisabled: true },
			})

			const input = container.querySelector<HTMLInputElement>('input[type="checkbox"]')
			expect(input?.disabled).toBe(true)
		})

		it('не должен добавлять класс --disabled по умолчанию', () => {
			const { container } = render(BaseSwitch, {
				props: { modelValue: false },
			})

			expect(container.querySelector('.base-switch')?.classList.contains('base-switch--disabled')).toBe(false)
		})
	})

	describe('пропс sizeScale', () => {
		it('не должен устанавливать --size-scale когда sizeScale=100', () => {
			const { container } = render(BaseSwitch, {
				props: { modelValue: false, sizeScale: 100 },
			})

			const el = container.querySelector('.base-switch') as HTMLElement
			expect(el.style.getPropertyValue('--size-scale')).toBe('')
		})

		it('должен устанавливать --size-scale когда sizeScale=150', () => {
			const { container } = render(BaseSwitch, {
				props: { modelValue: false, sizeScale: 150 },
			})

			const el = container.querySelector('.base-switch') as HTMLElement
			expect(el.style.getPropertyValue('--size-scale')).toBe('1.5')
		})
	})

	describe('пропс variant', () => {
		it('должен применять модификатор --outline когда variant=outline', () => {
			const { container } = render(BaseSwitch, {
				props: { modelValue: false, variant: 'outline' },
			})

			expect(container.querySelector('.base-switch')?.classList.contains('base-switch--outline')).toBe(true)
		})
	})

	describe('пропс reverse', () => {
		it('должен добавлять класс --reverse когда reverse=true', () => {
			const { container } = render(BaseSwitch, {
				props: { modelValue: false, reverse: true },
			})

			expect(container.querySelector('.base-switch')?.classList.contains('base-switch--reverse')).toBe(true)
		})
	})

	describe('пропс color', () => {
		it('должен задавать кастомный цвет через style', () => {
			const { container } = render(BaseSwitch, {
				props: { modelValue: false, color: { text: { base: '#ff0000' } } },
			})

			expect(container.querySelector('.base-switch')?.getAttribute('style')).toContain('--custom-text: #ff0000')
		})
	})

	describe('пропс isRequired', () => {
		it('должен рендерить индикатор обязательности когда isRequired=true', () => {
			const { container } = render(BaseSwitch, {
				props: { modelValue: false, isRequired: true },
			})

			expect(container.querySelector('.base-switch__required')?.textContent).toBe('*')
		})

		it('не должен рендерить индикатор обязательности когда isRequired=false', () => {
			const { container } = render(BaseSwitch, {
				props: { modelValue: false, isRequired: false },
			})

			expect(container.querySelector('.base-switch__required')).not.toBeInTheDocument()
		})
	})

	describe('пропс error', () => {
		it('должен добавлять класс --error когда error передан', () => {
			const { container } = render(BaseSwitch, {
				props: { modelValue: false, error: 'Обязательное поле' },
			})

			expect(container.querySelector('.base-switch')?.classList.contains('base-switch--error')).toBe(true)
		})

		it('должен рендерить текст ошибки', () => {
			const { container } = render(BaseSwitch, {
				props: { modelValue: false, error: 'Обязательное поле' },
			})

			expect(container.querySelector('.base-switch__error-text')?.textContent).toBe('Обязательное поле')
		})

		it('не должен рендерить текст ошибки когда error не передан', () => {
			const { container } = render(BaseSwitch, {
				props: { modelValue: false },
			})

			expect(container.querySelector('.base-switch__error-text')).not.toBeInTheDocument()
		})
	})

	describe('слот label', () => {
		it('должен рендерить кастомный контент слота label', () => {
			const { container } = render(BaseSwitch, {
				props: { modelValue: false },
				slots: {
					label: '<span class="custom-label">Custom Label</span>',
				},
			})

			expect(container.querySelector('.custom-label')).toBeInTheDocument()
			expect(container.querySelector('.custom-label')?.textContent).toBe('Custom Label')
		})
	})

	describe('слот error', () => {
		it('должен рендерить кастомный контент слота error', () => {
			const { container } = render(BaseSwitch, {
				props: { modelValue: false, error: 'Ошибка' },
				slots: {
					error: '<span class="custom-error">Custom Error</span>',
				},
			})

			expect(container.querySelector('.custom-error')).toBeInTheDocument()
			expect(container.querySelector('.custom-error')?.textContent).toBe('Custom Error')
		})
	})

	describe('дефолтный слот', () => {
		it('должен рендерить контент дефолтного слота', () => {
			const { container } = render(BaseSwitch, {
				props: { modelValue: false },
				slots: {
					default: '<span class="custom-content">Custom Content</span>',
				},
			})

			expect(container.querySelector('.custom-content')).toBeInTheDocument()
			expect(container.querySelector('.custom-content')?.textContent).toBe('Custom Content')
		})
	})

	describe('пропс customClass', () => {
		it('должен добавлять строку класса к корневому элементу', () => {
			const { container } = render(BaseSwitch, {
				props: { modelValue: false, customClass: 'custom-switch-class' },
			})

			expect(container.querySelector('.base-switch')?.classList.contains('custom-switch-class')).toBe(true)
		})

		it('должен распределять объект классов по внутренним элементам', () => {
			const { container } = render(BaseSwitch, {
				props: {
					modelValue: false,
					label: 'Label',
					isRequired: true,
					error: 'Error',
					customClass: {
						root: 'custom-root',
						row: 'custom-row',
						wrapper: 'custom-wrapper',
						input: 'custom-input',
						slider: 'custom-slider',
						handle: 'custom-handle',
						content: 'custom-content',
						label: 'custom-label',
						required: 'custom-required',
						errorText: 'custom-error-text',
					},
				},
			})

			expect(container.querySelector('.base-switch')?.classList.contains('custom-root')).toBe(true)
			expect(container.querySelector('.base-switch__row')?.classList.contains('custom-row')).toBe(true)
			expect(container.querySelector('.base-switch__wrapper')?.classList.contains('custom-wrapper')).toBe(true)
			expect(container.querySelector('.base-switch__input')?.classList.contains('custom-input')).toBe(true)
			expect(container.querySelector('.base-switch__slider')?.classList.contains('custom-slider')).toBe(true)
			expect(container.querySelector('.base-switch__handle')?.classList.contains('custom-handle')).toBe(true)
			expect(container.querySelector('.base-switch__content')?.classList.contains('custom-content')).toBe(true)

			// Проверяем классы на BaseText компонентах
			expect(container.querySelector('.base-switch__label')?.classList.contains('custom-label')).toBe(true)
			expect(container.querySelector('.base-switch__required')?.classList.contains('custom-required')).toBe(true)
			expect(container.querySelector('.base-switch__error-text')?.classList.contains('custom-error-text')).toBe(true)
		})
	})
})
