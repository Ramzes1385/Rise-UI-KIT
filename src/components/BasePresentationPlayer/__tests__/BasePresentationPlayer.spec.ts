import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import BasePresentationPlayer from '../ui/BasePresentationPlayer.vue'

const slides = [
	{ id: 'a', title: 'Первый', image: '/a.png', duration: 5 },
	{ id: 'b', title: 'Второй', image: '/b.png', duration: 5 },
]

describe('BasePresentationPlayer unit', () => {
	it('рендерит область с названием и картинку слайда', async () => {
		render(BasePresentationPlayer, { props: { title: 'Курс', slides } })
		expect(screen.getByRole('region', { name: 'Курс' })).toBeInTheDocument()
		expect(screen.getByRole('img', { name: 'Первый' })).toBeInTheDocument()
	})

	it('кнопка «Следующий слайд» эмитит update:slide', async () => {
		const { emitted } = render(BasePresentationPlayer, { props: { title: 'Курс', slides } })
		await fireEvent.click(screen.getByRole('button', { name: 'Следующий слайд' }))
		expect(emitted('update:slide')).toEqual([[1]])
	})
})
