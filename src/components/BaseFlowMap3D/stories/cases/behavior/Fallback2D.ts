import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseFlowMap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap3D from '../../../ui/BaseFlowMap3D.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const MODELS = { view: 'view' } as const

const template = `
	<BaseFlowMap3D v-bind="args" v-model:view="view" />
`

export const Fallback2D: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: '`view="2d"` показывает ту же карту в 2D — BaseFlowMap с теми же данными, выбором, сценарием и слотами. Переключатель «3D / 2D» в нижней панели ведёт туда и обратно (`v-model:view`), выбор узла и масштаб сохраняются. Без WebGL карта показывает 2D сама при любом значении `view`.',
			},
			source: storySource({
				template,
				imports: [],
				importsFrom: { '@ramzes1385/rise-ui-kit/flow3d': ['BaseFlowMap3D'] },
				models: MODELS,
				types: { view: "'3d' | '2d'" },
			}),
		},
	},
	args: { view: '2d' },
	render: args => ({
		components: { BaseFlowMap3D },
		setup: useStorySetup(args, { models: MODELS }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await expect(await canvas.findByRole('graphics-document', { name: 'Схема: Оформление заказа' })).toBeVisible()
		await expect(canvasElement.querySelector('canvas')).toBeNull()
		await userEvent.click(canvas.getByRole('radio', { name: '3D' }))
		await waitFor(() => expect(canvasElement.querySelector('canvas')).not.toBeNull())
		await expect(canvas.getByRole('group', { name: 'Оформление заказа' })).toBeVisible()
		await userEvent.click(canvas.getByRole('radio', { name: '2D' }))
		await expect(await canvas.findByRole('graphics-document', { name: 'Схема: Оформление заказа' })).toBeVisible()
	},
}
