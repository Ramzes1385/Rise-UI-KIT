import type meta from '../../BaseEditor.stories'
import BaseEditor from '../../../ui/BaseEditor.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const state = {
	values: Object.fromEntries(
		SIZE_PRESETS.map(preset => [preset.name, `<p>Размер <strong>${preset.name}</strong> — sizeScale ${preset.sizeScale}.</p>`]),
	),
}

const SERVICE_ARGS = ['toolbar', 'modelValue', 'sizeScale', 'onUpdate:modelValue']

const template = `
	<div class="story-stack">
		<div v-for="preset in presets" :key="preset.name" class="story-stack" style="gap: 6px;">
			<span class="story-label">{{ preset.label }}</span>
			<BaseEditor v-bind="args" v-model="values[preset.name]" :size-scale="preset.sizeScale" style="--editor-min-height: 72px" />
		</div>
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	argTypes: { sizeScale: { control: false } },
	parameters: {
		controls: { include: ['variant', 'hasToolbar'] },
		docs: {
			description: {
				story: 'Размеры через `sizeScale`: кнопки тулбара 21–35px (28px при 100), текст 10.5–17.5px, отступы масштабируются пропорционально.',
			},
			source: storySource({
				template,
				imports: ['BaseEditor'],
				script: `const presets = ${literal(presets)}`,
				state,
				types: { values: 'Record<string, string>' },
				omit: SERVICE_ARGS,
			}),
		},
	},
	render: args => ({
		components: { BaseEditor },
		setup: useStorySetup(args, { state, data: { presets }, slots: SERVICE_ARGS }),
		template,
	}),
}
