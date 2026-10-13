import '@testing-library/jest-dom/vitest'
import BaseSideBar from '../../ui/BaseSideBar.vue'
import { render, screen } from '@testing-library/vue'
import type { SideBarItem } from '../../types/BaseSideBar.types'

const ITEMS: SideBarItem[] = [
	{ key: 'home', label: 'Главная', icon: 'home', to: '/home', hasDivider: true },
	{ key: 'action', label: 'Действие', icon: 'star' },
	{ key: 'reports', label: 'Отчёты', icon: 'file', hasDivider: true, children: [{ key: 'sales', label: 'Продажи', to: '/sales' }] },
	{ key: 'group', type: 'group', label: 'Раздел', hasDivider: true, children: [{ key: 'inside', label: 'Внутри', to: '/inside' }] },
	{ key: 'help', label: 'Помощь', icon: 'help' },
]

describe('BaseSideBar — разделитель из BaseSeparator', () => {
	it('hasDivider у ссылки, у пункта с children и у раздела — разделитель с ролью separator и прежним классом', () => {
		render(BaseSideBar, { props: { items: ITEMS } })
		const separators = screen.getAllByRole('separator')

		expect(separators).toHaveLength(3)
		for (const separator of separators) {
			expect(separator).toHaveClass('base-separator', 'base-side-bar-nav__divider')
			expect(separator).toHaveAttribute('aria-orientation', 'horizontal')
		}
	})

	it('разделитель стоит после своего пункта внутри его элемента списка', () => {
		render(BaseSideBar, { props: { items: ITEMS } })
		const [linkDivider, childrenDivider, groupDivider] = screen.getAllByRole('separator')

		expect(linkDivider.closest('li')).toContainElement(screen.getByRole('link', { name: 'Главная' }))
		expect(childrenDivider.closest('li')).toHaveClass('base-side-bar-nav__item--has-children')
		expect(childrenDivider.closest('li')).toHaveTextContent('Отчёты')
		expect(groupDivider.closest('li')).toHaveClass('base-side-bar-nav__group')
	})

	it('без hasDivider разделителей нет', () => {
		render(BaseSideBar, { props: { items: [{ key: 'a', label: 'Без линии' }] } })

		expect(screen.queryByRole('separator')).toBeNull()
	})

	it('в свёрнутом режиме разделители не рисуются', () => {
		const { container } = render(BaseSideBar, { props: { items: ITEMS, isCollapsed: true } })

		expect(screen.queryAllByRole('separator')).toHaveLength(0)
		expect(container.querySelector('.base-side-bar-nav__divider')).toBeNull()
	})
})
