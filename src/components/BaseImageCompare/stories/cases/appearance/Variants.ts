import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseImageCompare.stories'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseImageCompare from '../../../ui/BaseImageCompare.vue'
import { IMAGE_COMPARE_VARIANTS } from '../../../types/BaseImageCompare.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: '`default` — рамка и скругления, `ghost` — без них; свои подписи углов.' } },
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseImageCompare },
		setup: () => ({ props: useArgsWithoutSlots(args), variants: IMAGE_COMPARE_VARIANTS }),
		template: `
			<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px">
				<BaseImageCompare v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" :position="35" before-label="Эскиз" after-label="Макет" />
			</div>`,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getAllByRole('slider', { name: 'Граница между «Эскиз» и «Макет»' })).toHaveLength(2)
	},
}
