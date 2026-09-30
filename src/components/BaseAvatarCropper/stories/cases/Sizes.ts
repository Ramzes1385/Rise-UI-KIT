import type meta from '../BaseAvatarCropper.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseAvatarCropper from '../../ui/BaseAvatarCropper.vue'
import { SIZE_PRESETS, sizeLabel, useArgsWithoutSlots } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125% от `size` 160px — область и ползунок.' } },
		controls: { include: ['variant', 'shape'] },
	},
	render: args => ({
		components: { BaseAvatarCropper },
		setup: () => ({ props: useArgsWithoutSlots(args), presets: SIZE_PRESETS, sizeLabel }),
		template: `
			<div class="story-row" style="align-items: flex-start">
				<BaseAvatarCropper
					v-for="preset in presets"
					:key="preset.name"
					v-bind="props"
					:size="160"
					:size-scale="preset.sizeScale"
					:label="'Кадрирование, ' + sizeLabel(preset)" />
			</div>
		`,
	}),
}
