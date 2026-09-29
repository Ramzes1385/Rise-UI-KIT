import { ref } from 'vue'
import { BasePin } from '@components/BasePin'
import type meta from '../../BaseFormField.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFormField from '../../../ui/BaseFormField.vue'
import { SIZE_PRESETS, useArgsWithoutSlots, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'description', 'error', 'isRequired'] },
		docs: {
			description: {
				story: 'Размеры через `sizeScale`: масштабируются подпись, описание и вложенный контрол без своего `sizeScale`.',
			},
			source: {
				code: SIZE_PRESETS.map(p => `<BaseFormField :size-scale="${p.sizeScale}" label="${p.name}">…</BaseFormField>`).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseFormField, BasePin },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['default', 'label', 'sizeScale']),
			presets: SIZE_PRESETS,
			sizeLabel,
			values: ref<Record<string, string>>(Object.fromEntries(SIZE_PRESETS.map(preset => [preset.name, '']))),
		}),
		template: `
			<div class="story-col story-narrow">
				<BaseFormField
					v-for="preset in presets"
					:key="preset.name"
					v-bind="props"
					:size-scale="preset.sizeScale"
					:label="sizeLabel(preset)">
					<BasePin v-model="values[preset.name]" />
				</BaseFormField>
			</div>
		`,
	}),
}
