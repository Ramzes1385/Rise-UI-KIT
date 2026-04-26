/**
 * Integration-тесты для BaseBadge.
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import BaseBadge from './BaseBadge.vue'

describe('BaseBadge integration', () => {
	it('должен эмитить click при клике', async () => {
		const user = userEvent.setup()
		const { emitted } = render(BaseBadge, {
			props: { label: 'Badge' },
		})

		await user.click(screen.getByText('Badge'))
		expect(emitted()).toHaveProperty('click')
	})
})
