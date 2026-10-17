import type meta from '../BaseFlowMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Песочница: карта сервисов «Оформление заказа» ярусами. Меняйте props в панели Controls.' },
		},
	},
}
