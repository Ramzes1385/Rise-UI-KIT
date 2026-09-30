import type meta from '../BaseInputTags.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseInputTags from '../../ui/BaseInputTags.vue'
import { INPUT_TAGS_VARIANTS } from '../../types/BaseInputTags.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const variants = INPUT_TAGS_VARIANTS

const template = `
	<div class="story-grid" style="--story-grid-min: 240px;">
		<BaseInputTags v-for="variant in variants" :key="variant" v-bind="args" :variant="variant" :label="variant" />
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Варианты поля — как у BaseInput.' },
			source: storySource({
				template,
				imports: ['BaseInputTags'],
				script: `const variants = ${literal(variants)}`,
				omit: ['variant', 'label'],
			}),
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseInputTags },
		setup: useStorySetup(args, { data: { variants }, slots: ['variant', 'label'] }),
		template,
	}),
}
