/**
 * Unit-тесты для BaseMegaMenu.
 * Проверяют рендер и CSS-модификаторы.
 * Компонент использует BaseAnimation + vue-router — стабаем для изоляции.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'

import { vi } from 'vitest'

import type { MegaMenuColumn } from './BaseMegaMenu.types'
import BaseMegaMenu from './BaseMegaMenu.vue'

const COLUMNS: MegaMenuColumn[] = [
	{
		title: 'Каталог',
		items: [
			{ label: 'Кованые изделия', description: 'Ручная работа' },
			{ label: 'Ворота', to: '/gates' },
		],
	},
	{
		title: 'О компании',
		items: [{ label: 'Наша история' }],
	},
]

/** Стабаем BaseAnimation и vue-router для изоляции */
const globalConfig = {
	stubs: {
		BaseAnimation: {
			template: '<div class="animation-stub"><slot /></div>',
		},
	},
	mocks: {
		$router: { push: vi.fn() },
	},
}

describe('BaseMegaMenu unit', () => {
	describe('рендер', () => {
		it('должен рендерить мега-меню', () => {
			const { container } = render(BaseMegaMenu, {
				props: { columns: COLUMNS },
				global: globalConfig,
			})

			expect(container.querySelector('.base-mega-menu')).toBeInTheDocument()
		})

		it('должен рендерить колонки', () => {
			const { container } = render(BaseMegaMenu, {
				props: { columns: COLUMNS },
				global: globalConfig,
			})

			expect(container.querySelectorAll('.base-mega-menu__column').length).toBe(2)
		})

		it('должен рендерить заголовки колонок', () => {
			render(BaseMegaMenu, {
				props: { columns: COLUMNS },
				global: globalConfig,
			})

			expect(screen.getByText('Каталог')).toBeInTheDocument()
			expect(screen.getByText('О компании')).toBeInTheDocument()
		})
	})

	describe('пункты меню', () => {
		it('должен рендерить пункты', () => {
			render(BaseMegaMenu, {
				props: { columns: COLUMNS },
				global: globalConfig,
			})

			expect(screen.getByText('Кованые изделия')).toBeInTheDocument()
			expect(screen.getByText('Ворота')).toBeInTheDocument()
		})

		it('должен рендерить описания', () => {
			render(BaseMegaMenu, {
				props: { columns: COLUMNS },
				global: globalConfig,
			})

			expect(screen.getByText('Ручная работа')).toBeInTheDocument()
		})
	})
})
