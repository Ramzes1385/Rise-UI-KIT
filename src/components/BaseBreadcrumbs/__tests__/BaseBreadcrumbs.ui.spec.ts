import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { createUiKitPlugin } from '@/plugin'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import BaseBreadcrumbs from '../ui/BaseBreadcrumbs.vue'
import type { BreadcrumbItem } from '../types/BaseBreadcrumbs.types'

const ITEMS: BreadcrumbItem[] = [
	{ label: 'Главная', to: '/' },
	{ label: 'Каталог', to: '/catalog', icon: 'folder' },
	{ label: 'Электроника', to: '/catalog/electronics' },
	{ label: 'Ноутбуки', to: '/catalog/electronics/laptops' },
	{ label: 'Ультрабук', icon: 'star' },
]

const REAL_TRANSITIONS = { stubs: { TransitionGroup: false, Transition: false } }

function stubReducedMotion(matches: boolean): void {
	vi.stubGlobal(
		'matchMedia',
		vi.fn(() => ({ matches, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
	)
}

function item(label: string): HTMLElement {
	return screen.getByText(label).closest('li')!
}

describe('BaseBreadcrumbs: проп ui', () => {
	it('без ui — только классы кита на частях', () => {
		const { container } = render(BaseBreadcrumbs, { props: { items: ITEMS, maxItems: 2 }, global: REAL_TRANSITIONS })

		expect(container.querySelector('nav')).toHaveAttribute('class', 'base-breadcrumbs')
		expect(container.querySelector('ol')).toHaveAttribute('class', 'base-breadcrumbs__list')
		expect(item('Ноутбуки')).toHaveAttribute('class', 'base-breadcrumbs__item')
		expect(screen.getByRole('link', { name: 'Ноутбуки' })).toHaveAttribute('class', 'base-breadcrumbs__link')
		expect(screen.getByRole('button')).toHaveAttribute('class', 'base-breadcrumbs__link base-breadcrumbs__ellipsis-btn')
		expect(container.querySelector('[aria-current="page"]')).toHaveAttribute('class', 'base-breadcrumbs__current')
		expect(screen.getByText('Ультрабук')).toHaveAttribute('class', 'base-breadcrumbs__text')
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		const { container } = render(BaseBreadcrumbs, {
			props: {
				items: ITEMS,
				showHome: true,
				maxItems: 2,
				variant: 'soft',
				customClass: { root: 'own-root', link: 'own-link', item: 'own-item' },
				ui: {
					root: 'u-root',
					list: 'u-list',
					item: 'u-item',
					link: 'u-link',
					current: 'u-current',
					text: 'u-text',
					icon: 'u-icon',
					sep: 'u-sep',
					'ellipsis-btn': 'u-ellipsis',
				},
			},
			global: REAL_TRANSITIONS,
		})

		expect(container.querySelector('nav')).toHaveClass('base-breadcrumbs', 'u-root', 'base-breadcrumbs--soft', 'own-root')
		expect(container.querySelector('ol')).toHaveClass('base-breadcrumbs__list', 'u-list')
		expect(container.querySelector('.base-breadcrumbs__item--home')).toHaveClass('base-breadcrumbs__item', 'u-item', 'own-item')
		expect(container.querySelector('.base-breadcrumbs__link--home')).toHaveClass('base-breadcrumbs__link', 'u-link', 'own-link')
		expect(screen.getByRole('button')).toHaveClass('base-breadcrumbs__ellipsis-btn', 'u-link', 'u-ellipsis')
		expect(container.querySelector('[aria-current="page"]')).toHaveClass('base-breadcrumbs__current', 'u-current')
		expect(screen.getByText('Ультрабук')).toHaveClass('base-breadcrumbs__text', 'u-text')
		expect(container.querySelector('.base-breadcrumbs__icon')).toHaveClass('u-icon')
		for (const sep of container.querySelectorAll('.base-breadcrumbs__sep')) expect(sep).toHaveClass('u-sep')
	})

	it('классы из defaults.BaseBreadcrumbs.ui плагина склеиваются с классами экземпляра', () => {
		const { container } = render(BaseBreadcrumbs, {
			props: { items: ITEMS, ui: { link: 'own-link' } },
			global: {
				...REAL_TRANSITIONS,
				plugins: [createUiKitPlugin({ defaults: { BaseBreadcrumbs: { ui: { root: 'app-root', link: 'app-link' } } } })],
			},
		})

		expect(container.querySelector('nav')).toHaveClass('base-breadcrumbs', 'app-root')
		expect(screen.getByRole('link', { name: 'Главная' })).toHaveAttribute('class', 'base-breadcrumbs__link app-link own-link')
	})
})

describe('BaseBreadcrumbs: раскрытие свёрнутых крошек', () => {
	beforeEach(() => stubReducedMotion(false))

	afterEach(() => {
		vi.unstubAllGlobals()
		document.documentElement.removeAttribute('data-rise-motion')
	})

	it('первый показ и новые items — без анимации появления', async () => {
		const { rerender } = render(BaseBreadcrumbs, { props: { items: ITEMS, maxItems: 2 }, global: REAL_TRANSITIONS })

		expect(item('Ноутбуки')).not.toHaveClass('base-breadcrumbs-reveal-enter-active')

		await rerender({ items: [...ITEMS, { label: 'Обзор' }] })
		await nextTick()
		expect(item('Обзор')).not.toHaveClass('base-breadcrumbs-reveal-enter-active')
	})

	it('раскрытые крошки проявляются с enter-scale, видимые остаются на месте, фокус — на кнопке «…»', async () => {
		const user = userEvent.setup()
		render(BaseBreadcrumbs, { props: { items: ITEMS, maxItems: 2 }, global: REAL_TRANSITIONS })
		const kept = item('Ноутбуки')
		const toggle = screen.getByRole('button', { name: 'Показать ещё 3 раздела' })

		await user.click(toggle)

		for (const label of ['Главная', 'Каталог', 'Электроника']) {
			expect(item(label)).toHaveClass('base-breadcrumbs-reveal-enter-active')
		}
		expect(item('Ноутбуки')).toBe(kept)
		expect(kept).not.toHaveClass('base-breadcrumbs-reveal-enter-active')
		expect(toggle).toHaveFocus()
		expect(toggle).toHaveAttribute('aria-expanded', 'true')
	})

	it('сворачивание убирает крошки сразу, без ожидания перехода', async () => {
		const user = userEvent.setup()
		render(BaseBreadcrumbs, { props: { items: ITEMS, maxItems: 2 }, global: REAL_TRANSITIONS })
		const toggle = screen.getByRole('button')

		await user.click(toggle)
		await user.click(toggle)

		expect(screen.queryByText('Каталог')).toBeNull()
		expect(toggle).toHaveFocus()
	})

	it.each([
		['prefers-reduced-motion: reduce', () => stubReducedMotion(true)],
		['пресет none', () => document.documentElement.setAttribute('data-rise-motion', 'none')],
	])('%s — раскрытые крошки сразу в конечном состоянии', async (_, setup) => {
		setup()
		const user = userEvent.setup()
		render(BaseBreadcrumbs, { props: { items: ITEMS, maxItems: 2 }, global: REAL_TRANSITIONS })

		await user.click(screen.getByRole('button'))

		for (const label of ['Главная', 'Каталог', 'Электроника']) {
			expect(item(label)).toHaveAttribute('class', 'base-breadcrumbs__item')
		}
		expect(screen.getByRole('button')).toHaveFocus()
	})
})
