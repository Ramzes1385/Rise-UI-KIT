import { PEOPLE } from '../../shared'
import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseAvatarGroup.stories'

export const NoSingleRest: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Остался один человек сверх `max` — он показывается вместо «+1».' } } },
	args: { items: PEOPLE.slice(0, 5) },
	play: async ({ canvas }) => {
		await expect(canvas.getAllByRole('listitem')).toHaveLength(5)
		await expect(canvas.queryByText(/и ещё/)).toBeNull()
	},
}
