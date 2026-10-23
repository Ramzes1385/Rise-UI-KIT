import { sliderNav } from '../../../shared'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../../BaseSlider.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Flip: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Переворот (`animation="flip"`): слайд поворачивается, как карточка, и на обороте оказывается следующий.',
					'В вертикальном режиме — переворот вверх-вниз. При `prefers-reduced-motion` смена мгновенная.',
				].join('\n'),
			},
		},
	},
	args: { animation: 'flip' },
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Следующий слайд' }))
		await expect(sliderNav(canvasElement, 2)).toHaveAttribute('aria-current', 'true')
		await expect(
			canvasElement.querySelector<HTMLElement>('.base-slider__slide--active')?.style.getPropertyValue('--slide-offset'),
		).toBe('0')

		const viewport = canvasElement.querySelector<HTMLElement>('.base-slider__viewport')!
		const { left, top, width, height } = viewport.getBoundingClientRect()
		await waitFor(() => {
			const hit = document.elementFromPoint(left + width / 2, top + height / 2)
			expect(hit?.closest('.base-slider__slide')).toHaveClass('base-slider__slide--active')
		})

		await userEvent.keyboard('{Enter}')
		await expect(sliderNav(canvasElement, 3)).toHaveAttribute('aria-current', 'true')
	},
}
