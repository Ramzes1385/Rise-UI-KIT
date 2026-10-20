import { expect } from 'storybook/test'
import type meta from '../../BaseFlowMap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap3D from '../../../ui/BaseFlowMap3D.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseFlowMap3D v-bind="args" />
`

export const Empty: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'В данных нет узлов: вместо пустой сцены — сообщение ядра карты. Слот `empty` заменяет его своим содержимым.',
			},
			source: storySource({
				template,
				imports: [],
				importsFrom: { '@ramzes1385/rise-ui-kit/flow3d': ['BaseFlowMap3D'] },
			}),
		},
	},
	args: { data: { version: 1, title: 'Оформление заказа', nodes: [], edges: [] } },
	render: args => ({
		components: { BaseFlowMap3D },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas, canvasElement }) => {
		await expect(canvas.getByRole('region', { name: 'Оформление заказа' })).toBeVisible()
		await expect(canvasElement.querySelector('.base-flow-map-3d__tag')).toBeNull()
	},
}
