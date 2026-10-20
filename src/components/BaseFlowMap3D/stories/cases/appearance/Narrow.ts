import { expect } from 'storybook/test'
import type meta from '../../BaseFlowMap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap3D from '../../../ui/BaseFlowMap3D.vue'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'
import { expectDetails, flowScene, waitForCanvas } from '../../shared'

const template = `
	<div style="width: 100%; max-width: 600px">
		<BaseFlowMap3D v-bind="args" :modes="['view', 'edit']" />
	</div>
`

export const Narrow: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Карта в контейнере 600 px (ширина — контейнера, а не окна): уже `compactBreakpoint` (640) — панели сценария и свойств уходят вниз и сворачиваются, подсказка короче. Кнопки «Правка» нет: правка в 3D — только от 768 px (на телефоне — правка ядра карты в 2D). Выбор, камера и клавиатура работают так же.',
			},
			source: storySource({
				template,
				imports: [],
				importsFrom: { '@ramzes1385/rise-ui-kit/flow3d': ['BaseFlowMap3D'] },
			}),
		},
	},
	render: args => ({
		components: { BaseFlowMap3D },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await waitForCanvas(canvasElement)
		await expect(canvasElement.querySelector('.base-flow-map-3d--compact')).not.toBeNull()
		await expect(canvas.queryByRole('button', { name: 'Правка' })).toBeNull()
		await tabTo(flowScene(canvas), userEvent)
		await userEvent.keyboard('Kafka')
		await userEvent.keyboard('{Enter}')
		await expectDetails({ canvas, canvasElement, userEvent }, 'Kafka')
	},
}
