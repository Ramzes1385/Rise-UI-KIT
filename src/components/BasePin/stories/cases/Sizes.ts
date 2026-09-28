import { ref } from 'vue'
import { expect } from 'storybook/test'
import BasePin from '../../ui/BasePin.vue'
import type meta from '../BasePin.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { SIZE_PRESETS, useArgsWithoutSlots, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'length'] },
		docs: {
			description: {
				story: 'Размеры через `sizeScale`: ячейки 24, 28, 32, 36 и 40px — такие же, как высота инпута и кнопки того же размера.',
			},
			source: { code: SIZE_PRESETS.map(p => `<BasePin v-model="code" :size-scale="${p.sizeScale}" />`).join('\n') },
		},
	},
	render: args => ({
		components: { BasePin },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['default', 'modelValue', 'sizeScale', 'onUpdate:modelValue']),
			presets: SIZE_PRESETS,
			sizeLabel,
			values: ref<Record<string, string>>(Object.fromEntries(SIZE_PRESETS.map(preset => [preset.name, '48']))),
		}),
		template: `
			<div class="story-col">
				<div v-for="preset in presets" :key="preset.name" class="story-row">
					<span class="story-label">{{ sizeLabel(preset) }}</span>
					<BasePin v-bind="props" v-model="values[preset.name]" :size-scale="preset.sizeScale" :aria-label="'Код, размер ' + preset.name" />
				</div>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const heights = ['xs', 'md', 'xl'].map(
			name =>
				canvas
					.getByRole('group', { name: `Код, размер ${name}` })
					.querySelector('input')!
					.getBoundingClientRect().height,
		)
		await expect(heights).toEqual([24, 32, 40])
	},
}
