import { sliderNav } from '../../../shared'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../../BaseSlider.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Fade: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Смена растворением (`animation="fade"`); `scale` и `flip` работают так же. Слайды лежат друг на друге,',
					'но клики и Tab достаются только видимому.',
				].join('\n'),
			},
		},
	},
	args: { animation: 'fade' },
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Следующий слайд' }))
		await expect(sliderNav(canvasElement, 2)).toHaveAttribute('aria-current', 'true')

		const viewport = canvasElement.querySelector<HTMLElement>('.base-slider__viewport')!
		const { left, top, width, height } = viewport.getBoundingClientRect()
		await waitFor(() => {
			const hit = document.elementFromPoint(left + width / 2, top + height / 2)
			expect(hit?.closest('.base-slider__slide')).toHaveClass('base-slider__slide--active')
		})
	},
}
