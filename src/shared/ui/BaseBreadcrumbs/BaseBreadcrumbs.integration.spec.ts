/**
 * Integration-тесты для BaseBreadcrumbs.
 * Проверяют взаимодействие: клики, навигация, collapsed, слоты.
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'

import type { BreadcrumbItem } from './BaseBreadcrumbs.types'
import BaseBreadcrumbs from './BaseBreadcrumbs.vue'

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
			const user = userEvent.setup()
			const itemsWithHref: BreadcrumbItem[] = [{ label: 'Внешний сайт', href: 'https://example.com' }]
			const { emitted } = render(BaseBreadcrumbs, { props: { items: itemsWithHref } })

			const link = screen.getByText('Внешний сайт')
			await user.click(link)

			const navEvents = emitted()['navigate']
			expect(navEvents).toBeTruthy()
			expect(navEvents?.[0]).toEqual(['https://example.com'])
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

			expect(screen.getByTestId('custom-sep')).toBeInTheDocument()
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
