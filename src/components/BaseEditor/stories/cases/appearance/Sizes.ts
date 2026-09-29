import { ref } from 'vue'
import { COMPACT_STYLE } from '../../shared'
import type meta from '../../BaseEditor.stories'
import BaseEditor from '../../../ui/BaseEditor.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { SIZE_PRESETS, useArgsWithoutSlots, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	argTypes: { sizeScale: { control: false } },
	parameters: {
		controls: { include: ['variant', 'hasToolbar'] },
		docs: {
			description: {
				story: 'Размеры через `sizeScale`: кнопки тулбара 21–35px (28px при 100), текст 10.5–17.5px, отступы масштабируются пропорционально.',
			},
			source: { code: SIZE_PRESETS.map(p => `<BaseEditor v-model="html" :size-scale="${p.sizeScale}" />`).join('\n') },
		},
	},
	render: args => ({
		components: { BaseEditor },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['toolbar', 'modelValue', 'sizeScale', 'onUpdate:modelValue']),
			presets: SIZE_PRESETS,
			sizeLabel,
			values: ref<Record<string, string>>(
				Object.fromEntries(SIZE_PRESETS.map(p => [p.name, `<p>Размер <strong>${p.name}</strong> — sizeScale ${p.sizeScale}.</p>`])),
			),
			compactStyle: COMPACT_STYLE,
		}),
		template: `
			<div class="story-stack">
				<div v-for="preset in presets" :key="preset.name" class="story-stack" style="gap: 6px;">
					<span class="story-label">{{ sizeLabel(preset) }}</span>
					<BaseEditor v-bind="props" v-model="values[preset.name]" :size-scale="preset.sizeScale" :style="compactStyle" />
				</div>
			</div>
		`,
	}),
}
