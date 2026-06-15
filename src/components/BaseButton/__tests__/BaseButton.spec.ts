/**
 * Unit-тесты для BaseButton.
 * Проверяют рендер, пропсы, CSS-модификаторы и слоты.
 */

import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/vue'

import BaseButton from '../ui/BaseButton.vue'

describe('BaseButton unit', () => {
	describe('рендер', () => {
		it('должен рендерить кнопку', () => {
			render(BaseButton, { slots: { default: 'Кнопка' } })

			expect(screen.getByRole('button', { name: 'Кнопка' })).toBeInTheDocument()
		})

		it('должен рендерить текст слота', () => {
			render(BaseButton, { slots: { default: 'Сохранить' } })

			expect(screen.getByText('Сохранить')).toBeInTheDocument()
		})
	})

	describe('пропс type', () => {
		it('должен устанавливать type=button по умолчанию', () => {
			render(BaseButton, { slots: { default: 'Кнопка' } })

			expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
		})

		it('должен устанавливать type=submit', () => {
			render(BaseButton, { props: { type: 'submit' }, slots: { default: 'Отправить' } })

			expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
		})

		it('должен устанавливать type=reset', () => {
			render(BaseButton, { props: { type: 'reset' }, slots: { default: 'Сбросить' } })

			expect(screen.getByRole('button')).toHaveAttribute('type', 'reset')
		})
	})

	describe('пропс variant', () => {
		it('не должен добавлять модификатор для default', () => {
			const { container } = render(BaseButton, { slots: { default: 'Кнопка' } })

			expect(container.firstElementChild?.classList.contains('base-button--default')).toBe(false)
		})

		it('должен применять модификатор --ghost', () => {
			const { container } = render(BaseButton, {
				props: { variant: 'ghost' },
				slots: { default: 'Кнопка' },
			})

			expect(container.firstElementChild?.classList.contains('base-button--ghost')).toBe(true)
		})

		it('должен применять модификатор --outline', () => {
			const { container } = render(BaseButton, {
				props: { variant: 'outline' },
				slots: { default: 'Кнопка' },
			})

			expect(container.firstElementChild?.classList.contains('base-button--outline')).toBe(true)
		})

		it('должен применять модификатор --shadow', () => {
			const { container } = render(BaseButton, {
				props: { variant: 'shadow' },
				slots: { default: 'Кнопка' },
			})

			expect(container.firstElementChild?.classList.contains('base-button--shadow')).toBe(true)
		})

		it('должен применять модификатор --soft', () => {
			const { container } = render(BaseButton, {
				props: { variant: 'soft' },
				slots: { default: 'Кнопка' },
			})

			expect(container.firstElementChild?.classList.contains('base-button--soft')).toBe(true)
		})
	})

	describe('пропс isDisabled', () => {
		it('должен быть disabled когда isDisabled=true', () => {
			render(BaseButton, { props: { isDisabled: true }, slots: { default: 'Кнопка' } })

			expect(screen.getByRole('button')).toBeDisabled()
		})

		it('должен добавлять класс --disabled когда isDisabled=true', () => {
			const { container } = render(BaseButton, {
				props: { isDisabled: true },
				slots: { default: 'Кнопка' },
			})

			expect(container.firstElementChild?.classList.contains('base-button--disabled')).toBe(true)
		})

		it('не должен быть disabled по умолчанию', () => {
			render(BaseButton, { slots: { default: 'Кнопка' } })

			expect(screen.getByRole('button')).not.toBeDisabled()
		})
	})

	describe('пропс isLoading', () => {
		it('должен быть disabled когда isLoading=true', () => {
			render(BaseButton, { props: { isLoading: true }, slots: { default: 'Кнопка' } })

			expect(screen.getByRole('button')).toBeDisabled()
		})

		it('должен добавлять класс --loading когда isLoading=true', () => {
			const { container } = render(BaseButton, {
				props: { isLoading: true },
				slots: { default: 'Кнопка' },
			})

			expect(container.firstElementChild?.classList.contains('base-button--loading')).toBe(true)
		})

		it('должен рендерить лоадер когда isLoading=true', () => {
			const { container } = render(BaseButton, {
				props: { isLoading: true },
				slots: { default: 'Кнопка' },
			})

			expect(container.querySelector('.base-button__loader')).toBeInTheDocument()
		})

		it('не должен рендерить лоадер когда isLoading=false', () => {
			const { container } = render(BaseButton, { slots: { default: 'Кнопка' } })

			expect(container.querySelector('.base-button__loader')).not.toBeInTheDocument()
		})
	})

	describe('пропс sizeScale', () => {
		it('не должен устанавливать --size-scale когда sizeScale=100', () => {
			const { container } = render(BaseButton, {
				props: { sizeScale: 100 },
				slots: { default: 'Кнопка' },
			})

			expect(container.firstElementChild?.getAttribute('style')).not.toContain('--size-scale')
		})

		it('должен устанавливать --size-scale когда sizeScale=150', () => {
			const { container } = render(BaseButton, {
				props: { sizeScale: 150 },
				slots: { default: 'Кнопка' },
			})

			expect(container.firstElementChild?.getAttribute('style')).toContain('--size-scale: 1.5')
		})

		it('должен устанавливать --size-scale когда sizeScale=75', () => {
			const { container } = render(BaseButton, {
				props: { sizeScale: 75 },
				slots: { default: 'Кнопка' },
			})

			expect(container.firstElementChild?.getAttribute('style')).toContain('--size-scale: 0.75')
		})
	})

	describe('слоты', () => {
		it('должен рендерить слот left', () => {
			const { container } = render(BaseButton, {
				slots: { default: 'Текст', left: '💾' },
			})

			expect(container.querySelector('.base-button__slot-left')).toBeInTheDocument()
			expect(screen.getByText('💾')).toBeInTheDocument()
		})

		it('должен рендерить слот right', () => {
			const { container } = render(BaseButton, {
				slots: { default: 'Текст', right: '→' },
			})

			expect(container.querySelector('.base-button__slot-right')).toBeInTheDocument()
			expect(screen.getByText('→')).toBeInTheDocument()
		})

		it('не должен рендерить __slot-left без слота left', () => {
			const { container } = render(BaseButton, {
				slots: { default: 'Текст' },
			})

			expect(container.querySelector('.base-button__slot-left')).not.toBeInTheDocument()
		})

		it('не должен рендерить __slot-right без слота right', () => {
			const { container } = render(BaseButton, {
				slots: { default: 'Текст' },
			})

			expect(container.querySelector('.base-button__slot-right')).not.toBeInTheDocument()
		})
	})

	describe('пропс padding', () => {
		it('должен устанавливать CSS-переменные padding по умолчанию (10)', () => {
			const { container } = render(BaseButton, {
				slots: { default: 'Кнопка' },
			})

			const btn = container.firstElementChild as HTMLElement
			expect(btn.style.getPropertyValue('--btn-pad-top')).toBe('10px')
			expect(btn.style.getPropertyValue('--btn-pad-bottom')).toBe('10px')
			expect(btn.style.getPropertyValue('--btn-pad-left')).toBe('20px')
			expect(btn.style.getPropertyValue('--btn-pad-right')).toBe('20px')
		})

		it('должен устанавливать CSS-переменные padding при padding=6', () => {
			const { container } = render(BaseButton, {
				props: { padding: 6 },
				slots: { default: 'Кнопка' },
			})

			const btn = container.firstElementChild as HTMLElement
			expect(btn.style.getPropertyValue('--btn-pad-top')).toBe('6px')
			expect(btn.style.getPropertyValue('--btn-pad-left')).toBe('12px')
		})

		it('должен поддерживать объектный padding с точечными сторонами', () => {
			const { container } = render(BaseButton, {
				props: { padding: { x: 8, y: 4, left: 16 } },
				slots: { default: 'Кнопка' },
			})

			const btn = container.firstElementChild as HTMLElement
			expect(btn.style.getPropertyValue('--btn-pad-top')).toBe('4px')
			expect(btn.style.getPropertyValue('--btn-pad-bottom')).toBe('4px')
			expect(btn.style.getPropertyValue('--btn-pad-right')).toBe('8px')
			expect(btn.style.getPropertyValue('--btn-pad-left')).toBe('16px')
		})
	})

	describe('emit click', () => {
		it('должен эмитить click при клике на активную кнопку', async () => {
			const { emitted } = render(BaseButton, { slots: { default: 'Кнопка' } })

			const button = screen.getByRole('button')
			await fireEvent.click(button)

			expect(emitted()).toHaveProperty('click')
		})

		it('не должен эмитить click когда isDisabled=true', async () => {
			const { emitted } = render(BaseButton, {
				props: { isDisabled: true },
				slots: { default: 'Кнопка' },
			})

			const button = screen.getByRole('button')
			await fireEvent.click(button)

			expect(emitted()).not.toHaveProperty('click')
		})

		it('не должен эмитить click когда isLoading=true', async () => {
			const { emitted } = render(BaseButton, {
				props: { isLoading: true },
				slots: { default: 'Кнопка' },
			})

			const button = screen.getByRole('button')
			await fireEvent.click(button)

			expect(emitted()).not.toHaveProperty('click')
		})
	})

	describe('пропс customClass', () => {
		it('должен добавлять строку класса к корневому элементу', () => {
			const { container } = render(BaseButton, {
				props: { customClass: 'my-custom-btn-class' },
				slots: { default: 'Кнопка' },
			})

			expect(container.firstElementChild?.classList.contains('my-custom-btn-class')).toBe(true)
		})

		it('должен добавлять объект класса к корневому элементу', () => {
			const { container } = render(BaseButton, {
				props: { customClass: { root: 'my-custom-btn-root' } },
				slots: { default: 'Кнопка' },
			})

			expect(container.firstElementChild?.classList.contains('my-custom-btn-root')).toBe(true)
		})
	})
})
