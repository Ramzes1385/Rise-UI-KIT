import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import BaseLayout from '../ui/BaseLayout.vue'

const SLOTS = {
	header: '<header>Шапка</header>',
	sidebar: '<nav aria-label="Разделы">Меню</nav>',
	default: '<h1>Заказы</h1>',
	footer: '<footer>Подвал</footer>',
}

describe('BaseLayout unit', () => {
	it('рендерит шапку, меню, <main> и подвал', () => {
		const { container } = render(BaseLayout, { slots: SLOTS })
		expect(screen.getByRole('banner')).toHaveTextContent('Шапка')
		expect(screen.getByRole('navigation', { name: 'Разделы' })).toBeInTheDocument()
		expect(screen.getByRole('main')).toContainElement(screen.getByRole('heading', { name: 'Заказы' }))
		expect(screen.getByRole('contentinfo')).toHaveTextContent('Подвал')
		expect(container.querySelector('.base-layout')).toHaveClass('base-layout--sticky-header')
		expect(container.querySelector('.base-layout')).toHaveStyle({ '--base-layout-header-height': '0px' })
	})

	it('без слотов зон рендерит только ссылку и <main>', () => {
		const { container } = render(BaseLayout, { slots: { default: 'Текст' } })
		expect(container.querySelector('.base-layout__header')).not.toBeInTheDocument()
		expect(container.querySelector('.base-layout__sidebar')).not.toBeInTheDocument()
		expect(container.querySelector('.base-layout__footer')).not.toBeInTheDocument()
		expect(screen.getByRole('main')).toHaveTextContent('Текст')
	})

	it('ссылка «Перейти к содержимому» ведёт на <main> и переносит в него фокус', async () => {
		render(BaseLayout, { slots: SLOTS })
		const link = screen.getByRole('link', { name: 'Перейти к содержимому' })
		const main = screen.getByRole('main')
		expect(link).toHaveAttribute('href', `#${main.id}`)
		expect(main).toHaveAttribute('tabindex', '-1')
		await fireEvent.click(link)
		expect(main).toHaveFocus()
	})

	it('mainId и skipLinkLabel задают id и текст ссылки', () => {
		render(BaseLayout, { props: { mainId: 'content', skipLinkLabel: 'К заказам' } })
		expect(screen.getByRole('main')).toHaveAttribute('id', 'content')
		expect(screen.getByRole('link', { name: 'К заказам' })).toHaveAttribute('href', '#content')
	})

	it('hasSkipLink=false убирает ссылку', () => {
		render(BaseLayout, { props: { hasSkipLink: false } })
		expect(screen.queryByRole('link')).not.toBeInTheDocument()
	})

	it('модификаторы: без прилипшей шапки, меню на узком экране, customClass', () => {
		const { container, unmount } = render(BaseLayout, {
			props: { isHeaderSticky: false, isSidebarVisibleOnMobile: true, customClass: { main: 'my-main' } },
			slots: SLOTS,
		})
		const root = container.querySelector('.base-layout') as HTMLElement
		expect(root).not.toHaveClass('base-layout--sticky-header')
		expect(root).toHaveClass('base-layout--mobile-sidebar')
		expect(screen.getByRole('main')).toHaveClass('my-main')
		unmount()
	})
})
