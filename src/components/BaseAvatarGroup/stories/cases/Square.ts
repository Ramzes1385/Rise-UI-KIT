import type meta from '../BaseAvatarGroup.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Square: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Квадратные аватары (`shape="square"`) — для команд и организаций.' } } },
	args: { shape: 'square' },
}
