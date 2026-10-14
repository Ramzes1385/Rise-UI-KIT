import '@testing-library/jest-dom/vitest'
import BaseAccordion from '../ui/BaseAccordion.vue'
import { render, screen, waitFor } from '@testing-library/vue'
import type { BaseAccordionItem } from '../types/BaseAccordion.types'

const ITEMS: BaseAccordionItem[] = [
	{ label: 'Материалы', content: 'Работаем с металлом' },
	{ label: 'Доставка', content: 'Доставка по всей России' },
	{ label: 'Гарантия', content: 'Гарантия 2 года', isDisabled: true },
]

describe('BaseAccordion unit', () => {
	it('без items рисует пустой аккордеон и не падает (ACC-5)', () => {
		const { container } = render(BaseAccordion)

		expect(container.querySelector('.base-accordion')).toBeInTheDocument()
		expect(container.querySelectorAll('button')).toHaveLength(0)
	})

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

	describe('настройка вида', () => {
		it('по умолчанию: стрелка справа, плотность default, без линии, акцента и замены значка', () => {
			const { container } = render(BaseAccordion, { props: { items: ITEMS } })

			const root = container.querySelector('.base-accordion')
			expect(root).toHaveClass('base-accordion--arrow-end', 'base-accordion--density-default')
			expect(root?.className).not.toMatch(/--divider-|--icon-swap|--accented/)
			expect(container.querySelectorAll('.base-accordion__arrow')).toHaveLength(ITEMS.length)
		})

		it('классы arrowPosition, divider, density, isAccented и variant=separated', () => {
			const { container } = render(BaseAccordion, {
				props: {
					items: ITEMS,
					arrowPosition: 'start',
					divider: 'dashed',
					density: 'compact',
					isAccented: true,
					variant: 'separated',
				},
			})

			expect(container.querySelector('.base-accordion')).toHaveClass(
				'base-accordion--separated',
				'base-accordion--arrow-start',
				'base-accordion--divider-dashed',
				'base-accordion--density-compact',
				'base-accordion--accented',
			)
		})

		it('showArrow=false убирает стрелку, пункт раскрывается кликом по заголовку', async () => {
			const { container } = render(BaseAccordion, { props: { items: ITEMS, showArrow: false } })

			expect(container.querySelector('.base-accordion__arrow')).not.toBeInTheDocument()
			expect(container.querySelector('.base-accordion')?.className).not.toMatch(/--arrow-/)
			const header = screen.getByRole('button', { name: 'Материалы' })
			header.click()
			await waitFor(() => expect(header).toHaveAttribute('aria-expanded', 'true'))
		})

		it('expandIcon и collapseIcon: значок меняется у открытого пункта без поворота', async () => {
			const { container } = render(BaseAccordion, {
				props: {
					items: [{ label: 'Материалы', content: 'Металл', defaultOpen: true }, ITEMS[1]],
					expandIcon: 'plus',
					collapseIcon: 'minus',
				},
			})

			expect(container.querySelector('.base-accordion')).toHaveClass('base-accordion--icon-swap')
			await waitFor(() => {
				const uses = [...container.querySelectorAll('.base-accordion__arrow use')].map(use => use.getAttribute('href'))
				expect(uses[0]).toContain('minus')
				expect(uses[1]).toContain('plus')
			})
		})

		it('description — пояснение под заголовком: описание кнопки, а не часть имени', () => {
			render(BaseAccordion, {
				props: {
					items: [{ label: 'Оплата', description: 'Карта и СБП', content: 'Текст' }],
					customClass: { description: 'custom-description' },
				},
			})

			const header = screen.getByRole('button', { name: 'Оплата' })
			expect(header).toHaveAccessibleDescription('Карта и СБП')
			expect(screen.getByText('Карта и СБП')).toHaveClass('base-accordion__description', 'custom-description')
			expect(screen.getByRole('region', { hidden: true })).toHaveAttribute('aria-labelledby', `${header.id}-label`)
		})
	})
})
