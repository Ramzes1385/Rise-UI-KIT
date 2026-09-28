import '@testing-library/jest-dom/vitest'
import BaseBadge from '../ui/BaseBadge.vue'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'

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
