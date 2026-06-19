/**
 * Unit-тесты для BaseTooltip.
 * Проверяют рендер, пропсы и CSS-модификаторы.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen, waitFor } from '@testing-library/vue'
import BaseTooltip from '../ui/BaseTooltip.vue'

/** Опции рендера без заглушек Transition и Teleport */
const renderOptions = {
	global: {
		stubs: {
			Transition: false,
			Teleport: {
				inheritAttrs: true,
				template: '<div><slot /></div>',
			},
		},
	},
}

describe('BaseTooltip unit', () => {
	describe('рендер', () => {
		it('должен рендерить wrapper', () => {
			const { container } = render(BaseTooltip, {
				props: { text: 'Подсказка' },
				slots: { default: '<button>Кнопка</button>' },
				...renderOptions,
			})

			expect(container.querySelector('.base-tooltip')).toBeInTheDocument()
		})

		it('должен рендерить контент слота', () => {
			render(BaseTooltip, {
				props: { text: 'Подсказка' },
				slots: { default: '<span>Цель</span>' },
				...renderOptions,
			})

			expect(screen.getByText('Цель')).toBeInTheDocument()
		})
	})

	describe('пропс isAlwaysVisible', () => {
		it('должен рендерить тултип когда isAlwaysVisible=true', async () => {
			render(BaseTooltip, {
				props: { text: 'Подсказка', isAlwaysVisible: true },
				slots: { default: '<span>Цель</span>' },
				...renderOptions,
			})

			await waitFor(() => {
				expect(screen.getByText('Подсказка')).toBeInTheDocument()
			})
		})

		it('не должен рендерить тултип по умолчанию', () => {
			const { container } = render(BaseTooltip, {
				props: { text: 'Подсказка' },
				slots: { default: '<span>Цель</span>' },
				...renderOptions,
			})

			expect(container.querySelector('.base-tooltip-popup')).not.toBeInTheDocument()
		})
	})

	describe('пропс position', () => {
		it('должен применять модификатор --top по умолчанию', async () => {
			const { container } = render(BaseTooltip, {
				props: { text: 'Подсказка', isAlwaysVisible: true },
				slots: { default: '<span>Цель</span>' },
				...renderOptions,
			})

			await waitFor(() => {
				expect(container.querySelector('.base-tooltip-popup')?.classList.contains('base-tooltip-popup--top')).toBe(true)
			})
		})

		it('должен применять модификатор --bottom когда position=bottom', async () => {
			const { container } = render(BaseTooltip, {
				props: { text: 'Подсказка', position: 'bottom', isAlwaysVisible: true },
				slots: { default: '<span>Цель</span>' },
				...renderOptions,
			})

			await waitFor(() => {
				expect(container.querySelector('.base-tooltip-popup')?.classList.contains('base-tooltip-popup--bottom')).toBe(true)
			})
		})

		describe('пропс text', () => {
			it('должен рендерить текст подсказки когда isAlwaysVisible=true', async () => {
				render(BaseTooltip, {
					props: { text: 'Моя подсказка', isAlwaysVisible: true },
					slots: { default: '<span>Цель</span>' },
					...renderOptions,
				})

				await waitFor(() => {
					expect(screen.getByText('Моя подсказка')).toBeInTheDocument()
				})
			})
		})

		describe('пропс variant', () => {
			it('должен применять модификатор --ghost когда variant=ghost', async () => {
				const { container } = render(BaseTooltip, {
					props: { text: 'Подсказка', variant: 'ghost', isAlwaysVisible: true },
					slots: { default: '<span>Цель</span>' },
					...renderOptions,
				})

				await waitFor(() => {
					expect(container.querySelector('.base-tooltip')?.classList.contains('base-tooltip--ghost')).toBe(true)
				})
			})

			it('должен применять модификатор --outline когда variant=outline', async () => {
				const { container } = render(BaseTooltip, {
					props: { text: 'Подсказка', variant: 'outline', isAlwaysVisible: true },
					slots: { default: '<span>Цель</span>' },
					...renderOptions,
				})

				await waitFor(() => {
					expect(container.querySelector('.base-tooltip')?.classList.contains('base-tooltip--outline')).toBe(true)
				})
			})
		})

		describe('пропс sizeScale', () => {
			it('не должен устанавливать --size-scale когда sizeScale=100', async () => {
				const { container } = render(BaseTooltip, {
					props: { text: 'Подсказка', sizeScale: 100, isAlwaysVisible: true },
					slots: { default: '<span>Цель</span>' },
					...renderOptions,
				})

				await waitFor(() => {
					const wrapper = container.querySelector('.base-tooltip') as HTMLElement
					expect(wrapper.style.getPropertyValue('--size-scale')).toBe('')
				})
			})

			it('должен устанавливать --size-scale когда sizeScale=150', async () => {
				const { container } = render(BaseTooltip, {
					props: { text: 'Подсказка', sizeScale: 150, isAlwaysVisible: true },
					slots: { default: '<span>Цель</span>' },
					...renderOptions,
				})

				await waitFor(() => {
					const wrapper = container.querySelector('.base-tooltip') as HTMLElement
					expect(wrapper.style.getPropertyValue('--size-scale')).toBe('1.5')
				})
			})
		})

		describe('пропс position — left и right', () => {
			it('должен применять модификатор --left когда position=left', async () => {
				const { container } = render(BaseTooltip, {
					props: { text: 'Подсказка', position: 'left', isAlwaysVisible: true },
					slots: { default: '<span>Цель</span>' },
					...renderOptions,
				})

				await waitFor(() => {
					expect(container.querySelector('.base-tooltip-popup')?.classList.contains('base-tooltip-popup--left')).toBe(true)
				})
			})

			it('должен применять модификатор --right когда position=right', async () => {
				const { container } = render(BaseTooltip, {
					props: { text: 'Подсказка', position: 'right', isAlwaysVisible: true },
					slots: { default: '<span>Цель</span>' },
					...renderOptions,
				})

				await waitFor(() => {
					expect(container.querySelector('.base-tooltip-popup')?.classList.contains('base-tooltip-popup--right')).toBe(true)
				})
			})
		})
	})

	describe('пропс color', () => {
		it('должен задавать кастомный цвет через style', async () => {
			const { container } = render(BaseTooltip, {
				props: { text: 'Подсказка', color: { text: { base: '#ff0000' } }, isAlwaysVisible: true },
				slots: { default: '<span>Цель</span>' },
				...renderOptions,
			})

			await waitFor(() => {
				const tooltip = container.querySelector('.base-tooltip') as HTMLElement
				expect(tooltip?.getAttribute('style')).toContain('--custom-text: #ff0000')
			})
		})
	})

	describe('пропс variant — shadow', () => {
		it('должен применять модификатор --shadow когда variant=shadow', async () => {
			const { container } = render(BaseTooltip, {
				props: { text: 'Подсказка', variant: 'shadow', isAlwaysVisible: true },
				slots: { default: '<span>Цель</span>' },
				...renderOptions,
			})

			await waitFor(() => {
				expect(container.querySelector('.base-tooltip')?.classList.contains('base-tooltip--shadow')).toBe(true)
			})
		})
	})

	describe('пропс variant — soft', () => {
		it('должен применять модификатор --soft когда variant=soft', async () => {
			const { container } = render(BaseTooltip, {
				props: { text: 'Подсказка', variant: 'soft', isAlwaysVisible: true },
				slots: { default: '<span>Цель</span>' },
				...renderOptions,
			})

			await waitFor(() => {
				expect(container.querySelector('.base-tooltip')?.classList.contains('base-tooltip--soft')).toBe(true)
			})
		})
	})

	describe('пропс customClass', () => {
		it('должен добавлять строку класса к корневому элементу', () => {
			const { container } = render(BaseTooltip, {
				props: { text: 'Подсказка', customClass: 'custom-tooltip-root' },
				slots: { default: '<span>Цель</span>' },
				...renderOptions,
			})

			expect(container.querySelector('.base-tooltip')?.classList.contains('custom-tooltip-root')).toBe(true)
		})

		it('должен распределять объект классов по внутренним элементам', async () => {
			const { container } = render(BaseTooltip, {
				props: {
					text: 'Подсказка',
					isAlwaysVisible: true,
					customClass: {
						root: 'custom-root',
						tooltip: 'custom-tooltip',
						text: 'custom-text',
					},
				},
				slots: { default: '<span>Цель</span>' },
				...renderOptions,
			})

			expect(container.querySelector('.base-tooltip')?.classList.contains('custom-root')).toBe(true)

			await waitFor(() => {
				const tooltip = container.querySelector('.base-tooltip-popup')
				expect(tooltip?.classList.contains('custom-tooltip')).toBe(true)
				expect(tooltip?.querySelector('.base-text')?.classList.contains('custom-text')).toBe(true)
			})
		})
	})
})
