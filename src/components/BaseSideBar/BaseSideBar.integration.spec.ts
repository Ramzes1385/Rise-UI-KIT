/**
 * Integration-тесты для BaseSideBar.
 * Проверяют взаимодействие: сворачивание/разворачивание, emits, v-model,
 * контролируемый/неконтролируемый режимы, синхронизацию с пропсом.
 * Используются реальные дочерние компоненты для корректной работы событий.
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'

import BaseSideBar from './BaseSideBar.vue'

describe('BaseSideBar integration', () => {
	describe('сворачивание/разворачивание', () => {
		it('должен эмитить collapse при клике на кнопку', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseSideBar, {
				props: { title: 'Навигация' },
			})

			const toggle = screen.getByRole('button', { name: 'Свернуть' })
			await user.click(toggle)

			expect(emitted()).toHaveProperty('update:isCollapsed')
			expect(emitted()).toHaveProperty('collapse')
		})

		it('должен эмитить expand при разворачивании', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseSideBar, {
				props: { title: 'Навигация', isCollapsed: true },
			})

			const toggle = screen.getByRole('button', { name: 'Развернуть' })
			await user.click(toggle)

			expect(emitted()).toHaveProperty('expand')
		})
	})

	describe('v-model isCollapsed', () => {
		it('должен эмитить update:isCollapsed=true при сворачивании', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseSideBar, {
				props: { title: 'Навигация' },
			})

			const toggle = screen.getByRole('button', { name: 'Свернуть' })
			await user.click(toggle)

			const events = emitted()['update:isCollapsed'] as unknown[]
			expect(events).toBeTruthy()
			expect((events[0] as unknown[])[0]).toBe(true)
		})

		it('должен эмитить update:isCollapsed=false при разворачивании', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseSideBar, {
				props: { title: 'Навигация', isCollapsed: true },
			})

			const toggle = screen.getByRole('button', { name: 'Развернуть' })
			await user.click(toggle)

			const events = emitted()['update:isCollapsed'] as unknown[]
			expect(events).toBeTruthy()
			expect((events[0] as unknown[])[0]).toBe(false)
		})
	})

	describe('контролируемый режим', () => {
		it('не должен обновлять внутреннее состояние в контролируемом режиме', async () => {
			const user = userEvent.setup()
			const { container, emitted } = render(BaseSideBar, {
				props: { title: 'Навигация', isCollapsed: false },
			})

			const sidebar = container.querySelector('.base-sidebar')
			expect(sidebar?.classList.contains('base-sidebar--collapsed')).toBe(false)

			await user.click(screen.getByRole('button', { name: 'Свернуть' }))

			// Эмит произошёл
			const events = emitted()['update:isCollapsed'] as unknown[]
			expect(events).toBeTruthy()
			expect((events[0] as unknown[])[0]).toBe(true)

			// Класс не изменился — пропс isCollapsed всё ещё false
			expect(sidebar?.classList.contains('base-sidebar--collapsed')).toBe(false)
		})

		it('должен отражать изменение пропса isCollapsed', async () => {
			const { container, rerender } = render(BaseSideBar, {
				props: { title: 'Тест', isCollapsed: false },
			})

			expect(container.querySelector('.base-sidebar')?.classList.contains('base-sidebar--collapsed')).toBe(false)

			await rerender({ isCollapsed: true })

			expect(container.querySelector('.base-sidebar')?.classList.contains('base-sidebar--collapsed')).toBe(true)
		})
	})

	describe('несворачиваемый сайдбар', () => {
		it('не должен рендерить кнопку сворачивания', () => {
			render(BaseSideBar, {
				props: { title: 'Тест', isCollapsible: false },
			})

			const toggle = screen.queryByRole('button', { name: 'Свернуть' })
			expect(toggle).not.toBeInTheDocument()
		})

		it('не должен иметь кнопку с aria-label "Развернуть"', () => {
			render(BaseSideBar, {
				props: { title: 'Тест', isCollapsible: false },
			})

			const toggle = screen.queryByRole('button', { name: 'Развернуть' })
			expect(toggle).not.toBeInTheDocument()
		})
	})

	describe('слоты', () => {
		it('должен отображать контент слота navigation', () => {
			render(BaseSideBar, {
				props: { title: 'Тест' },
				slots: { navigation: 'Меню навигации' },
			})

			expect(screen.getByText('Меню навигации')).toBeInTheDocument()
		})

		it('должен отображать контент слота footer', () => {
			render(BaseSideBar, {
				props: { title: 'Тест' },
				slots: { footer: 'Подвал' },
			})

			expect(screen.getByText('Подвал')).toBeInTheDocument()
		})

		it('должен отображать контент слота collapsedContent при сворачивании', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест', isCollapsed: true },
				slots: { collapsedContent: 'Сжатый контент' },
			})

			expect(screen.getByText('Сжатый контент')).toBeInTheDocument()
			expect(container.querySelector('.base-sidebar__collapsed')).toHaveTextContent('Сжатый контент')
		})

		it('должен отображать слот header вместо title', () => {
			render(BaseSideBar, {
				props: { title: 'Заголовок' },
				slots: { header: 'Кастомный заголовок' },
			})

			expect(screen.getByText('Кастомный заголовок')).toBeInTheDocument()
		})

		it('должен отображать слот default', () => {
			render(BaseSideBar, {
				props: { title: 'Тест' },
				slots: { default: 'Основной контент' },
			})

			expect(screen.getByText('Основной контент')).toBeInTheDocument()
		})
	})

	describe('синхронизация с внешним пропсом', () => {
		it('должен обновлять состояние при изменении isCollapsed извне', async () => {
			const { container, rerender } = render(BaseSideBar, {
				props: { title: 'Тест', isCollapsed: false },
			})

			expect(container.querySelector('.base-sidebar')?.classList.contains('base-sidebar--collapsed')).toBe(false)

			await rerender({ isCollapsed: true })

			expect(container.querySelector('.base-sidebar')?.classList.contains('base-sidebar--collapsed')).toBe(true)
		})

		it('должен обновлять aria-label при изменении isCollapsed извне', async () => {
			const { rerender } = render(BaseSideBar, {
				props: { title: 'Тест', isCollapsed: false },
			})

			expect(screen.getByRole('button', { name: 'Свернуть' })).toBeInTheDocument()

			await rerender({ isCollapsed: true })

			expect(screen.getByRole('button', { name: 'Развернуть' })).toBeInTheDocument()
		})
	})

	describe('варианты отображения', () => {
		it('должен применять модификатор --ghost', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест', variant: 'ghost' },
			})

			expect(container.querySelector('.base-sidebar')?.classList.contains('base-sidebar--ghost')).toBe(true)
		})

		it('должен применять модификатор --outline', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест', variant: 'outline' },
			})

			expect(container.querySelector('.base-sidebar')?.classList.contains('base-sidebar--outline')).toBe(true)
		})

		it('должен применять модификатор --shadow', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест', variant: 'shadow' },
			})

			expect(container.querySelector('.base-sidebar')?.classList.contains('base-sidebar--shadow')).toBe(true)
		})

		it('должен применять модификатор --soft', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест', variant: 'soft' },
			})

			expect(container.querySelector('.base-sidebar')?.classList.contains('base-sidebar--soft')).toBe(true)
		})
	})

	describe('пропс collapsedWidth', () => {
		it('должен устанавливать CSS-переменную collapsedWidth', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест', collapsedWidth: 80 },
			})

			const root = container.querySelector('.base-sidebar') as HTMLElement
			expect(root.style.getPropertyValue('--sidebar-collapsed-width')).toBe('80px')
		})
	})

	describe('пропс isLoading', () => {
		it('должен рендерить скелетон при isLoading=true', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест', isLoading: true },
			})

			expect(container.querySelector('.base-sidebar__loading')).toBeInTheDocument()
		})

		it('не должен рендерить скелетон при isLoading=false', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест', isLoading: false },
			})

			expect(container.querySelector('.base-sidebar__loading')).not.toBeInTheDocument()
		})

		it('не должен рендерить навигацию при isLoading=true', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест', isLoading: true },
				slots: { navigation: 'Меню' },
			})

			expect(container.querySelector('.base-sidebar__navigation')).not.toBeInTheDocument()
		})

		it('не должен рендерить body при isLoading=true', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест', isLoading: true },
				slots: { default: 'Контент' },
			})

			expect(container.querySelector('.base-sidebar__body')).not.toBeInTheDocument()
		})
	})

	describe('пропс padding', () => {
		it('должен устанавливать CSS-переменную padding', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест', padding: 16 },
			})

			const root = container.querySelector('.base-sidebar') as HTMLElement
			expect(root.style.getPropertyValue('--sidebar-pad-left')).toBe('32px')
		})
	})

	describe('последовательность эмитов', () => {
		it('должен эмитить collapse при первом клике', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseSideBar, {
				props: { title: 'Навигация' },
			})

			await user.click(screen.getByRole('button', { name: 'Свернуть' }))

			expect(emitted()).toHaveProperty('collapse')
			const collapseEvents = emitted()['collapse'] as unknown[]
			expect(collapseEvents).toHaveLength(1)
		})

		it('должен эмитить expand при разворачивании из свёрнутого состояния', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseSideBar, {
				props: { title: 'Навигация', isCollapsed: true },
			})

			await user.click(screen.getByRole('button', { name: 'Развернуть' }))

			expect(emitted()).toHaveProperty('expand')
			const expandEvents = emitted()['expand'] as unknown[]
			expect(expandEvents).toHaveLength(1)
		})
	})
})
