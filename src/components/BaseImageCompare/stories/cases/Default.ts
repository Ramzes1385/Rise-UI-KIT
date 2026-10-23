import { expect, fireEvent } from 'storybook/test'
import type meta from '../BaseImageCompare.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseImageCompare from '../../ui/BaseImageCompare.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const MODELS = { position: 'position' } as const

const template = `
	<div style="max-width: 560px">
		<BaseImageCompare v-bind="args" v-model:position="position" />
	</div>
`

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Потяните границу, щёлкните в любом месте или нажмите Tab и двигайте её стрелками — граница переезжает плавно.',
			},
			source: storySource({ template, imports: ['BaseImageCompare'], models: MODELS }),
		},
	},
	render: args => ({
		components: { BaseImageCompare },
		setup: useStorySetup(args, { models: MODELS }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const handle = canvas.getByRole('slider', { name: 'Граница между «До» и «После»' })
		await userEvent.tab()
		await expect(handle).toHaveFocus()
		await userEvent.keyboard('{ArrowRight}')
		await expect(handle).toHaveAttribute('aria-valuenow', '51')
		await userEvent.keyboard('{Shift>}{ArrowLeft}{/Shift}')
		await expect(handle).toHaveAttribute('aria-valuetext', '41%')
		await fireEvent.keyDown(handle, { key: 'End' })
		await expect(handle).toHaveAttribute('aria-valuenow', '100')
	},
}
