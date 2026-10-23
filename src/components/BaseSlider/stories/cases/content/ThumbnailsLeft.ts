import { sliderNav } from '../../shared'
import type meta from '../../BaseSlider.stories'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import { inlineEnd, inlineStart, STORY_WAIT_TIMEOUT } from '@/stories/helpers'

export const ThumbnailsLeft: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'`thumbnailsPosition="left"`: вертикальная лента миниатюр слева, прокручивается, если не помещается по высоте.',
					'Клавиши ↑ и ↓ переводят фокус по миниатюрам и сразу листают слайд, Home и End — к первой и последней.',
					'Уже 480px по ширине слайдера лента возвращается под слайды.',
				].join('\n'),
			},
		},
	},
	args: { navigation: 'thumbnails', thumbnailsPosition: 'left', height: '320px', hasCaption: false },
	play: async ({ canvasElement, userEvent, args }) => {
		const strip = canvasElement.querySelector<HTMLElement>('.base-slider__thumbs')!
		const viewport = canvasElement.querySelector<HTMLElement>('.base-slider__viewport')!
		await expect(getComputedStyle(strip).flexDirection).toBe('column')
		await expect(inlineEnd(strip.getBoundingClientRect())).toBeLessThanOrEqual(inlineStart(viewport.getBoundingClientRect()))

		sliderNav(canvasElement, 1).focus()
		await userEvent.keyboard('{ArrowDown}')
		await expect(sliderNav(canvasElement, 2)).toHaveFocus()
		await expect(sliderNav(canvasElement, 2)).toHaveAttribute('aria-current', 'true')

		await userEvent.keyboard('{End}')
		await expect(sliderNav(canvasElement, 6)).toHaveFocus()
		await expect(args.onChange).toHaveBeenLastCalledWith(5)
		await waitFor(() => expect(strip.scrollTop).toBeGreaterThan(0), { timeout: STORY_WAIT_TIMEOUT })
	},
}
