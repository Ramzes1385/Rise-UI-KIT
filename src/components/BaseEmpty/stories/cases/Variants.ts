import type meta from '../BaseEmpty.stories'
import BaseEmpty from '../../ui/BaseEmpty.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale', 'icon'] },
		docs: {
			description: { story: 'Три варианта: `default` — пунктирная рамка, `soft` — мягкий фон, `ghost` — без рамки и отступов.' },
			source: {
				code: ['default', 'soft', 'ghost']
					.map(variant => `<BaseEmpty variant="${variant}" title="${variant}" description="…" />`)
					.join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseEmpty },
		setup: () => ({ props: useArgsWithoutSlots(args, ['title']), variants: ['default', 'soft', 'ghost'] }),
		template: `
			<div class="story-grid" style="--story-grid-min: 240px; align-items: start;">
				<BaseEmpty v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" :title="variant" />
			</div>
		`,
	}),
}
