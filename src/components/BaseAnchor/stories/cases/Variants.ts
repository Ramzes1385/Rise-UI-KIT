import { items } from '../shared'
import type meta from '../BaseAnchor.stories'
import BaseAnchor from '../../ui/BaseAnchor.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { ANCHOR_VARIANTS } from '../../types/BaseAnchor.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-row" style="align-items: flex-start">
		<div v-for="variant in ANCHOR_VARIANTS" :key="variant" class="story-col" style="width: 200px">
			<span class="story-label">{{ variant }}</span>
			<BaseAnchor v-bind="args" :variant="variant" :items="items" :label="'Содержание: ' + variant" />
		</div>
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: '`default` — линия с отметкой текущего пункта, `soft` — мягкая заливка. Текущий — первый пункт.' },
			source: storySource({ template, imports: ['BaseAnchor', 'ANCHOR_VARIANTS'], script: `const items = ${literal(items)}` }),
		},
		controls: { include: ['sizeScale', 'direction'] },
	},
	render: args => ({
		components: { BaseAnchor },
		setup: useStorySetup(args, { data: { ANCHOR_VARIANTS, items } }),
		template,
	}),
}
