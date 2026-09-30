import type meta from '../../BaseButton.stories'
import BaseButton from '../../../ui/BaseButton.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const variants = ['default', 'soft', 'outline', 'ghost', 'shadow']

const template = `
	<div class="story-row">
		<BaseButton v-for="variant in variants" :key="variant" v-bind="args" :variant="variant">{{ variant }}</BaseButton>
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	argTypes: { variant: { control: false } },
	parameters: {
		docs: {
			description: {
				story: 'Пять вариантов оформления. Остальные props из Controls (размер, состояния) применяются ко всем кнопкам.',
			},
			source: storySource({ template, imports: ['BaseButton'], script: `const variants = ${literal(variants)}`, omit: ['variant'] }),
		},
	},
	render: args => ({
		components: { BaseButton },
		setup: useStorySetup(args, { data: { variants } }),
		template,
	}),
}
