import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import BasePresentationPlayer from '../ui/BasePresentationPlayer.vue'

const slides = [
	{ id: 'a', title: 'Первый', image: '/a.png', duration: 5 },
	{ id: 'b', title: 'Второй', image: '/b.png', duration: 5 },
]

describe('BasePresentationPlayer integration', () => {
	it('стрелка вправо внутри плеера переключает слайд', async () => {
		const user = userEvent.setup()
		const { emitted } = render(BasePresentationPlayer, { props: { title: 'Курс', slides } })
		screen.getByRole('button', { name: 'Следующий слайд' }).focus()
		await user.keyboard('{ArrowRight}')
		expect(emitted('update:slide')).toEqual([[1]])
	})
})
