import type meta from '../BaseRange.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Песочница: перетащите ползунок, кликните по треку или меняйте props в Controls — значение синхронизировано.',
			},
		},
	},
	args: { hasLabel: true },
}
