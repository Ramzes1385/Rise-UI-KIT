import type meta from '../BaseSegmented.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSegmented from '../../ui/BaseSegmented.vue'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { SEGMENTED_VARIANTS } from '../../types/BaseSegmented.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Варианты: `default` — выбранный сегмент белый с тенью, `soft` — мягкий основной цвет, `outline` — рамка.',
			},
		},
		controls: { include: ['sizeScale', 'isBlock'] },
	},
	render: args => ({
		components: { BaseSegmented },
		setup: () => ({ props: useArgsWithoutSlots(args, ['variant', 'label']), variants: SEGMENTED_VARIANTS }),
		template: `
			<div class="story-stack">
				<BaseSegmented v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" :label="variant" />
			</div>
		`,
	}),
}
