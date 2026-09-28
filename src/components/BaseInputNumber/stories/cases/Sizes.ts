import type meta from '../BaseInputNumber.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseInputNumber from '../../ui/BaseInputNumber.vue'
import { useArgsWithoutSlots, SIZE_PRESETS, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Размеры через `sizeScale`: высота поля и кнопок 24, 32 и 40px.' } },
		controls: { include: ['variant'] },
	},
	render: args => ({
		components: { BaseInputNumber },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['sizeScale', 'label']),
			presets: SIZE_PRESETS.filter(preset => ['xs', 'md', 'xl'].includes(preset.name)),
			sizeLabel,
		}),
		template: `
			<div class="story-row">
				<BaseInputNumber v-for="preset in presets" :key="preset.name" v-bind="props" :size-scale="preset.sizeScale" :label="sizeLabel(preset)" />
			</div>
		`,
	}),
}
