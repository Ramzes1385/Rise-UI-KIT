import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseImageMap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseImageMap3D from '../../../ui/BaseImageMap3D.vue'
import { DEMO_DETAILED_PLAN } from '../../demo/detailedPlan'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const MODELS = { active: 'active' } as const

const template = `
	<div class="story-medium">
		<BaseImageMap3D v-bind="args" v-model:active="active" />
	</div>
`

export const Detailed3D: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Демо-данные, не реальное здание: условная геометрия из `stories/demo/detailedPlan.ts` для проверки подробных тел. Зал с круглым внутренним углом, атриум с двором (дыра в фигуре), павильон из трёх частей (`parts` с `height3d` и `base3d`), галерея на шести колоннах под изогнутой кровлей, тонкая стена и овальный корпус. Кромки скошены (`scene3d.bevel`), рёбра обведены (`scene3d.outline`); отключить — `bevel: 0` и `outline: false`.',
			},
			source: storySource({
				template,
				imports: [],
				importsFrom: { '@ramzes1385/rise-ui-kit/map3d': ['BaseImageMap3D'] },
				models: MODELS,
				types: { active: 'string | null' },
			}),
		},
	},
	args: { data: DEMO_DETAILED_PLAN, active: 'demo-pavilion' },
	render: args => ({
		components: { BaseImageMap3D },
		setup: useStorySetup(args, { models: MODELS }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent, args }) => {
		const region = canvas.getByRole('group', { name: 'Демо-план: условная геометрия' })
		await tabTo(region, userEvent)
		await expect(region).toHaveFocus()
		await waitFor(() => expect(canvasElement.querySelector('canvas')).not.toBeNull())
		await expect(args.onFallback).not.toHaveBeenCalled()
		await expect(canvas.getByRole('status')).toHaveTextContent('')
	},
}
