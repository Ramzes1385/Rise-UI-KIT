import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import BaseImageCompare from '../ui/BaseImageCompare.vue'

describe('BaseImageCompare integration', () => {
	it('Tab на ручку, стрелки двигают границу', async () => {
		const user = userEvent.setup()
		const { emitted } = render(BaseImageCompare, { props: { before: 'a.png', after: 'b.png', beforeAlt: 'До', afterAlt: 'После' } })

		await user.tab()
		expect(screen.getByRole('slider')).toHaveFocus()
		await user.keyboard('{ArrowLeft}{ArrowLeft}')
		expect(emitted('update:position')).toEqual([[49], [48]])
	})
})
