import type meta from '../../BaseBadge.stories'
import BaseBadge from '../../../ui/BaseBadge.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const variants = ['default', 'soft', 'outline', 'ghost', 'shadow']

const template = `
	<div class="story-row">
		<BaseBadge v-for="variant in variants" :key="variant" v-bind="args" :variant="variant" :label="variant" />
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale'] },
		docs: {
			description: { story: 'Пять вариантов оформления. Размер из Controls применяется ко всем бейджам.' },
			source: storySource({ template, imports: ['BaseBadge'], script: `const variants = ${literal(variants)}` }),
		},
	},
	render: args => ({
		components: { BaseBadge },
		setup: useStorySetup(args, { data: { variants } }),
		template,
	}),
}
