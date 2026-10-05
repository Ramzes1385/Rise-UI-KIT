import { expect, waitFor } from 'storybook/test'
import type meta from '../BaseImageMap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseImageMap3D from '../../ui/BaseImageMap3D.vue'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const MODELS = { view: 'view' } as const

const template = `
	<div class="story-medium">
		<BaseImageMap3D v-bind="args" v-model:view="view" />
	</div>
`

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Песочница: область 3D-карты с холстом WebGL. Область достижима клавишей Tab, скринридер называет её «3D-карта». Наведение подсвечивает объект и показывает карточку, щелчок выбирает; стрелки в области — между объектами. Props — в панели Controls.',
			},
			source: storySource({ template, imports: ['BaseImageMap3D'], models: MODELS, types: { view: "'3d' | '2d'" } }),
		},
	},
	render: args => ({
		components: { BaseImageMap3D },
		setup: useStorySetup(args, { models: MODELS }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const region = canvas.getByRole('group', { name: 'Этаж 1' })
		await expect(region).toHaveAttribute('aria-roledescription', '3D-карта')
		await tabTo(region, userEvent)
		await expect(region).toHaveFocus()
		await waitFor(() => expect(canvasElement.querySelector('canvas')).toHaveAttribute('aria-hidden', 'true'))
	},
}
