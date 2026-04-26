/**
 * Integration-тесты для BaseChip.
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import BaseChip from './BaseChip.vue'

describe('BaseChip integration', () => {
	it('должен эмитить click-badge при клике на индикатор', async () => {
		const user = userEvent.setup()
		const { emitted } = render(BaseChip, {
			props: { content: 5 },
		})

		await user.click(screen.getByText('5'))
		expect(emitted()).toHaveProperty('click-badge')
	})
})
