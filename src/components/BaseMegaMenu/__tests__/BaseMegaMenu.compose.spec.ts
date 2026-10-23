import '@testing-library/jest-dom/vitest'
import BaseMegaMenu from '../ui/BaseMegaMenu.vue'
import type { MegaMenuItem } from '../types/BaseMegaMenu.types'
import { fireEvent, render, screen, within } from '@testing-library/vue'

const ITEMS: MegaMenuItem[] = [
	{
		key: 'products',
		label: 'Продукты',
		groups: [
			{
				items: [
					{ label: 'Аналитика', description: 'Отчёты', to: '/analytics', badge: 'Новое' },
					{ label: 'Документы', to: '/docs' },
				],
			},
		],
	},
]

async function openPanel(): Promise<HTMLElement> {
	Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1280 })
	render(BaseMegaMenu, { props: { items: ITEMS } })
	const trigger = screen.getByRole('button', { name: 'Продукты' })
	await fireEvent.click(trigger)
	return document.getElementById(trigger.getAttribute('aria-controls')!)!
}

describe('BaseMegaMenu: бейдж ссылки на BaseBadge', () => {
	it('у ссылки с badge — BaseBadge с текстом, имя ссылки включает бейдж', async () => {
		const panel = await openPanel()
		const link = within(panel).getByRole('link', { name: 'Аналитика Новое Отчёты' })
		const badge = within(link).getByText('Новое').closest('.base-badge')

		expect(badge).toHaveClass('base-badge', 'base-mega-menu__link-badge')
		expect(badge).toHaveTextContent(/^Новое$/)
	})

	it('без badge — бейджа нет', async () => {
		const panel = await openPanel()
		const link = within(panel).getByRole('link', { name: 'Документы' })

		expect(link.querySelector('.base-badge')).toBeNull()
		expect(link.querySelector('.base-mega-menu__link-badge')).toBeNull()
	})
})
