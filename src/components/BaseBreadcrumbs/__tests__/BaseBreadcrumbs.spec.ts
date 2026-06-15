/**
 * Unit-тесты для BaseBreadcrumbs.
 * Проверяют рендер, пропсы, collapsed-логику и CSS-модификаторы.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'

import type { BreadcrumbItem } from '../model/BaseBreadcrumbs.types'
import BaseBreadcrumbs from '../ui/BaseBreadcrumbs.vue'

/** Стандартный набор элементов для тестов */
const ITEMS: BreadcrumbItem[] = [
	{ label: 'Главная', to: '/' },
	{ label: 'Каталог', to: '/catalog' },
	{ label: 'Кованые изделия', to: '/catalog/forged' },
	{ label: 'Ворота', to: '/catalog/forged/gates' },
	{ label: 'Распашные ворота' },
]

const SHORT_ITEMS: BreadcrumbItem[] = [{ label: 'Главная', to: '/' }, { label: 'О компании' }]

describe('BaseBreadcrumbs unit', () => {
	describe('рендер', () => {
		it('должен рендерить навигацию', () => {
			const { container } = render(BaseBreadcrumbs, { props: { items: ITEMS } })

			expect(container.querySelector('.base-breadcrumbs')).toBeInTheDocument()
		})

		it('должен рендерить все элементы крошек', () => {
			render(BaseBreadcrumbs, { props: { items: ITEMS } })

			ITEMS.forEach(item => {
				expect(screen.getByText(item.label)).toBeInTheDocument()
			})
		})

		it('должен рендерить короткий путь', () => {
			render(BaseBreadcrumbs, { props: { items: SHORT_ITEMS } })

			expect(screen.getByText('Главная')).toBeInTheDocument()
			expect(screen.getByText('О компании')).toBeInTheDocument()
		})
	})

	describe('пропс separator', () => {
		it('должен рендерить chevron-разделитель по умолчанию', () => {
			const { container } = render(BaseBreadcrumbs, { props: { items: ITEMS } })

			const seps = container.querySelectorAll('.base-breadcrumbs__sep')
			expect(seps.length).toBeGreaterThan(0)
			expect(container.querySelector('use')?.getAttribute('href')).toBe('icons.svg#chevron-right')
		})

		it('должен рендерить slash-разделитель', () => {
			const { container } = render(BaseBreadcrumbs, {
				props: { items: ITEMS, separator: 'slash' },
			})

			const slashSeps = container.querySelectorAll('.base-breadcrumbs__sep')
			expect(slashSeps.length).toBeGreaterThan(0)
			expect(container.textContent).toContain('/')
		})

		it('должен рендерить slash-разделитель для иконки дома и многоточия', () => {
			const { container } = render(BaseBreadcrumbs, {
				props: { items: ITEMS, separator: 'slash', showHome: true, maxItems: 2 },
			})

			const slashSeps = container.querySelectorAll('.base-breadcrumbs__sep')
			expect(slashSeps.length).toBeGreaterThan(0)
			// Должно содержать несколько слэшей (после дома, после многоточия и между видимыми элементами)
			const slashes = container.textContent?.match(/\//g)
			expect(slashes?.length).toBeGreaterThanOrEqual(3)
		})

		it('должен рендерить dot-разделитель', () => {
			const { container } = render(BaseBreadcrumbs, {
				props: { items: ITEMS, separator: 'dot' },
			})

			const dotSeps = container.querySelectorAll('.base-breadcrumbs__sep')
			expect(dotSeps.length).toBeGreaterThan(0)
			expect(container.textContent).toContain('•')
		})

		it('должен рендерить dot-разделитель для иконки дома и многоточия', () => {
			const { container } = render(BaseBreadcrumbs, {
				props: { items: ITEMS, separator: 'dot', showHome: true, maxItems: 2 },
			})

			const dotSeps = container.querySelectorAll('.base-breadcrumbs__sep')
			expect(dotSeps.length).toBeGreaterThan(0)
			const dots = container.textContent?.match(/•/g)
			expect(dots?.length).toBeGreaterThanOrEqual(3)
		})

		it('должен рендерить chevron-разделитель для неизвестного типа разделителя', () => {
			const { container } = render(BaseBreadcrumbs, {
				props: { items: ITEMS, separator: 'unknown' as any },
			})

			expect(container.querySelector('use')?.getAttribute('href')).toBe('icons.svg#chevron-right')
		})
	})

	describe('пропс maxItems', () => {
		it('должен показывать все элементы когда maxItems=0', () => {
			const { container } = render(BaseBreadcrumbs, {
				props: { items: ITEMS, maxItems: 0 },
			})

			const listItems = container.querySelectorAll('.base-breadcrumbs__item')
			expect(listItems).toHaveLength(ITEMS.length)
		})

		it('должен скрывать элементы когда maxItems задан', () => {
			const { container } = render(BaseBreadcrumbs, {
				props: { items: ITEMS, maxItems: 2 },
			})

			// Должен быть ellipsis + видимые элементы
			const ellipsis = container.querySelector('.base-breadcrumbs__item--ellipsis')
			expect(ellipsis).toBeInTheDocument()
		})

		it('должен раскрывать элементы при клике на многоточие', async () => {
			const { container } = render(BaseBreadcrumbs, {
				props: { items: ITEMS, maxItems: 2 },
			})

			const ellipsisBtn = container.querySelector('.base-breadcrumbs__ellipsis-btn') as HTMLElement
			expect(ellipsisBtn).toBeInTheDocument()

			ellipsisBtn.dispatchEvent(new Event('click'))
			await new Promise(resolve => setTimeout(resolve, 0))

			expect(container.querySelector('.base-breadcrumbs__item--ellipsis')).not.toBeInTheDocument()
			const listItems = container.querySelectorAll('.base-breadcrumbs__item')
			expect(listItems).toHaveLength(ITEMS.length)
		})

		it('не должен скрывать элементы, если длина массива меньше maxItems', () => {
			const { container } = render(BaseBreadcrumbs, {
				props: { items: SHORT_ITEMS, maxItems: 5 },
			})

			expect(container.querySelector('.base-breadcrumbs__item--ellipsis')).not.toBeInTheDocument()
		})
	})

	describe('пропс showHome', () => {
		it('не должен рендерить иконку дома когда showHome=false', () => {
			const { container } = render(BaseBreadcrumbs, {
				props: { items: ITEMS, showHome: false },
			})

			expect(container.querySelector('.base-breadcrumbs__item--home')).not.toBeInTheDocument()
		})

		it('должен рендерить иконку дома когда showHome=true', () => {
			const { container } = render(BaseBreadcrumbs, {
				props: { items: ITEMS, showHome: true },
			})

			expect(container.querySelector('.base-breadcrumbs__item--home')).toBeInTheDocument()
		})

		it('должен эмитить navigate при клике на иконку дома', async () => {
			const { emitted, container } = render(BaseBreadcrumbs, {
				props: { items: ITEMS, showHome: true },
			})

			const homeBtn = container.querySelector('.base-breadcrumbs__item--home .base-breadcrumbs__link') as HTMLElement
			homeBtn.dispatchEvent(new Event('click'))

			expect(emitted()).toHaveProperty('navigate')
			const navigateEvents = emitted()['navigate'] as any[][]
			expect(navigateEvents[0][0]).toBe('/')
		})

		it('не должен эмитить navigate при клике на иконку дома, если массив пустой', async () => {
			const { container } = render(BaseBreadcrumbs, {
				props: { items: [], showHome: true },
			})

			const homeBtn = container.querySelector('.base-breadcrumbs__item--home .base-breadcrumbs__link')
			expect(homeBtn).toBeNull()
		})
	})

	describe('клики по элементам', () => {
		it('должен эмитить item-click и navigate при клике на элемент с to', async () => {
			const { emitted, container } = render(BaseBreadcrumbs, {
				props: { items: ITEMS },
			})

			const links = container.querySelectorAll('.base-breadcrumbs__link')
			// Первый элемент - "Главная" с to: '/'
			const firstLink = links[0] as HTMLElement
			firstLink.dispatchEvent(new Event('click'))

			expect(emitted()).toHaveProperty('item-click')
			const clickEvents = emitted()['item-click'] as any[][]
			expect(clickEvents[0][0]).toEqual(ITEMS[0])

			expect(emitted()).toHaveProperty('navigate')
			const navigateEvents = emitted()['navigate'] as any[][]
			expect(navigateEvents[0][0]).toBe('/')
		})

		it('должен эмитить navigate при клике на элемент с href', async () => {
			const itemsWithHref = [{ label: 'Главная', href: 'https://example.com' }, { label: 'Текущая' }]
			const { emitted, container } = render(BaseBreadcrumbs, {
				props: { items: itemsWithHref },
			})

			const link = container.querySelector('.base-breadcrumbs__link') as HTMLElement
			link.dispatchEvent(new Event('click'))

			expect(emitted()).toHaveProperty('navigate')
			const navigateEvents = emitted()['navigate'] as any[][]
			expect(navigateEvents[0][0]).toBe('https://example.com')
		})
	})

	describe('слоты', () => {
		it('должен рендерить кастомный разделитель через слот separator', () => {
			render(BaseBreadcrumbs, {
				props: { items: ITEMS },
				slots: {
					separator: '<span data-testid="custom-sep">~</span>',
				},
			})

			expect(screen.getAllByTestId('custom-sep').length).toBeGreaterThan(0)
		})

		it('должен рендерить кастомный элемент home через слот home', () => {
			render(BaseBreadcrumbs, {
				props: { items: ITEMS, showHome: true },
				slots: {
					home: '<span data-testid="custom-home">Домик</span>',
				},
			})

			expect(screen.getByTestId('custom-home')).toBeInTheDocument()
		})

		it('должен рендерить кастомный элемент через слот item', () => {
			render(BaseBreadcrumbs, {
				props: { items: ITEMS },
				slots: {
					item: '<span data-testid="custom-item">Крошка</span>',
				},
			})

			expect(screen.getAllByTestId('custom-item').length).toBeGreaterThan(0)
		})
	})

	describe('текущий элемент', () => {
		it('должен помечать последний элемент как текущий', () => {
			const { container } = render(BaseBreadcrumbs, { props: { items: ITEMS } })

			const currentItem = container.querySelector('.base-breadcrumbs__item--current')
			expect(currentItem).toBeInTheDocument()
		})

		it('должен иметь aria-current="page" на текущем элементе', () => {
			const { container } = render(BaseBreadcrumbs, { props: { items: ITEMS } })

			const currentSpan = container.querySelector('[aria-current="page"]')
			expect(currentSpan).toBeInTheDocument()
		})
	})

	describe('Schema.org', () => {
		it('должен рендерить JSON-LD скрипт для SEO', () => {
			const { container } = render(BaseBreadcrumbs, { props: { items: ITEMS } })

			const script = container.querySelector('script[type="application/ld+json"]')
			expect(script).toBeInTheDocument()
		})
	})

	describe('пропс customClass', () => {
		it('должен добавлять строку класса к корневому элементу', () => {
			const { container } = render(BaseBreadcrumbs, {
				props: {
					items: ITEMS,
					customClass: 'custom-breadcrumbs-class',
				},
			})

			const el = container.querySelector('.base-breadcrumbs')
			expect(el).toHaveClass('custom-breadcrumbs-class')
		})

		it('должен распределять объект классов по внутренним элементам', () => {
			const { container } = render(BaseBreadcrumbs, {
				props: {
					items: ITEMS,
					showHome: true,
					customClass: {
						root: 'custom-breadcrumbs-root',
						list: 'custom-breadcrumbs-list',
						item: 'custom-breadcrumbs-item',
						separator: 'custom-breadcrumbs-separator',
					},
				},
			})

			const root = container.querySelector('.base-breadcrumbs')
			expect(root).toHaveClass('custom-breadcrumbs-root')

			const list = container.querySelector('.base-breadcrumbs__list')
			expect(list).toHaveClass('custom-breadcrumbs-list')

			const item = container.querySelector('.base-breadcrumbs__item')
			expect(item).toHaveClass('custom-breadcrumbs-item')

			const separator = container.querySelector('.base-breadcrumbs__sep')
			expect(separator).toHaveClass('custom-breadcrumbs-separator')
		})
	})

	describe('дополнительное покрытие ветвей', () => {
		it('должен корректно рендерить иконки для элементов', () => {
			const itemsWithIcons: BreadcrumbItem[] = [
				{ label: 'Главная', to: '/', icon: 'home' },
				{ label: 'Каталог', icon: 'folder' },
			]
			const { container } = render(BaseBreadcrumbs, {
				props: { items: itemsWithIcons },
			})

			// Должно быть две иконки (одна в ссылке, одна в текущем элементе)
			const icons = container.querySelectorAll('.base-breadcrumbs__icon')
			expect(icons).toHaveLength(2)
		})

		it('не должен выполнять навигацию, если у элемента нет to и href', async () => {
			const itemsWithoutNav: BreadcrumbItem[] = [
				{ label: 'Главная' }, // Не текущий, но без путей навигации
				{ label: 'Каталог' }, // Текущий
			]
			const { emitted, container } = render(BaseBreadcrumbs, {
				props: { items: itemsWithoutNav },
			})

			const links = container.querySelectorAll('.base-breadcrumbs__link')
			const firstLink = links[0] as HTMLElement
			firstLink.dispatchEvent(new Event('click'))

			// Должен быть эмитирован клик, но не навигация
			expect(emitted()).toHaveProperty('item-click')
			expect(emitted()).not.toHaveProperty('navigate')
		})

		it('должен рендерить chevron-разделитель для неизвестного типа разделителя при showHome и maxItems', () => {
			const { container } = render(BaseBreadcrumbs, {
				props: {
					items: ITEMS,
					separator: 'unknown' as any,
					showHome: true,
					maxItems: 2,
				},
			})

			// Должны быть chevron-разделители (иконки)
			const sepIcon = container.querySelector('.base-breadcrumbs__sep use')
			expect(sepIcon).toBeInTheDocument()
			expect(sepIcon?.getAttribute('href')).toBe('icons.svg#chevron-right')
		})

		it('не должен падать и выполнять навигацию при клике на дом, если первый элемент falsy', async () => {
			const { emitted, container } = render(BaseBreadcrumbs, {
				props: {
					items: [false as any],
					showHome: true,
				},
			})

			const homeBtn = container.querySelector('.base-breadcrumbs__item--home .base-breadcrumbs__link') as HTMLElement
			expect(homeBtn).toBeInTheDocument()
			homeBtn.dispatchEvent(new Event('click'))

			// Навигация не должна быть вызвана
			expect(emitted()).not.toHaveProperty('navigate')
		})
	})
})
