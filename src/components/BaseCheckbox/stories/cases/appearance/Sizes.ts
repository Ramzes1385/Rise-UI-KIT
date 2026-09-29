import { ref } from 'vue'
import type meta from '../../BaseCheckbox.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseCheckbox from '../../../ui/BaseCheckbox.vue'
import { SIZE_PRESETS, useArgsWithoutSlots, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant'] },
		docs: {
			description: { story: 'Размеры через `sizeScale`: квадрат 12, 14, 16, 18 и 20px, подпись масштабируется вместе с ним.' },
			source: {
				code: SIZE_PRESETS.map(p => `<BaseCheckbox v-model="checked" :size-scale="${p.sizeScale}" label="${p.name}" />`).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseCheckbox },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['modelValue', 'label', 'sizeScale', 'onUpdate:modelValue']),
			presets: SIZE_PRESETS,
			sizeLabel,
			values: ref(Object.fromEntries(SIZE_PRESETS.map(preset => [preset.name, true]))),
		}),
		template: `
			<div class="story-col">
				<BaseCheckbox
					v-for="preset in presets"
					:key="preset.name"
					v-bind="props"
					v-model="values[preset.name]"
					:size-scale="preset.sizeScale"
					:label="sizeLabel(preset)" />
			</div>
		`,
	}),
}
