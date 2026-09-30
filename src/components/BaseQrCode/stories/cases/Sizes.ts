import type meta from '../BaseQrCode.stories'
import BaseQrCode from '../../ui/BaseQrCode.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { SIZE_PRESETS, sizeLabel, useArgsWithoutSlots } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125% от `size` 120px.' } },
		controls: { include: ['variant'] },
	},
	render: args => ({
		components: { BaseQrCode },
		setup: () => ({ props: useArgsWithoutSlots(args), presets: SIZE_PRESETS, sizeLabel }),
		template: `
			<div class="story-row" style="align-items: flex-end">
				<figure v-for="preset in presets" :key="preset.name" style="margin: 0; text-align: center">
					<BaseQrCode v-bind="props" :size="120" :size-scale="preset.sizeScale" :label="'QR-код, размер ' + preset.name" />
					<figcaption class="story-label">{{ sizeLabel(preset) }}</figcaption>
				</figure>
			</div>
		`,
	}),
}
