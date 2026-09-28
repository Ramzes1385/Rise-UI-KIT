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
					expect(container.querySelector('.base-tooltip-popup')?.classList.contains('base-tooltip-popup--ghost')).toBe(true)
				})
			})

			it('должен применять модификатор --outline когда variant=outline', async () => {
				const { container } = render(BaseTooltip, {
					props: { text: 'Подсказка', variant: 'outline', isAlwaysVisible: true },
					slots: { default: '<span>Цель</span>' },
					...renderOptions,
				})

				await waitFor(() => {
					expect(container.querySelector('.base-tooltip-popup')?.classList.contains('base-tooltip-popup--outline')).toBe(true)
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
					const popup = container.querySelector('.base-tooltip-popup') as HTMLElement
					expect(popup.style.getPropertyValue('--size-scale')).toBe('')
				})
			})

			it('должен устанавливать --size-scale когда sizeScale=150', async () => {
				const { container } = render(BaseTooltip, {
					props: { text: 'Подсказка', sizeScale: 150, isAlwaysVisible: true },
					slots: { default: '<span>Цель</span>' },
					...renderOptions,
				})

				await waitFor(() => {
					const popup = container.querySelector('.base-tooltip-popup') as HTMLElement
					expect(popup.style.getPropertyValue('--size-scale')).toBe('1.5')
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
				const popup = container.querySelector('.base-tooltip-popup') as HTMLElement
				expect(popup?.getAttribute('style')).toContain('--custom-text: #ff0000')
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
				expect(container.querySelector('.base-tooltip-popup')?.classList.contains('base-tooltip-popup--shadow')).toBe(true)
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
				expect(container.querySelector('.base-tooltip-popup')?.classList.contains('base-tooltip-popup--soft')).toBe(true)
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

	describe('вариант, масштаб и цвет — у подсказки, а не у обёртки триггера', () => {
		it('обёртка не получает класс варианта, --size-scale и --custom-*: кнопка в слоте не перекрашивается', async () => {
			const { container } = render(BaseTooltip, {
				props: { text: 'Подсказка', variant: 'soft', sizeScale: 125, color: { bg: { base: '#6d28d9' } }, isAlwaysVisible: true },
				slots: { default: '<button>Цель</button>' },
				...renderOptions,
			})

			const wrapper = container.querySelector('.base-tooltip') as HTMLElement
			expect(wrapper.getAttribute('style')).toBeNull()
			expect(wrapper.className).toBe('base-tooltip')

			await waitFor(() => {
				const popup = container.querySelector('.base-tooltip-popup') as HTMLElement
				expect(popup).toHaveClass('base-tooltip-popup--soft')
				expect(popup.style.getPropertyValue('--size-scale')).toBe('1.25')
				expect(popup.style.getPropertyValue('--custom-bg')).toBe('#6d28d9')
			})
		})

		it('подсказка — role="tooltip" с id', async () => {
			render(BaseTooltip, {
				props: { text: 'Подсказка', isAlwaysVisible: true },
				slots: { default: '<button>Цель</button>' },
				...renderOptions,
			})

			const tooltip = await screen.findByRole('tooltip')
			expect(tooltip).toHaveTextContent('Подсказка')
			expect(tooltip.id).not.toBe('')
		})
	})
})

describe('BaseTooltip: доступность и край окна', () => {
	afterEach(() => {
		vi.useRealTimers()
		vi.restoreAllMocks()
	})

	it('кнопка описана подсказкой, пока та на экране; пустой текст не показывается', async () => {
		vi.useFakeTimers()
		const { rerender } = render(BaseTooltip, {
			props: { text: 'Сохранить черновик' },
			slots: { default: '<button type="button">Сохранить</button>' },
		})
		const button = screen.getByRole('button', { name: 'Сохранить' })
		expect(button).not.toHaveAttribute('aria-describedby')

		button.focus()
		await vi.advanceTimersByTimeAsync(200)
		const tooltip = screen.getByRole('tooltip')
		expect(button).toHaveAttribute('aria-describedby', tooltip.id)
		expect(button).toHaveAccessibleDescription('Сохранить черновик')

		await rerender({ text: '' })
		expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
		expect(button).not.toHaveAttribute('aria-describedby')
	})

	it('указатель на подсказке не даёт ей скрыться, уход с подсказки скрывает', async () => {
		vi.useFakeTimers()
		const { container } = render(BaseTooltip, {
			props: { text: 'Подсказка' },
			slots: { default: '<button type="button">Цель</button>' },
		})
		const wrapper = container.querySelector('.base-tooltip') as HTMLElement
		wrapper.dispatchEvent(new MouseEvent('mouseenter'))
		await vi.advanceTimersByTimeAsync(200)
		const tooltip = screen.getByRole('tooltip')

		wrapper.dispatchEvent(new MouseEvent('mouseleave'))
		tooltip.dispatchEvent(new MouseEvent('mouseenter'))
		await vi.advanceTimersByTimeAsync(300)
		expect(screen.getByRole('tooltip')).toBeInTheDocument()

		tooltip.dispatchEvent(new MouseEvent('mouseleave'))
		await vi.advanceTimersByTimeAsync(300)
		expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
	})

	it('у верхнего края переворачивается вниз, у левого края сдвигается внутрь, стрелка смотрит на триггер', async () => {
		vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(120)
		vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(24)
		const { container } = render(BaseTooltip, {
			props: { text: 'Свернуть панель', isAlwaysVisible: true },
			slots: { default: '<button type="button">≡</button>' },
		})
		const wrapper = container.querySelector('.base-tooltip') as HTMLElement
		wrapper.getBoundingClientRect = () =>
			({ top: 4, left: 0, width: 20, height: 20, bottom: 24, right: 20, x: 0, y: 4, toJSON: () => ({}) }) as DOMRect
		await new Promise(resolve => requestAnimationFrame(() => resolve(null)))
		await new Promise(resolve => requestAnimationFrame(() => resolve(null)))

		await waitFor(() => expect(screen.getByRole('tooltip')).toHaveClass('base-tooltip-popup--bottom'))
		const tooltip = screen.getByRole('tooltip')
		// центр триггера 10, половина подсказки 60, отступ от края 8 → точка 68, сдвиг 58
		expect(tooltip.style.left).toBe('68px')
		expect(tooltip.style.getPropertyValue('--tooltip-arrow-offset')).toBe('-58px')
	})
})
