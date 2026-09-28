import { starOf, pointOn } from '../shared'
import type meta from '../BaseRating.stories'
import { waitFor, expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Песочница: кликните по звезде или меняйте props в Controls — оценка синхронизирована.' } },
	},
	play: async ({ canvas, userEvent }) => {
		const star = starOf(canvas.getByRole('slider'), 3)
		await userEvent.pointer({ keys: '[MouseLeft]', target: star, coords: pointOn(star) })
		await waitFor(() => expect(canvas.getByRole('slider')).toHaveAttribute('aria-valuetext', '4 из 5'))
	},
}
