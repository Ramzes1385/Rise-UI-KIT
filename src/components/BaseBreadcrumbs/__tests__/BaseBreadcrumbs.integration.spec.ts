import '@testing-library/jest-dom/vitest'
import { markRaw } from 'vue'
import userEvent from '@testing-library/user-event'
import BaseBreadcrumbs from '../ui/BaseBreadcrumbs.vue'
import type { BreadcrumbItem } from '../types/BaseBreadcrumbs.types'
import { fireEvent, render, screen, within } from '@testing-library/vue'

const ITEMS: BreadcrumbItem[] = [
	{ label: 'Главная', to: '/' },
	{ label: 'Каталог', to: '/catalog' },
	{ label: 'Кованые изделия', to: '/catalog/forged' },
	{ label: 'Ворота' },
]

function preventNavigation(event: Event): void {
	event.preventDefault()
}

beforeAll(() => document.addEventListener('click', preventNavigation))
afterAll(() => document.removeEventListener('click', preventNavigation))

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

			const ellipsisBtn = container.querySelector('.base-breadcrumbs__ellipsis-btn')
			expect(ellipsisBtn).toBeInTheDocument()

			await user.click(ellipsisBtn!)

			expect(screen.getByText('Каталог')).toBeInTheDocument()
			expect(ellipsisBtn).toHaveAttribute('aria-expanded', 'true')
		})

		it('кнопка «…» — раскрывающая: имя с числом скрытых, aria-expanded, повторный клик сворачивает (BC-3)', async () => {
			const user = userEvent.setup()
			render(BaseBreadcrumbs, { props: { items: ITEMS, maxItems: 2 } })

			const toggle = screen.getByRole('button', { name: 'Показать ещё 2 раздела' })
			expect(toggle).toHaveAttribute('aria-expanded', 'false')
			expect(screen.queryByText('Главная')).not.toBeInTheDocument()

			await user.click(toggle)
			expect(toggle).toHaveAccessibleName('Скрыть разделы')
			expect(toggle).toHaveAttribute('aria-expanded', 'true')
			expect(toggle).toHaveFocus()
			expect(screen.getAllByRole('listitem').filter(item => !item.hasAttribute('aria-hidden'))).toHaveLength(ITEMS.length + 1)

			await user.click(toggle)
			expect(toggle).toHaveAccessibleName('Показать ещё 2 раздела')
			expect(screen.queryByText('Главная')).not.toBeInTheDocument()
		})

		it('кнопка «…» работает с клавиатуры: Tab до неё, Enter и Space переключают', async () => {
			const user = userEvent.setup()
			render(BaseBreadcrumbs, { props: { items: ITEMS, maxItems: 2 } })

			await user.tab()
			const toggle = screen.getByRole('button', { name: 'Показать ещё 2 раздела' })
			expect(toggle).toHaveFocus()

			await user.keyboard('{Enter}')
			expect(toggle).toHaveAttribute('aria-expanded', 'true')
			await user.keyboard(' ')
			expect(toggle).toHaveAttribute('aria-expanded', 'false')
		})

		it('новые items снова сворачивают крошки', async () => {
			const user = userEvent.setup()
			const { rerender } = render(BaseBreadcrumbs, { props: { items: ITEMS, maxItems: 2 } })

			await user.click(screen.getByRole('button', { name: 'Показать ещё 2 раздела' }))
			await rerender({ items: [...ITEMS, { label: 'Калитка' }] })

			expect(screen.getByRole('button', { name: 'Показать ещё 3 раздела' })).toHaveAttribute('aria-expanded', 'false')
		})

		it('с showHome считает скрытыми крошки после «домой»', () => {
			render(BaseBreadcrumbs, { props: { items: [...ITEMS, { label: 'Калитка' }], maxItems: 2, showHome: true } })

			expect(screen.getByRole('button', { name: 'Показать ещё 2 раздела' })).toBeInTheDocument()
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
			const itemsWithHref: BreadcrumbItem[] = [{ label: 'Внешний сайт', href: 'https://example.com' }, { label: 'Текущая страница' }]
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

		it('ссылка «домой» имеет доступное имя — метку первой крошки, на которую она ведёт', async () => {
			const user = userEvent.setup()
			const { container, emitted } = render(BaseBreadcrumbs, {
				props: { items: ITEMS, showHome: true },
			})

			const homeItem = container.querySelector('.base-breadcrumbs__item--home') as HTMLElement
			const home = within(homeItem).getByRole('link', { name: 'Главная' })
			expect(home).toHaveAttribute('href', '/')
			await user.click(home)

			expect(emitted().navigate).toEqual([['/']])
		})

		it('при showHome первая крошка представлена только ссылкой «домой» и не дублируется в цепочке', () => {
			render(BaseBreadcrumbs, { props: { items: ITEMS, showHome: true } })

			expect(screen.getAllByRole('link', { name: 'Главная' })).toHaveLength(1)
			expect(screen.queryByText('Главная')).not.toBeInTheDocument()
			expect(screen.getByRole('link', { name: 'Каталог' })).toBeInTheDocument()
			expect(screen.getByText('Ворота').closest('[aria-current="page"]')).not.toBeNull()
		})

		it('при showHome единственная крошка остаётся в цепочке текущей страницей', () => {
			render(BaseBreadcrumbs, { props: { items: [{ label: 'Главная', to: '/' }], showHome: true } })

			expect(screen.getByText('Главная').closest('[aria-current="page"]')).not.toBeNull()
		})
	})

	describe('слоты', () => {
		it('должен рендерить кастомный разделитель через слот', () => {
			render(BaseBreadcrumbs, {
				props: { items: ITEMS },
				slots: {
					separator: '<span data-testid="custom-sep">→</span>',
				},
			})

			expect(screen.getAllByTestId('custom-sep').length).toBeGreaterThan(0)
		})

		it('должен рендерить кастомную иконку дома через слот', () => {
			render(BaseBreadcrumbs, {
				props: { items: ITEMS, showHome: true },
				slots: {
					home: '<span data-testid="custom-home">🏠</span>',
				},
			})

			expect(screen.getByTestId('custom-home')).toBeInTheDocument()
		})
	})

	describe('ссылки (BC-2)', () => {
		const RouterLinkStub = markRaw({ name: 'RouterLinkStub', props: ['to'], template: '<a data-router :href="to"><slot /></a>' })

		it('крошка с to — ссылка RouterLink приложения, без роутера — <a href>', () => {
			const { unmount } = render(BaseBreadcrumbs, { props: { items: ITEMS }, global: { components: { RouterLink: RouterLinkStub } } })
			expect(screen.getByRole('link', { name: 'Каталог' })).toHaveAttribute('data-router')
			unmount()

			render(BaseBreadcrumbs, { props: { items: ITEMS, linkComponent: 'a' } })
			expect(screen.getByRole('link', { name: 'Каталог' })).not.toHaveAttribute('data-router')
		})

		it('внешняя крошка открывается в новой вкладке, target меняет это', () => {
			render(BaseBreadcrumbs, {
				props: {
					items: [
						{ label: 'Документация', href: 'https://example.com/docs' },
						{ label: 'Блог', href: 'https://example.com/blog', target: '_self' },
						{ label: 'Статья' },
					],
				},
			})

			const docs = screen.getByRole('link', { name: 'Документация' })
			expect(docs).toHaveAttribute('target', '_blank')
			expect(docs).toHaveAttribute('rel', 'noopener noreferrer')
			expect(screen.getByRole('link', { name: 'Блог' })).toHaveAttribute('target', '_self')
		})

		it('крошка без адреса — кнопка с item-click, без navigate', async () => {
			const { emitted } = render(BaseBreadcrumbs, { props: { items: [{ label: 'Раздел' }, { label: 'Страница' }] } })

			await fireEvent.click(screen.getByRole('button', { name: 'Раздел' }))
			expect(emitted()['item-click']).toEqual([[{ label: 'Раздел' }]])
			expect(emitted()).not.toHaveProperty('navigate')
		})

		it('небезопасный адрес: ссылка без href, клик не сообщает о переходе', async () => {
			vi.spyOn(console, 'warn').mockImplementation(() => {})
			const { emitted } = render(BaseBreadcrumbs, {
				props: { items: [{ label: 'Отчёт', href: 'javascript:alert(1)' }, { label: 'Страница' }] },
			})

			const link = screen.getByRole('link', { name: 'Отчёт' })
			expect(link).not.toHaveAttribute('href')
			await fireEvent.click(link)
			expect(emitted()).not.toHaveProperty('navigate')
			vi.restoreAllMocks()
		})
	})
})
