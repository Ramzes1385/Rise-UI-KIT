import { items } from '../../shared'
import { expect } from 'storybook/test'
import type meta from '../../BaseAnchor.stories'
import BaseAnchor from '../../../ui/BaseAnchor.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { ANCHOR_VARIANTS } from '../../../types/BaseAnchor.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-stack">
		<BaseAnchor v-for="variant in ANCHOR_VARIANTS" :key="variant" v-bind="args" direction="horizontal" :variant="variant" :items="items" :label="'Содержание: ' + variant" />
	</div>
`

export const Horizontal: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Строка над текстом (`direction="horizontal"`): для узких экранов и вкладок по разделам. Вложенность не сдвигается.',
			},
			source: storySource({ template, imports: ['BaseAnchor', 'ANCHOR_VARIANTS'], script: `const items = ${literal(items)}` }),
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseAnchor },
		setup: useStorySetup(args, { data: { ANCHOR_VARIANTS, items } }),
		template,
	}),
	play: async ({ canvas }) => {
		const nav = canvas.getByRole('navigation', { name: 'Содержание: default' })
		await expect(nav).toHaveClass('base-anchor--horizontal')
	},
}
