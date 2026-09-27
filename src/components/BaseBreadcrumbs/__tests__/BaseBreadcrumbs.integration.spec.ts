/**
 * Integration-тесты для BaseBreadcrumbs.
 * Проверяют взаимодействие: клики, навигация, collapsed, слоты.
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen, within } from '@testing-library/vue'
import BaseBreadcrumbs from '../ui/BaseBreadcrumbs.vue'
import type { BreadcrumbItem } from '../model/BaseBreadcrumbs.types'

/** Стандартный набор элементов для тестов */
const ITEMS: BreadcrumbItem[] = [
	{ label: 'Главная', to: '/' },
	{ label: 'Каталог', to: '/catalog' },
	{ label: 'Кованые изделия', to: '/catalog/forged' },
	{ label: 'Ворота' },
]

describe('BaseBreadcrumbs integration', () => {
	describe('навигация по клику', () => {
		it('должен эмитить item-click при клике на крошку', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseBreadcrumbs, { props: { items: ITEMS } })

			const link = screen.getByText('Главная')
			await user.click(link)

			const clickEvents = emitted()['item-click']
			expect(clickEvents).toBeTruthy()
		})

		it('должен эмитить navigate при клике на крошку с to', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseBreadcrumbs, { props: { items: ITEMS } })

			const link = screen.getByText('Каталог')
			await user.click(link)

			const navEvents = emitted()['navigate']
			expect(navEvents).toBeTruthy()
			expect(navEvents?.[0]).toEqual(['/catalog'])
		})
	})

	describe('collapsed крошки', () => {
		it('должен раскрывать скрытые крошки при клике на ellipsis', async () => {
			const user = userEvent.setup()
			const { container } = render(BaseBreadcrumbs, {
				props: { items: ITEMS, maxItems: 2 },
			})

			// Изначально есть ellipsis
			const ellipsisBtn = container.querySelector('.base-breadcrumbs__ellipsis-btn')
			expect(ellipsisBtn).toBeInTheDocument()

			// Кликаем для раскрытия
			await user.click(ellipsisBtn!)

			// После раскрытия ellipsis исчезает
			expect(container.querySelector('.base-breadcrumbs__ellipsis-btn')).not.toBeInTheDocument()
		})
	})

	describe('иконка дома', () => {
		it('должен эмитить navigate при клике на иконку дома', async () => {
			const user = userEvent.setup()
			const { emitted, container } = render(BaseBreadcrumbs, {
				props: { items: ITEMS, showHome: true },
			})

			const homeBtn = container.querySelector('.base-breadcrumbs__item--home .base-breadcrumbs__link')
			expect(homeBtn).toBeInTheDocument()

			await user.click(homeBtn!)

			const navEvents = emitted()['navigate']
			expect(navEvents).toBeTruthy()
		})
	})

	describe('внешние ссылки', () => {
		it('должен эмитить navigate с href при клике на внешнюю крошку', async () => {
			const itemsWithHref: BreadcrumbItem[] = [
				{ label: 'Внешний сайт', href: 'https://example.com' },
				{ label: 'Текущая страница' },
			]
			const { emitted, container } = render(BaseBreadcrumbs, { props: { items: itemsWithHref } })

			const link = container.querySelector('.base-breadcrumbs__link') as HTMLElement
			await fireEvent.click(link)

			const navEvents = emitted()['navigate']
			expect(navEvents).toBeTruthy()
			expect(navEvents?.[0]).toEqual(['https://example.com'])
		})
	})

	describe('доступность', () => {
		it('рендерит ориентир navigation «Хлебные крошки», текущей страницей помечен только последний элемент', () => {
			const { container } = render(BaseBreadcrumbs, { props: { items: ITEMS } })

			const nav = screen.getByRole('navigation', { name: 'Хлебные крошки' })
			expect(within(nav).getByRole('list')).toBeInTheDocument()

			const current = container.querySelectorAll('[aria-current="page"]')
			expect(current).toHaveLength(1)
			expect(current[0]).toHaveTextContent('Ворота')
		})

		it('кнопка «домой» имеет доступное имя — метку первой крошки, на которую она ведёт', async () => {
			const user = userEvent.setup()
			const { container, emitted } = render(BaseBreadcrumbs, {
				props: { items: ITEMS, showHome: true },
			})

			const homeItem = container.querySelector('.base-breadcrumbs__item--home') as HTMLElement
			await user.click(within(homeItem).getByRole('button', { name: 'Главная' }))

			expect(emitted().navigate).toEqual([['/']])
		})

		it('при showHome первая крошка представлена только кнопкой «домой» и не дублируется в цепочке', () => {
			render(BaseBreadcrumbs, { props: { items: ITEMS, showHome: true } })

			expect(screen.getAllByRole('button', { name: 'Главная' })).toHaveLength(1)
			expect(screen.queryByText('Главная')).not.toBeInTheDocument()
			expect(screen.getByRole('button', { name: 'Каталог' })).toBeInTheDocument()
			expect(screen.getByText('Ворота').closest('[aria-current="page"]')).not.toBeNull()
		})

		it('при showHome единственная крошка остаётся в цепочке текущей страницей', () => {
			render(BaseBreadcrumbs, { props: { items: [{ label: 'Главная', to: '/' }], showHome: true } })

			expect(screen.getByText('Главная').closest('[aria-current="page"]')).not.toBeNull()
		})
	})

	describe('слоты', () => {
		it('должен рендерить кастомный разделитель через слот', () => {
			const { container } = render(BaseBreadcrumbs, {
				props: { items: ITEMS },
				slots: {
					separator: '<span data-testid="custom-sep">→</span>',
				},
			})

			expect(screen.getAllByTestId('custom-sep').length).toBeGreaterThan(0)
		})

		it('должен рендерить кастомную иконку дома через слот', () => {
			const { container } = render(BaseBreadcrumbs, {
				props: { items: ITEMS, showHome: true },
				slots: {
					home: '<span data-testid="custom-home">🏠</span>',
				},
			})

			expect(screen.getByTestId('custom-home')).toBeInTheDocument()
		})
	})
})
