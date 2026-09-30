import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseAddressInput.stories'
import BaseAddressInput from '../../../ui/BaseAddressInput.vue'
import { SIZE_PRESETS, sizeLabel, useArgsWithoutSlots } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125.' } },
		controls: { include: ['variant'] },
	},
	args: { modelValue: 'г Москва, ул Тверская, д 7' },
	render: args => ({
		components: { BaseAddressInput },
		setup: () => ({ props: useArgsWithoutSlots(args), presets: SIZE_PRESETS, sizeLabel }),
		template: `
			<div style="display: flex; flex-direction: column; gap: 16px; max-width: 420px">
				<BaseAddressInput v-for="preset in presets" :key="preset.name" v-bind="props" :size-scale="preset.sizeScale" :label="sizeLabel(preset)" />
			</div>`,
	}),
}
