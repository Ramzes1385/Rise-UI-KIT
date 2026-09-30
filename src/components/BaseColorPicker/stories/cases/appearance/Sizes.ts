import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseColorPicker.stories'
import BaseColorPicker from '../../../ui/BaseColorPicker.vue'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const state = { colors: {} }

const template = `
	<div class="story-row">
		<div v-for="preset in presets" :key="preset.name" class="story-col" style="align-items: center; gap: 6px;">
			<BaseColorPicker v-bind="args" :model-value="colors[preset.name] ?? '#1d4ed8'" :size-scale="preset.sizeScale" @update:model-value="colors[preset.name] = $event" />
			<span class="story-label" style="min-width: 0;">{{ preset.label }}</span>
		</div>
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['modelValue'] },
		docs: {
			description: {
				story: 'Размеры через `sizeScale`: образец 24, 28, 32, 36 и 40px — как поле того же размера; панель масштабируется вместе с ним.',
			},
			source: storySource({
				template,
				imports: ['BaseColorPicker'],
				script: `const presets = ${literal(presets)}`,
				state,
				types: { colors: 'Record<string, string>' },
				omit: ['modelValue', 'sizeScale', 'onUpdate:modelValue'],
			}),
		},
	},
	render: args => ({
		components: { BaseColorPicker },
		setup: useStorySetup(args, { state, data: { presets }, slots: ['modelValue', 'sizeScale', 'onUpdate:modelValue'] }),
		template,
	}),
}
