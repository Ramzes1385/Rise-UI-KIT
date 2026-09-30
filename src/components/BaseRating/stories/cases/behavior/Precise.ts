import { tabTo } from '@/stories/helpers'
import { pointOn, starOf } from '../../shared'
import type meta from '../../BaseRating.stories'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'

export const Precise: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Точный выбор до десятой звезды: `step: 0.1` и `isValueShown`. При наведении число рядом со звёздами показывает оценку,',
					'которую запишет клик. С клавиатуры стрелки меняют оценку на 0,1, PageUp/PageDown — на целую звезду.',
				].join('\n'),
			},
		},
	},
	args: { modelValue: 3.7, step: 0.1, isValueShown: true },
	play: async ({ canvas, canvasElement, userEvent, args }) => {
		const rating = canvas.getByRole('slider')
		await expect(rating).toHaveAttribute('aria-valuetext', '3,7 из 5')
		const value = canvasElement.querySelector('.base-rating__value') as HTMLElement

		const star = starOf(rating, 2)
		await userEvent.pointer({ target: star, coords: pointOn(star, 0.35) })
		await waitFor(() => expect(value).toHaveTextContent('2,4'))
		await userEvent.pointer({ keys: '[MouseLeft]', target: star, coords: pointOn(star, 0.35) })
		await waitFor(() => expect(canvas.getByRole('slider')).toHaveAttribute('aria-valuetext', '2,4 из 5'))
		await userEvent.unhover(star)

		await tabTo(canvas.getByRole('slider'), userEvent)
		await userEvent.keyboard('{ArrowRight}')
		await expect(canvas.getByRole('slider')).toHaveAttribute('aria-valuetext', '2,5 из 5')
		await userEvent.keyboard('{PageUp}')
		await expect(canvas.getByRole('slider')).toHaveAttribute('aria-valuenow', '3.5')
		await expect(value).toHaveTextContent('3,5')
		await expect(args.onChange).toHaveBeenLastCalledWith(3.5)
	},
}
