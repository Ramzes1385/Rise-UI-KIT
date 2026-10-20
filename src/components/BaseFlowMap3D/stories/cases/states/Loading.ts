import { expect } from 'storybook/test'
import type meta from '../../BaseFlowMap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap3D from '../../../ui/BaseFlowMap3D.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseFlowMap3D v-bind="args" />
`

export const Loading: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Данные загружаются: поверх сцены — плашка «Загрузка карты…», область помечена `aria-busy`, ввод не принимается.',
			},
			source: storySource({
				template,
				imports: [],
				importsFrom: { '@ramzes1385/rise-ui-kit/flow3d': ['BaseFlowMap3D'] },
			}),
		},
	},
	args: { isLoading: true },
	render: args => ({
		components: { BaseFlowMap3D },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas, canvasElement }) => {
		await expect(canvas.getByRole('region', { name: 'Оформление заказа' })).toHaveAttribute('aria-busy', 'true')
		await expect(canvas.getByText('Загрузка карты…')).toBeVisible()
		await expect(canvasElement.querySelector('.base-flow-map-3d__status')).toHaveAttribute('aria-hidden', 'true')
	},
}
