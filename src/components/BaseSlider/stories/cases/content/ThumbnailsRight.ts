import { sliderNav } from '../../shared'
import type meta from '../../BaseSlider.stories'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import { STORY_WAIT_TIMEOUT } from '@/stories/helpers'

export const ThumbnailsRight: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'`thumbnailsPosition="right"` вместе с точками (`navigation="both"`): точки и миниатюры — столбцами справа.',
					'Стрелки листают слайды, лента сама докручивается до текущей миниатюры, а фокус остаётся на стрелке.',
				].join('\n'),
			},
		},
	},
	args: { navigation: 'both', thumbnailsPosition: 'right', height: '320px', hasCaption: false, isLoop: false },
	play: async ({ canvas, canvasElement, userEvent }) => {
		const strip = canvasElement.querySelector<HTMLElement>('.base-slider__thumbs')!
		const viewport = canvasElement.querySelector<HTMLElement>('.base-slider__viewport')!
		await expect(strip.getBoundingClientRect().left).toBeGreaterThanOrEqual(viewport.getBoundingClientRect().right)

		const prev = canvas.getByRole('button', { name: 'Предыдущий слайд' })
		await userEvent.click(prev)
		await expect(prev).toHaveAttribute('aria-disabled', 'true')

		const next = canvas.getByRole('button', { name: 'Следующий слайд' })
		for (let step = 0; step < 5; step += 1) await userEvent.click(next)
		await expect(next).toHaveFocus()
		const thumbs = canvasElement.querySelectorAll<HTMLElement>('.base-slider__thumb')
		await expect(thumbs[5]).toHaveAttribute('aria-current', 'true')
		await waitFor(() => expect(strip.scrollTop).toBeGreaterThan(0), { timeout: STORY_WAIT_TIMEOUT })
		await expect(sliderNav(canvasElement, 6)).toBeInTheDocument()
	},
}
