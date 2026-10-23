import type meta from '../../BaseMention.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseMention from '../../../ui/BaseMention.vue'
import { MENTION_VARIANTS } from '../../../types/BaseMention.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const variants = MENTION_VARIANTS

const template = `
	<div style="display: grid; gap: 16px; max-width: 560px"><BaseMention v-for="variant in variants" :key="variant" v-bind="args" :variant="variant" :label="variant" /></div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Все варианты оформления. Размер из Controls применяется ко всем.' },
			source: storySource({ template, imports: ['BaseMention'], script: `const variants = ${literal(variants)}` }),
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseMention },
		setup: useStorySetup(args, { data: { variants } }),
		template,
	}),
}
