import type meta from '../../BaseRating.stories'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import { fillOf, starOf, pointOn } from '../../shared'

export const HalfStars: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Половинки звёзд (`step: 0.5`): клик в левую половину звезды ставит «.5», в правую — целую оценку.',
					'С `isHoverSmooth: false` и предпросмотр под курсором идёт по половинкам.',
				].join('\n'),
			},
		},
	},
	args: { modelValue: 2.5, step: 0.5, isHoverSmooth: false },
	play: async ({ canvas, userEvent }) => {
		const rating = canvas.getByRole('slider')
		await expect(fillOf(starOf(rating, 2))).toBe('50%')

		const star = starOf(rating, 3)
		await userEvent.pointer({ keys: '[MouseLeft]', target: star, coords: pointOn(star, 0.2) })
		await waitFor(() => expect(canvas.getByRole('slider')).toHaveAttribute('aria-valuetext', '3,5 из 5'))
		await userEvent.unhover(star)
		await waitFor(() => expect(fillOf(starOf(canvas.getByRole('slider'), 3))).toBe('50%'))
	},
}
