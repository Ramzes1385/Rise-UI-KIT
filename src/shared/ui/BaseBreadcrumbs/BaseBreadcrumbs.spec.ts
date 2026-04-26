/**
 * Unit-тесты для BaseBreadcrumbs.
 * Проверяют рендер, пропсы, collapsed-логику и CSS-модификаторы.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'

import type { BreadcrumbItem } from './BaseBreadcrumbs.types'
import BaseBreadcrumbs from './BaseBreadcrumbs.vue'

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
		})

		it('должен рендерить slash-разделитель', () => {
			const { container } = render(BaseBreadcrumbs, {
				props: { items: ITEMS, separator: 'slash' },
			})

			const slashSeps = container.querySelectorAll('.base-breadcrumbs__sep')
			expect(slashSeps.length).toBeGreaterThan(0)
		})
	})

	describe('пропс size', () => {
		it('должен применять модификатор --md по умолчанию', () => {
			const { container } = render(BaseBreadcrumbs, { props: { items: ITEMS } })

			expect(container.querySelector('.base-breadcrumbs')?.classList.contains('base-breadcrumbs--md')).toBe(true)
		})

		it('должен применять модификатор --sm когда size=sm', () => {
			const { container } = render(BaseBreadcrumbs, {
				props: { items: ITEMS, size: 'sm' },
			})

			expect(container.querySelector('.base-breadcrumbs')?.classList.contains('base-breadcrumbs--sm')).toBe(true)
		})

		it('должен применять модификатор --lg когда size=lg', () => {
			const { container } = render(BaseBreadcrumbs, {
				props: { items: ITEMS, size: 'lg' },
			})

			expect(container.querySelector('.base-breadcrumbs')?.classList.contains('base-breadcrumbs--lg')).toBe(true)
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
})
