import { expect } from 'storybook/test'
import type meta from '../BaseFlowMap3D.stories'
import { flowScene, waitForCanvas } from '../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap3D from '../../ui/BaseFlowMap3D.vue'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseFlowMap3D v-bind="args" />
`

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Песочница.' },
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
		const scene = flowScene(canvas)
		await expect(scene).toHaveAttribute('aria-roledescription', '3D-карта связей')
		await tabTo(scene, userEvent)
		await expect(scene).toHaveFocus()
	},
}
