import type meta from '../BaseBadge.stories'
import BaseBadge from '../../ui/BaseBadge.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale'] },
		docs: {
			description: { story: 'Пять вариантов оформления. Размер из Controls применяется ко всем бейджам.' },
			source: {
				code: ['default', 'soft', 'outline', 'ghost', 'shadow']
					.map(variant => `<BaseBadge variant="${variant}" label="${variant}" />`)
					.join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseBadge },
		setup: () => ({ props: useArgsWithoutSlots(args), variants: ['default', 'soft', 'outline', 'ghost', 'shadow'] }),
		template: `
			<div class="story-row">
				<BaseBadge v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" :label="variant" />
			</div>
		`,
	}),
}
