import { expect } from 'storybook/test'
import type meta from '../../BaseFlowMap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { flowScene, waitForCanvas } from '../../shared'
import BaseFlowMap3D from '../../../ui/BaseFlowMap3D.vue'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseFlowMap3D v-bind="args" />
`

export const Disabled: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Отключённая карта не реагирует на ввод: нет выбора, правки и сценария, область помечена `aria-disabled`. Сцена остаётся видимой — как снимок схемы.',
			},
			source: storySource({
				template,
				imports: [],
				importsFrom: { '@ramzes1385/rise-ui-kit/flow3d': ['BaseFlowMap3D'] },
			}),
		},
	},
	args: { isDisabled: true },
	render: args => ({
		components: { BaseFlowMap3D },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await waitForCanvas(canvasElement)
		await expect(canvas.getByRole('region', { name: 'Оформление заказа' })).toHaveAttribute('aria-disabled', 'true')
		await tabTo(flowScene(canvas), userEvent)
		await userEvent.keyboard('{Enter}')
		await expect(canvas.queryByRole('region', { name: 'Подробности узла' })).toBeNull()
	},
}
