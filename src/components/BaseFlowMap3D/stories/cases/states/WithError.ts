import { expect } from 'storybook/test'
import type meta from '../../BaseFlowMap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap3D from '../../../ui/BaseFlowMap3D.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseFlowMap3D v-bind="args" />
`

export const WithError: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Приложение не смогло загрузить данные и передало текст в `error`: карта показывает его плашкой поверх сцены; панели и ввод скрыты.',
			},
			source: storySource({
				template,
				imports: [],
				importsFrom: { '@ramzes1385/rise-ui-kit/flow3d': ['BaseFlowMap3D'] },
			}),
		},
	},
	args: { error: 'Не удалось загрузить карту. Проверьте соединение и повторите.' },
	render: args => ({
		components: { BaseFlowMap3D },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas, canvasElement }) => {
		await expect(await canvas.findByText('Не удалось загрузить карту. Проверьте соединение и повторите.')).toBeVisible()
		await expect(canvasElement.querySelector('.base-flow-map-3d__status--error')).toBeInTheDocument()
	},
}
