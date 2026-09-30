import type meta from '../BaseSignaturePad.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSignaturePad from '../../ui/BaseSignaturePad.vue'
import { SIZE_PRESETS, sizeLabel, useArgsWithoutSlots } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125% — поле, подпись и кнопки.' } },
		controls: { include: ['variant'] },
	},
	render: args => ({
		components: { BaseSignaturePad },
		setup: () => ({ props: useArgsWithoutSlots(args), presets: SIZE_PRESETS, sizeLabel }),
		template: `
			<div class="story-row" style="align-items: flex-start">
				<BaseSignaturePad
					v-for="preset in presets"
					:key="preset.name"
					v-bind="props"
					:width="200"
					:height="80"
					:size-scale="preset.sizeScale"
					:label="sizeLabel(preset)" />
			</div>
		`,
	}),
}
