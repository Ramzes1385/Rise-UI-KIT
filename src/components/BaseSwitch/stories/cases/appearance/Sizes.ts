import { ref } from 'vue'
import type meta from '../../BaseSwitch.stories'
import BaseSwitch from '../../../ui/BaseSwitch.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { SIZE_PRESETS, useArgsWithoutSlots, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant'] },
		docs: {
			description: {
				story: 'Размеры через `sizeScale`: трек 27×15, 31.5×17.5, 36×20, 40.5×22.5 и 45×25px, подпись масштабируется вместе с ним.',
			},
			source: {
				code: SIZE_PRESETS.map(p => `<BaseSwitch v-model="enabled" :size-scale="${p.sizeScale}" label="${p.name}" />`).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseSwitch },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['default', 'modelValue', 'label', 'sizeScale', 'onUpdate:modelValue']),
			presets: SIZE_PRESETS,
			sizeLabel,
			values: ref(Object.fromEntries(SIZE_PRESETS.map(preset => [preset.name, true]))),
		}),
		template: `
			<div class="story-col">
				<BaseSwitch
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
