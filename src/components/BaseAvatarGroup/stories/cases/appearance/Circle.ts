import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseAvatarGroup.stories'

export const Square: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Квадратные аватары (`shape="square"`) — для команд и организаций.' } } },
	args: { shape: 'square' },
}
