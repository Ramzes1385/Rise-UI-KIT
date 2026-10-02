import '@testing-library/jest-dom/vitest'
import BaseBottomNav from '../ui/BaseBottomNav.vue'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import type { BottomNavItem } from '../types/BaseBottomNav.types'

const ITEMS: BottomNavItem[] = [
	{ value: 'home', label: 'Главная', icon: 'home' },
	{ value: 'upload', label: 'Загрузка', icon: 'upload', isDisabled: true },
	{ value: 'inbox', label: 'Входящие', icon: 'inbox', to: '/inbox' },
	{ value: 'settings', label: 'Настройки', icon: 'settings' },
]

describe('BaseBottomNav integration: клавиатура', () => {
	it('Tab обходит пункты по порядку, пропуская выключенный', async () => {
		const user = userEvent.setup()
		render(BaseBottomNav, { props: { items: ITEMS } })
		await user.tab()
		expect(screen.getByRole('button', { name: 'Главная' })).toHaveFocus()
		await user.tab()
		expect(screen.getByRole('link', { name: 'Входящие' })).toHaveFocus()
		await user.tab()
		expect(screen.getByRole('button', { name: 'Настройки' })).toHaveFocus()
	})

	it('Enter и Space выбирают пункт-кнопку', async () => {
		const user = userEvent.setup()
		const { emitted } = render(BaseBottomNav, { props: { items: ITEMS, modelValue: 'home' } })
		await user.tab()
		await user.tab()
		await user.tab()
		await user.keyboard('{Enter}')
		expect(screen.getByRole('button', { name: 'Настройки' })).toHaveAttribute('aria-current', 'page')
		await user.keyboard('{Shift>}{Tab}{Tab}{/Shift}')
		await user.keyboard(' ')
		expect(screen.getByRole('button', { name: 'Главная' })).toHaveAttribute('aria-current', 'page')
		expect(emitted()['update:modelValue']).toEqual([['settings'], ['home']])
	})

	it('Enter на ссылке эмитит navigate', async () => {
		const user = userEvent.setup()
		const { emitted } = render(BaseBottomNav, { props: { items: ITEMS } })
		await user.tab()
		await user.tab()
		await user.keyboard('{Enter}')
		expect(emitted().navigate).toEqual([['/inbox']])
	})
})
