import { ref } from 'vue'
import type meta from '../BaseCalendar.stories'
import BaseCalendar from '../../ui/BaseCalendar.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { SIZE_PRESETS, useArgsWithoutSlots, sizeLabel, storyDate } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant'] },
		docs: {
			description: {
				story: 'Размеры через `sizeScale`: день и кнопки шапки — 24, 28, 32, 36 и 40px, как высота кнопки того же размера.',
			},
			source: { code: SIZE_PRESETS.map(p => `<BaseCalendar v-model="date" :size-scale="${p.sizeScale}" />`).join('\n') },
		},
	},
	render: args => ({
		components: { BaseCalendar },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['modelValue', 'sizeScale', 'onUpdate:modelValue']),
			presets: SIZE_PRESETS,
			sizeLabel,
			values: ref<Record<string, Date | null>>(Object.fromEntries(SIZE_PRESETS.map(p => [p.name, storyDate(0, 0, 0)]))),
		}),
		template: `
			<div class="story-row" style="align-items: flex-start;">
				<div v-for="preset in presets" :key="preset.name" class="story-col">
					<span class="story-label">{{ sizeLabel(preset) }}</span>
					<BaseCalendar v-bind="props" v-model="values[preset.name]" :size-scale="preset.sizeScale" :display-config="{ showTodayButton: false }" />
				</div>
			</div>
		`,
	}),
}
