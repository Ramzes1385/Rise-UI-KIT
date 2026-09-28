import type meta from '../BaseInputTags.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseInputTags from '../../ui/BaseInputTags.vue'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { INPUT_TAGS_VARIANTS } from '../../types/BaseInputTags.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Варианты поля — как у BaseInput.' } }, controls: { include: ['sizeScale'] } },
	render: args => ({
		components: { BaseInputTags },
		setup: () => ({ props: useArgsWithoutSlots(args, ['variant', 'label']), variants: INPUT_TAGS_VARIANTS }),
		template: `
			<div class="story-grid" style="--story-grid-min: 240px;">
				<BaseInputTags v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" :label="variant" />
			</div>
		`,
	}),
}
