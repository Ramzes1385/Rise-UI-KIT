import { ref } from 'vue'
import type meta from '../BaseColorPicker.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseColorPicker from '../../ui/BaseColorPicker.vue'
import { SIZE_PRESETS, useArgsWithoutSlots, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['modelValue'] },
		docs: {
			description: {
				story: 'Размеры через `sizeScale`: образец 24, 28, 32, 36 и 40px — как поле того же размера; панель масштабируется вместе с ним.',
			},
			source: { code: SIZE_PRESETS.map(p => `<BaseColorPicker v-model="color" :size-scale="${p.sizeScale}" />`).join('\n') },
		},
	},
	render: args => ({
		components: { BaseColorPicker },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['modelValue', 'sizeScale', 'onUpdate:modelValue']),
			presets: SIZE_PRESETS,
			sizeLabel,
			colors: ref<Record<string, string>>({}),
		}),
		template: `
			<div class="story-row">
				<div v-for="preset in presets" :key="preset.name" class="story-col" style="align-items: center; gap: 6px;">
					<BaseColorPicker v-bind="props" :model-value="colors[preset.name] ?? '#1d4ed8'" :size-scale="preset.sizeScale" @update:model-value="colors[preset.name] = $event" />
					<span class="story-label" style="min-width: 0;">{{ sizeLabel(preset) }}</span>
				</div>
			</div>
		`,
	}),
}
