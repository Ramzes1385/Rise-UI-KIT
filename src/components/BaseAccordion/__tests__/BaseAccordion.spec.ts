/**
 * Unit-тесты для BaseAccordion.
 * Проверяют рендер, пропсы, вычисления и простые ветки логики.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen, waitFor } from '@testing-library/vue'
import BaseAccordion from '../ui/BaseAccordion.vue'
import type { BaseAccordionItem } from '../model/BaseAccordion.types'

/** Стандартный набор элементов для тестов */
const ITEMS: BaseAccordionItem[] = [
	{ label: 'Материалы', content: 'Работаем с металлом' },
	{ label: 'Доставка', content: 'Доставка по всей России' },
	{ label: 'Гарантия', content: 'Гарантия 2 года', isDisabled: true },
]

describe('BaseAccordion unit', () => {
	describe('рендер', () => {
		it('должен рендерить все заголовки элементов', () => {
			const { container } = render(BaseAccordion, { props: { items: ITEMS } })

			const headers = container.querySelectorAll('.base-accordion__header')
			expect(headers).toHaveLength(ITEMS.length)
		})

		it('должен рендерить текст заголовка каждого элемента', () => {
			render(BaseAccordion, { props: { items: ITEMS } })

			ITEMS.forEach(item => {
				expect(screen.getByText(item.label)).toBeInTheDocument()
			})
		})

		it('должен рендерить контент элемента', () => {
			render(BaseAccordion, { props: { items: ITEMS } })

			expect(screen.getByText('Работаем с металлом')).toBeInTheDocument()
		})

		it('должен рендерить один элемент корректно', () => {
			const singleItem: BaseAccordionItem[] = [{ label: 'О нас', content: 'Мастерская ковки' }]

			render(BaseAccordion, { props: { items: singleItem } })

			expect(screen.getByText('О нас')).toBeInTheDocument()
			expect(screen.getByText('Мастерская ковки')).toBeInTheDocument()
		})
	})

	describe('пропс variant', () => {
		it('должен применять модификатор --ghost когда variant=ghost', () => {
			const { container } = render(BaseAccordion, {
				props: { items: ITEMS, variant: 'ghost' },
			})

			const root = container.firstElementChild
			expect(root?.classList.contains('base-accordion--ghost')).toBe(true)
		})

		it('должен применять модификатор --outline когда variant=outline', () => {
			const { container } = render(BaseAccordion, {
				props: { items: ITEMS, variant: 'outline' },
			})

			const root = container.firstElementChild
			expect(root?.classList.contains('base-accordion--outline')).toBe(true)
		})

		it('не должен добавлять модификатор для варианта default', () => {
			const { container } = render(BaseAccordion, {
				props: { items: ITEMS, variant: 'default' },
			})

			const root = container.firstElementChild
			expect(root?.classList.contains('base-accordion--default')).toBe(false)
		})
	})

	describe('пропс isDisabled', () => {
		it('должен добавлять класс --disabled на отключённый элемент', () => {
			const { container } = render(BaseAccordion, {
				props: { items: ITEMS },
			})

			const disabledItem = container.querySelectorAll('.base-accordion__item--disabled')
			expect(disabledItem).toHaveLength(1)
		})
	})

	describe('пропс defaultOpen', () => {
		it('должен открывать элемент с defaultOpen=true при монтировании', async () => {
			const items: BaseAccordionItem[] = [
				{ label: 'Открытый', content: 'Видимый контент', defaultOpen: true },
				{ label: 'Закрытый', content: 'Скрытый контент' },
			]

			const { container } = render(BaseAccordion, { props: { items } })

			await waitFor(() => {
				const openItems = container.querySelectorAll('.base-accordion__item--open')
				expect(openItems).toHaveLength(1)
			})
		})

		it('должен открывать несколько элементов с defaultOpen=true при isMultiple', async () => {
			const items: BaseAccordionItem[] = [
				{ label: 'Первый', content: 'Контент 1', defaultOpen: true },
				{ label: 'Второй', content: 'Контент 2', defaultOpen: true },
			]

			const { container } = render(BaseAccordion, {
				props: { items, isMultiple: true },
			})

			await waitFor(() => {
				const openItems = container.querySelectorAll('.base-accordion__item--open')
				expect(openItems).toHaveLength(2)
			})
		})
	})

	describe('стрелка-иконка', () => {
		it('должен рендерить SVG-стрелку в каждом заголовке', () => {
			const { container } = render(BaseAccordion, { props: { items: ITEMS } })

			const arrows = container.querySelectorAll('.base-accordion__arrow svg')
			expect(arrows).toHaveLength(ITEMS.length)
		})
	})

	describe('emit toggle', () => {
		it('должен эмитить toggle при переключении элемента', async () => {
			const { emitted, container } = render(BaseAccordion, {
				props: { items: ITEMS },
			})

			const header = container.querySelector('.base-accordion__header')
			header?.dispatchEvent(new Event('click'))

			const toggleEvents = emitted()['toggle']
			expect(toggleEvents).toBeTruthy()
			expect(toggleEvents?.[0]).toEqual([0, true])
		})
	})

	describe('пропс customClass', () => {
		it('должен добавлять строку класса к корневому элементу', () => {
			const { container } = render(BaseAccordion, {
				props: {
					items: ITEMS,
					customClass: 'custom-accordion-class',
				},
			})

			const root = container.firstElementChild
			expect(root).toHaveClass('custom-accordion-class')
		})

		it('должен распределять объект классов по внутренним элементам', () => {
			const { container } = render(BaseAccordion, {
				props: {
					items: [{ label: 'Материалы', content: 'Работаем с металлом', icon: 'search' }],
					customClass: {
						root: 'custom-root',
						item: 'custom-item',
						header: 'custom-header',
						icon: 'custom-icon',
						label: 'custom-label',
						arrow: 'custom-arrow',
						collapse: 'custom-collapse',
						content: 'custom-content',
					},
				},
			})

			const root = container.firstElementChild
			expect(root).toHaveClass('custom-root')

			const item = container.querySelector('.base-accordion__item')
			expect(item).toHaveClass('custom-item')

			const header = container.querySelector('.base-accordion__header')
			expect(header).toHaveClass('custom-header')

			const icon = container.querySelector('.base-accordion__icon')
			expect(icon).toHaveClass('custom-icon')

			const label = container.querySelector('.base-accordion__label')
			expect(label).toHaveClass('custom-label')

			const arrow = container.querySelector('.base-accordion__arrow')
			expect(arrow).toHaveClass('custom-arrow')

			const collapse = container.querySelector('.base-accordion__collapse')
			expect(collapse).toHaveClass('custom-collapse')

			const content = container.querySelector('.base-accordion__content')
			expect(content).toHaveClass('custom-content')
		})
	})
})
