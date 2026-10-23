import type meta from '../../BaseEmpty.stories'
import BaseEmpty from '../../../ui/BaseEmpty.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const variants = ['default', 'soft', 'ghost']

const template = `
	<div class="story-grid" style="--story-grid-min: 240px; align-items: start;">
		<BaseEmpty v-for="variant in variants" :key="variant" v-bind="args" :variant="variant" :title="variant" />
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale', 'icon'] },
		docs: {
			description: { story: 'Три варианта: `default` — пунктирная рамка, `soft` — мягкий фон, `ghost` — без рамки и отступов.' },
			source: storySource({
				template,
				imports: ['BaseEmpty'],
				script: `const variants = ${literal(variants)}`,
				omit: ['title', 'variant'],
			}),
		},
	},
	render: args => ({
		components: { BaseEmpty },
		setup: useStorySetup(args, { data: { variants }, slots: ['title'] }),
		template,
	}),
}
