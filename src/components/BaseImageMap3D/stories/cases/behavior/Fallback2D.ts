import type meta from '../../BaseImageMap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor } from 'storybook/test'
import BaseImageMap3D from '../../../ui/BaseImageMap3D.vue'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const MODELS = { view: 'view', active: 'active' } as const

const template = `
	<div class="story-medium">
		<BaseImageMap3D v-bind="args" v-model:view="view" v-model:active="active" />
	</div>
`

export const Fallback2D: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: "2D-вид (`view: '2d'`): BaseImageMap с теми же данными, пропсами, событиями и слотами — полностью доступная карта. Так же карта выглядит без WebGL. Tab ведёт к объектам, Enter открывает окно.",
			},
			source: storySource({
				template,
				imports: [],
				importsFrom: { '@ramzes1385/rise-ui-kit/map3d': ['BaseImageMap3D'] },
				models: MODELS,
				types: { view: "'3d' | '2d'", active: 'string | null' },
			}),
		},
	},
	args: { view: '2d' },
	render: args => ({
		components: { BaseImageMap3D },
		setup: useStorySetup(args, { models: MODELS }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await expect(canvasElement.querySelector('canvas')).toBeNull()
		const shop = await canvas.findByRole('button', { name: 'Магазин 101' })
		await tabTo(shop, userEvent)
		await userEvent.keyboard('{Enter}')
		const dialog = await screen.findByRole('dialog', { name: 'Магазин 101' })
		await expect(dialog).toBeVisible()
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(shop).toHaveFocus())
		await expect(shop).toHaveAttribute('aria-current', 'true')
	},
}
