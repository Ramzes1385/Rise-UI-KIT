import { ref } from 'vue'
import type meta from '../../BaseSelect.stories'
import BaseSelect from '../../../ui/BaseSelect.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { SIZE_PRESETS, useArgsWithoutSlots, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant'] },
		docs: {
			description: {
				story: 'Размеры через `sizeScale`: высота триггера 24, 28, 32, 36 и 40px — как у поля и кнопки того же размера.',
			},
			source: {
				code: SIZE_PRESETS.map(p => `<BaseSelect v-model="city" :options="cities" :size-scale="${p.sizeScale}" />`).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseSelect },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['modelValue', 'label', 'sizeScale', 'onUpdate:modelValue']),
			presets: SIZE_PRESETS,
			sizeLabel,
			values: ref<Record<string, string>>({}),
		}),
		template: `
			<div class="story-col story-narrow">
				<BaseSelect
					v-for="preset in presets"
					:key="preset.name"
					v-bind="props"
					v-model="values[preset.name]"
					:size-scale="preset.sizeScale"
					:placeholder="sizeLabel(preset)" />
			</div>
		`,
	}),
}
