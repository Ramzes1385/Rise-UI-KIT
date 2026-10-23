import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseImageCompare.stories'
import { storySource, useStorySetup } from '@/stories/helpers'
import BaseImageCompare from '../../../ui/BaseImageCompare.vue'
import { IMAGE_COMPARE_VARIANTS } from '../../../types/BaseImageCompare.types'

const template = `
	<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px">
		<BaseImageCompare v-for="variant in IMAGE_COMPARE_VARIANTS" :key="variant" v-bind="args" :variant="variant" />
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: '`default` — рамка и скругления, `ghost` — без них; свои подписи углов.' },
			source: storySource({ template, imports: ['BaseImageCompare', 'IMAGE_COMPARE_VARIANTS'], omit: ['variant'] }),
		},
		controls: { include: ['sizeScale'] },
	},
	args: { position: 35, beforeLabel: 'Эскиз', afterLabel: 'Макет' },
	render: args => ({
		components: { BaseImageCompare },
		setup: useStorySetup(args, { data: { IMAGE_COMPARE_VARIANTS } }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getAllByRole('slider', { name: 'Граница между «Эскиз» и «Макет»' })).toHaveLength(2)
	},
}
