import type meta from '../../BaseCalendar.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseCalendar from '../../../ui/BaseCalendar.vue'
import { literal, SIZE_PRESETS, sizeLabel, storyDate, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const state = { values: Object.fromEntries(SIZE_PRESETS.map(preset => [preset.name, storyDate(0, 0, 0)])) }

const template = `
	<div class="story-row" style="align-items: flex-start;">
		<div v-for="preset in presets" :key="preset.name" class="story-col">
			<span class="story-label">{{ preset.label }}</span>
			<BaseCalendar v-bind="args" v-model="values[preset.name]" :size-scale="preset.sizeScale" :display-config="{ showTodayButton: false }" />
		</div>
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant'] },
		docs: {
			description: {
				story: 'Размеры через `sizeScale`: день и кнопки шапки — 24, 28, 32, 36 и 40px, как высота кнопки того же размера.',
			},
			source: storySource({
				template,
				imports: ['BaseCalendar'],
				script: `const presets = ${literal(presets)}`,
				state,
				types: { values: 'Record<string, Date | null>' },
				omit: ['modelValue', 'sizeScale', 'onUpdate:modelValue'],
			}),
		},
	},
	render: args => ({
		components: { BaseCalendar },
		setup: useStorySetup(args, { state, data: { presets }, slots: ['modelValue', 'sizeScale', 'onUpdate:modelValue'] }),
		template,
	}),
}
