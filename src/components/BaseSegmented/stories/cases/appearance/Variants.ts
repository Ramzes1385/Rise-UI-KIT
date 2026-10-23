import type meta from '../../BaseSegmented.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSegmented from '../../../ui/BaseSegmented.vue'
import { SEGMENTED_VARIANTS } from '../../../types/BaseSegmented.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const variants = SEGMENTED_VARIANTS

const template = `
	<div class="story-stack">
		<BaseSegmented v-for="variant in variants" :key="variant" v-bind="args" :variant="variant" :label="variant" />
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Варианты: `default` — выбранный сегмент белый с тенью, `soft` — мягкий основной цвет, `outline` — рамка.',
			},
			source: storySource({
				template,
				imports: ['BaseSegmented'],
				script: `const variants = ${literal(variants)}`,
				omit: ['variant', 'label'],
			}),
		},
		controls: { include: ['sizeScale', 'isBlock'] },
	},
	render: args => ({
		components: { BaseSegmented },
		setup: useStorySetup(args, { data: { variants }, slots: ['variant', 'label'] }),
		template,
	}),
}
