import { ref } from 'vue'
import type meta from '../../BaseTextarea.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseTextarea from '../../../ui/BaseTextarea.vue'
import { SIZE_PRESETS, useArgsWithoutSlots, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant'] },
		docs: {
			description: {
				story: 'Размеры через `sizeScale` при `rows` = 1: высота 24, 28, 32, 36 и 40px — как у инпута и кнопки того же размера.',
			},
			source: {
				code: SIZE_PRESETS.map(
					p => `<BaseTextarea v-model="value" :rows="1" :size-scale="${p.sizeScale}" placeholder="${p.name}" />`,
				).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseTextarea },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['default', 'modelValue', 'label', 'sizeScale', 'rows', 'onUpdate:modelValue']),
			presets: SIZE_PRESETS,
			sizeLabel,
			values: ref<Record<string, string>>(Object.fromEntries(SIZE_PRESETS.map(preset => [preset.name, '']))),
		}),
		template: `
			<div class="story-col story-narrow">
				<BaseTextarea
					v-for="preset in presets"
					:key="preset.name"
					v-bind="props"
					v-model="values[preset.name]"
					:rows="1"
					:size-scale="preset.sizeScale"
					:placeholder="sizeLabel(preset)" />
			</div>
		`,
	}),
}
