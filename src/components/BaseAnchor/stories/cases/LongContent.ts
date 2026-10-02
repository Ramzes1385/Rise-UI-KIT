import type meta from '../BaseAnchor.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const LongContent: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'TODO(scaffold): длинное содержимое: перенос или обрезка, ширина не больше контейнера.' } },
	},
}
