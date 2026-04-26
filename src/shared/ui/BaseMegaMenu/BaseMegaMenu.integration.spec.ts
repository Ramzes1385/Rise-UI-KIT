/**
 * Integration-тесты для BaseMegaMenu.
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import BaseMegaMenu from './BaseMegaMenu.vue'

describe('BaseMegaMenu integration', () => {
	it('должен эмитить navigate при клике на пункт без детей', async () => {
		const user = userEvent.setup()
		const items = [{ label: 'Home', to: '/' }]
		const { emitted } = render(BaseMegaMenu, {
			props: { items, layout: 'dropdown' },
		})

		await user.click(screen.getByText('Home'))
		expect(emitted()).toHaveProperty('navigate')
	})
})
