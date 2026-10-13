import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { UI_COOKIE_CONSENT } from '@/locales/messages'
import BaseCookieConsent from '../ui/BaseCookieConsent.vue'

const CATEGORIES = [
	{ id: 'necessary', label: 'Необходимые', isRequired: true },
	{ id: 'analytics', label: 'Аналитика' },
]

describe('BaseCookieConsent integration', () => {
	it('клавиатура: Tab доходит до кнопок, Enter раскрывает настройки, Space включает переключатель', async () => {
		const user = userEvent.setup()
		const { emitted } = render(BaseCookieConsent, { props: { categories: CATEGORIES } })
		await user.tab()
		expect(screen.getByRole('button', { name: UI_COOKIE_CONSENT.CUSTOMIZE })).toHaveFocus()
		await user.keyboard('{Enter}')
		expect(screen.getByRole('group', { name: UI_COOKIE_CONSENT.CATEGORIES })).toBeInTheDocument()
		await user.tab({ shift: true })
		expect(screen.getByRole('switch', { name: 'Аналитика' })).toHaveFocus()
		await user.keyboard(' ')
		expect(emitted('change')).toEqual([[['necessary', 'analytics']]])
	})

	it('клавиатура: Enter на «Принять все» закрывает окно', async () => {
		const user = userEvent.setup()
		const { emitted } = render(BaseCookieConsent, { props: { categories: CATEGORIES } })
		screen.getByRole('button', { name: UI_COOKIE_CONSENT.ACCEPT_ALL }).focus()
		await user.keyboard('{Enter}')
		expect(emitted('accept')).toEqual([[['necessary', 'analytics']]])
		expect(screen.queryByRole('region')).not.toBeInTheDocument()
	})
})
