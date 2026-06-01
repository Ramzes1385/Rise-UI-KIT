/**
 * Unit-тесты для BaseSideBar.
 * Проверяют рендер, пропсы, CSS-модификаторы, вычисляемые свойства и слоты.
 */

import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import { nextTick } from 'vue'

import BaseSideBar from './BaseSideBar.vue'

/** Заглушки внутренних компонентов UI Kit */
const STUBS = {
	BaseButton: {
		template:
			'<button :aria-label="$attrs[\'aria-label\']" :class="[\'base-sidebar__toggle\', customClass]" @click="$emit(\'click\')"><slot /></button>',
		inheritAttrs: false,
		props: ['customClass'],
	},
	BaseIcon: { template: '<span class="base-icon" />' },
	BaseText: { template: '<span :class="customClass"><slot /></span>', props: ['customClass'] },
	BaseTooltip: { template: '<div class="base-tooltip-wrapper"><slot /></div>' },
	BaseSkeleton: { template: '<div class="base-skeleton" />' },
}

describe('BaseSideBar unit', () => {
	describe('рендер', () => {
		it('должен рендерить aside-контейнер', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Навигация' },
				global: { stubs: STUBS },
			})

			expect(container.querySelector('.base-sidebar')).toBeInTheDocument()
		})

		it('должен рендерить заголовок', () => {
			render(BaseSideBar, {
				props: { title: 'Навигация' },
				global: { stubs: STUBS },
			})

			expect(screen.getByText('Навигация')).toBeInTheDocument()
		})

		it('должен иметь role="complementary"', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест' },
				global: { stubs: STUBS },
			})

			expect(container.querySelector('.base-sidebar')).toHaveAttribute('role', 'complementary')
		})

		it('должен рендерить header когда есть title', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест' },
				global: { stubs: STUBS },
			})

			expect(container.querySelector('.base-sidebar__header')).toBeInTheDocument()
		})

		it('должен рендерить header когда isCollapsible=true', () => {
			const { container } = render(BaseSideBar, {
				props: { isCollapsible: true },
				global: { stubs: STUBS },
			})

			expect(container.querySelector('.base-sidebar__header')).toBeInTheDocument()
		})

		it('не должен рендерить header без title и isCollapsible=false', () => {
			const { container } = render(BaseSideBar, {
				props: { isCollapsible: false },
				global: { stubs: STUBS },
			})

			expect(container.querySelector('.base-sidebar__header')).not.toBeInTheDocument()
		})

		it('должен рендерить body при наличии слота default', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест' },
				slots: { default: 'Контент' },
				global: { stubs: STUBS },
			})

			expect(container.querySelector('.base-sidebar__body')).toBeInTheDocument()
		})

		it('должен рендерить collapsed-контейнер при наличии слота collapsedContent', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест', isCollapsed: true },
				slots: { collapsedContent: 'Сжато' },
				global: { stubs: STUBS },
			})

			expect(container.querySelector('.base-sidebar__collapsed')).toBeInTheDocument()
		})
	})

	describe('пропс variant', () => {
		it('не должен добавлять модификатор для default', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест' },
				global: { stubs: STUBS },
			})

			expect(container.firstElementChild?.classList.contains('base-sidebar--default')).toBe(false)
		})

		it('должен применять модификатор --ghost', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест', variant: 'ghost' },
				global: { stubs: STUBS },
			})

			expect(container.firstElementChild?.classList.contains('base-sidebar--ghost')).toBe(true)
		})

		it('должен применять модификатор --outline', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест', variant: 'outline' },
				global: { stubs: STUBS },
			})

			expect(container.firstElementChild?.classList.contains('base-sidebar--outline')).toBe(true)
		})

		it('должен применять модификатор --shadow', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест', variant: 'shadow' },
				global: { stubs: STUBS },
			})

			expect(container.firstElementChild?.classList.contains('base-sidebar--shadow')).toBe(true)
		})

		it('должен применять модификатор --soft', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест', variant: 'soft' },
				global: { stubs: STUBS },
			})

			expect(container.firstElementChild?.classList.contains('base-sidebar--soft')).toBe(true)
		})
	})

	describe('пропс isCollapsed', () => {
		it('должен применять модификатор --collapsed когда true', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест', isCollapsed: true },
				global: { stubs: STUBS },
			})

			expect(container.firstElementChild?.classList.contains('base-sidebar--collapsed')).toBe(true)
		})

		it('не должен применять модификатор --collapsed когда false', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест', isCollapsed: false },
				global: { stubs: STUBS },
			})

			expect(container.firstElementChild?.classList.contains('base-sidebar--collapsed')).toBe(false)
		})

		it('не должен применять модификатор --collapsed когда undefined', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест' },
				global: { stubs: STUBS },
			})

			expect(container.firstElementChild?.classList.contains('base-sidebar--collapsed')).toBe(false)
		})
	})

	describe('пропс isCollapsible', () => {
		it('должен рендерить кнопку сворачивания когда isCollapsible=true', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест', isCollapsible: true },
				global: { stubs: STUBS },
			})

			const toggle = container.querySelector('.base-sidebar__toggle')
			expect(toggle).toBeInTheDocument()
		})

		it('не должен рендерить кнопку сворачивания когда isCollapsible=false', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест', isCollapsible: false },
				global: { stubs: STUBS },
			})

			const toggle = container.querySelector('.base-sidebar__toggle')
			expect(toggle).not.toBeInTheDocument()
		})
	})

	describe('пропс width', () => {
		it('должен устанавливать CSS-переменную ширины', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест', width: 320 },
				global: { stubs: STUBS },
			})

			const root = container.querySelector('.base-sidebar') as HTMLElement
			expect(root.style.getPropertyValue('--sidebar-width')).toBe('320px')
		})

		it('должен устанавливать дефолтную CSS-переменную ширины', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест' },
				global: { stubs: STUBS },
			})

			const root = container.querySelector('.base-sidebar') as HTMLElement
			expect(root.style.getPropertyValue('--sidebar-width')).toBe('280px')
		})
	})

	describe('пропс collapsedWidth', () => {
		it('должен устанавливать CSS-переменную collapsedWidth', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест', collapsedWidth: 80 },
				global: { stubs: STUBS },
			})

			const root = container.querySelector('.base-sidebar') as HTMLElement
			expect(root.style.getPropertyValue('--sidebar-collapsed-width')).toBe('80px')
		})

		it('должен устанавливать дефолтную CSS-переменную collapsedWidth', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест' },
				global: { stubs: STUBS },
			})

			const root = container.querySelector('.base-sidebar') as HTMLElement
			expect(root.style.getPropertyValue('--sidebar-collapsed-width')).toBe('64px')
		})
	})

	describe('пропс padding', () => {
		it('должен устанавливать CSS-переменную padding', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест', padding: 16 },
				global: { stubs: STUBS },
			})

			const root = container.querySelector('.base-sidebar') as HTMLElement
			expect(root.style.getPropertyValue('--sidebar-pad-left')).toBe('32px')
			expect(root.style.getPropertyValue('--sidebar-pad-top')).toBe('16px')
		})

		it('должен устанавливать дефолтную CSS-переменную padding', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест' },
				global: { stubs: STUBS },
			})

			const root = container.querySelector('.base-sidebar') as HTMLElement
			expect(root.style.getPropertyValue('--sidebar-pad-left')).toBe('24px')
		})

		it('должен поддерживать объектный padding с точечными сторонами', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест', padding: { x: 20, y: 10, top: 4 } },
				global: { stubs: STUBS },
			})

			const root = container.querySelector('.base-sidebar') as HTMLElement
			expect(root.style.getPropertyValue('--sidebar-pad-top')).toBe('4px')
			expect(root.style.getPropertyValue('--sidebar-pad-bottom')).toBe('10px')
			expect(root.style.getPropertyValue('--sidebar-pad-left')).toBe('20px')
		})
	})

	describe('пропс gap', () => {
		it('должен устанавливать CSS-переменную gap', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест', gap: 8 },
				global: { stubs: STUBS },
			})

			const root = container.querySelector('.base-sidebar') as HTMLElement
			expect(root.style.getPropertyValue('--sidebar-gap')).toBe('8px')
		})

		it('должен устанавливать дефолтную CSS-переменную gap', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест' },
				global: { stubs: STUBS },
			})

			const root = container.querySelector('.base-sidebar') as HTMLElement
			expect(root.style.getPropertyValue('--sidebar-gap')).toBe('0px')
		})
	})

	describe('пропс isLoading', () => {
		it('должен рендерить скелетон при isLoading=true', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест', isLoading: true },
				global: { stubs: STUBS },
			})

			expect(container.querySelector('.base-sidebar__loading')).toBeInTheDocument()
			expect(container.querySelectorAll('.base-skeleton')).toHaveLength(4)
		})

		it('не должен рендерить скелетон при isLoading=false', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест', isLoading: false },
				global: { stubs: STUBS },
			})

			expect(container.querySelector('.base-sidebar__loading')).not.toBeInTheDocument()
		})

		it('не должен рендерить навигацию при isLoading=true', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест', isLoading: true },
				slots: { navigation: 'Меню' },
				global: { stubs: STUBS },
			})

			expect(container.querySelector('.base-sidebar__navigation')).not.toBeInTheDocument()
		})

		it('не должен рендерить body при isLoading=true', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест', isLoading: true },
				slots: { default: 'Контент' },
				global: { stubs: STUBS },
			})

			expect(container.querySelector('.base-sidebar__body')).not.toBeInTheDocument()
		})

		it('должен рендерить навигацию при isLoading=false', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест', isLoading: false },
				slots: { navigation: 'Меню' },
				global: { stubs: STUBS },
			})

			expect(container.querySelector('.base-sidebar__navigation')).toBeInTheDocument()
		})
	})

	describe('пропс sizeScale', () => {
		it('не должен устанавливать --size-scale при значении 100', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест', sizeScale: 100 },
				global: { stubs: STUBS },
			})

			const root = container.querySelector('.base-sidebar') as HTMLElement
			expect(root.style.getPropertyValue('--size-scale')).toBe('')
		})

		it('должен устанавливать --size-scale при значении отличном от 100', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест', sizeScale: 150 },
				global: { stubs: STUBS },
			})

			const root = container.querySelector('.base-sidebar') as HTMLElement
			expect(root.style.getPropertyValue('--size-scale')).toBe('1.5')
		})
	})

	describe('BaseTooltip', () => {
		it('должен оборачивать кнопку в tooltip при свёрнутом состоянии', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест', isCollapsed: true, isCollapsible: true },
				global: { stubs: STUBS },
			})

			expect(container.querySelector('.base-tooltip-wrapper')).toBeInTheDocument()
		})

		it('не должен оборачивать кнопку в tooltip при развёрнутом состоянии', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест', isCollapsed: false, isCollapsible: true },
				global: { stubs: STUBS },
			})

			expect(container.querySelector('.base-tooltip-wrapper')).not.toBeInTheDocument()
		})
	})

	describe('слоты', () => {
		it('должен рендерить слот default', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест' },
				slots: { default: 'Контент' },
				global: { stubs: STUBS },
			})

			const body = container.querySelector('.base-sidebar__body')
			expect(body).toHaveTextContent('Контент')
		})

		it('должен рендерить слот footer', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест' },
				slots: { footer: 'Подвал' },
				global: { stubs: STUBS },
			})

			const footer = container.querySelector('.base-sidebar__footer')
			expect(footer).toHaveTextContent('Подвал')
		})

		it('должен рендерить слот navigation', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест' },
				slots: { navigation: 'Меню' },
				global: { stubs: STUBS },
			})

			const nav = container.querySelector('.base-sidebar__navigation')
			expect(nav).toHaveTextContent('Меню')
		})

		it('должен рендерить слот collapsedContent', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест', isCollapsed: true },
				slots: { collapsedContent: 'Сжато' },
				global: { stubs: STUBS },
			})

			const collapsed = container.querySelector('.base-sidebar__collapsed')
			expect(collapsed).toHaveTextContent('Сжато')
		})

		it('должен рендерить слот header вместо title', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест' },
				slots: { header: 'Кастомный заголовок' },
				global: { stubs: STUBS },
			})

			const header = container.querySelector('.base-sidebar__header')
			expect(header).toHaveTextContent('Кастомный заголовок')
		})

		it('не должен рендерить footer без слота', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест' },
				global: { stubs: STUBS },
			})

			expect(container.querySelector('.base-sidebar__footer')).not.toBeInTheDocument()
		})

		it('не должен рендерить navigation без слота', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест' },
				global: { stubs: STUBS },
			})

			expect(container.querySelector('.base-sidebar__navigation')).not.toBeInTheDocument()
		})
	})

	describe('aria-label кнопки', () => {
		it('должен показывать "Свернуть" когда развёрнут', () => {
			render(BaseSideBar, {
				props: { title: 'Тест', isCollapsed: false },
				global: { stubs: STUBS },
			})

			expect(screen.getByLabelText('Свернуть')).toBeInTheDocument()
		})

		it('должен показывать "Развернуть" когда свёрнут', () => {
			render(BaseSideBar, {
				props: { title: 'Тест', isCollapsed: true },
				global: { stubs: STUBS },
			})

			expect(screen.getByLabelText('Развернуть')).toBeInTheDocument()
		})
	})

	describe('toggleIcon (вычисляемая иконка)', () => {
		it('должен показывать иконку menu', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест', isCollapsible: true },
				global: { stubs: STUBS },
			})

			const icon = container.querySelector('.base-icon')
			expect(icon).toBeInTheDocument()
		})
	})

	describe('пропс color', () => {
		it('должен применять кастомные CSS-переменные цвета', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест', color: { bg: { base: '#1e293b' }, text: { base: '#e2e8f0' } } },
				global: { stubs: STUBS },
			})

			const root = container.querySelector('.base-sidebar') as HTMLElement
			expect(root.style.getPropertyValue('--custom-bg')).toBeTruthy()
		})
	})

	describe('комбинации пропсов', () => {
		it('должен применять --collapsed и --outline одновременно', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест', variant: 'outline', isCollapsed: true },
				global: { stubs: STUBS },
			})

			const el = container.firstElementChild
			expect(el?.classList.contains('base-sidebar--outline')).toBe(true)
			expect(el?.classList.contains('base-sidebar--collapsed')).toBe(true)
		})

		it('должен применять --collapsed и --ghost одновременно', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест', variant: 'ghost', isCollapsed: true },
				global: { stubs: STUBS },
			})

			const el = container.firstElementChild
			expect(el?.classList.contains('base-sidebar--ghost')).toBe(true)
			expect(el?.classList.contains('base-sidebar--collapsed')).toBe(true)
		})

		it('должен применять variant и isCollapsed одновременно', () => {
			const { container } = render(BaseSideBar, {
				props: { title: 'Тест', variant: 'shadow', isCollapsed: true },
				global: { stubs: STUBS },
			})

			const el = container.firstElementChild
			expect(el?.classList.contains('base-sidebar--shadow')).toBe(true)
			expect(el?.classList.contains('base-sidebar--collapsed')).toBe(true)
		})
	})

	describe('handleToggle', () => {
		it('должен эмитить update:isCollapsed при клике по кнопке', async () => {
			const { container, emitted } = render(BaseSideBar, {
				props: { title: 'Тест', isCollapsible: true },
				global: { stubs: STUBS },
			})

			const toggle = container.querySelector('.base-sidebar__toggle') as HTMLElement
			await fireEvent.click(toggle)

			expect(emitted()['update:isCollapsed']).toBeTruthy()
			expect(emitted()['update:isCollapsed'][0]).toEqual([true])
		})

		it('должен изменять внутреннее состояние когда isCollapsed не задан (uncontrolled)', async () => {
			const { container, emitted } = render(BaseSideBar, {
				props: { title: 'Тест', isCollapsible: true, isCollapsed: undefined },
				global: { stubs: STUBS },
			})

			const toggle = container.querySelector('.base-sidebar__toggle') as HTMLElement
			await fireEvent.click(toggle)
			await nextTick()

			expect(container.firstElementChild?.classList.contains('base-sidebar--collapsed')).toBe(true)
			expect(emitted()['update:isCollapsed'][0]).toEqual([true])
			expect(emitted().collapse).toBeTruthy()
		})

		it('не должен менять внутреннее состояние когда isCollapsed задан (controlled)', async () => {
			const { container, emitted } = render(BaseSideBar, {
				props: { title: 'Тест', isCollapsible: true, isCollapsed: false },
				global: { stubs: STUBS },
			})

			const toggle = container.querySelector('.base-sidebar__toggle') as HTMLElement
			await fireEvent.click(toggle)

			expect(container.firstElementChild?.classList.contains('base-sidebar--collapsed')).toBe(false)
			expect(emitted()['update:isCollapsed'][0]).toEqual([true])
		})

		it('должен эмитить событие collapse при сворачивании', async () => {
			const { container, emitted } = render(BaseSideBar, {
				props: { title: 'Тест', isCollapsible: true, isCollapsed: false },
				global: { stubs: STUBS },
			})

			const toggle = container.querySelector('.base-sidebar__toggle') as HTMLElement
			await fireEvent.click(toggle)

			expect(emitted().collapse).toBeTruthy()
			expect(emitted().expand).toBeFalsy()
		})

		it('должен эмитить событие expand при раскрытии', async () => {
			const { container, emitted } = render(BaseSideBar, {
				props: { title: 'Тест', isCollapsible: true, isCollapsed: true },
				global: { stubs: STUBS },
			})

			const toggle = container.querySelector('.base-sidebar__toggle') as HTMLElement
			await fireEvent.click(toggle)

			expect(emitted().expand).toBeTruthy()
			expect(emitted().collapse).toBeFalsy()
		})
	})

	describe('синхронизация isCollapsed', () => {
		it('должен синхронизировать внутреннее состояние при изменении пропса', async () => {
			const { container, rerender } = render(BaseSideBar, {
				props: { title: 'Тест', isCollapsed: false },
				global: { stubs: STUBS },
			})

			expect(container.firstElementChild?.classList.contains('base-sidebar--collapsed')).toBe(false)

			await rerender({ title: 'Тест', isCollapsed: true })

			expect(container.firstElementChild?.classList.contains('base-sidebar--collapsed')).toBe(true)
		})
	})

	describe('пропс customClass', () => {
		it('должен добавлять строку класса к корневому элементу', () => {
			const { container } = render(BaseSideBar, {
				props: { customClass: 'custom-sidebar-class' },
				global: { stubs: STUBS },
			})

			expect(container.querySelector('.base-sidebar')).toHaveClass('custom-sidebar-class')
		})

		it('должен распределять объект классов по внутренним элементам', () => {
			const { container } = render(BaseSideBar, {
				props: {
					title: 'Навигация',
					customClass: {
						root: 'custom-root',
						header: 'custom-header',
						title: 'custom-title',
					},
				},
				global: { stubs: STUBS },
			})

			expect(container.querySelector('.base-sidebar')).toHaveClass('custom-root')
			expect(container.querySelector('.base-sidebar__header')).toHaveClass('custom-header')
			expect(container.querySelector('.base-sidebar__title')).toHaveClass('custom-title')
		})
	})
})
