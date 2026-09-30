import type meta from '../BaseTextDiff.stories'
import BaseTextDiff from '../../ui/BaseTextDiff.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { SHORT_AFTER, SHORT_BEFORE } from '../shared'
import { SIZE_PRESETS, sizeLabel, useArgsWithoutSlots } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125.' } },
		controls: { include: ['variant', 'mode'] },
	},
	render: args => ({
		components: { BaseTextDiff },
		setup: () => ({ props: useArgsWithoutSlots(args), presets: SIZE_PRESETS, sizeLabel, before: SHORT_BEFORE, after: SHORT_AFTER }),
		template: `
			<div class="story-stack">
				<BaseTextDiff
					v-for="preset in presets"
					:key="preset.name"
					v-bind="props"
					:before="before"
					:after="after"
					:size-scale="preset.sizeScale"
					:label="sizeLabel(preset)" />
			</div>
		`,
	}),
}
