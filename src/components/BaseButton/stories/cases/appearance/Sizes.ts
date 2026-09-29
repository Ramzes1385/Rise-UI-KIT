import type meta from '../../BaseButton.stories'
import BaseButton from '../../../ui/BaseButton.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { SIZE_PRESETS, useArgsWithoutSlots, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	argTypes: { sizeScale: { control: false } },
	parameters: {
		docs: {
			description: { story: 'Размеры задаются `sizeScale`. Пресеты соответствуют шкале xs–xl: высота кнопки 24, 28, 32, 36 и 40px.' },
			source: {
				code: SIZE_PRESETS.map(preset => `<BaseButton :size-scale="${preset.sizeScale}">${preset.name}</BaseButton>`).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args), presets: SIZE_PRESETS, sizeLabel }),
		template: `
			<div class="story-row" style="align-items: flex-end;">
				<BaseButton v-for="preset in presets" :key="preset.name" v-bind="props" :size-scale="preset.sizeScale">
					{{ sizeLabel(preset) }}
				</BaseButton>
			</div>
		`,
	}),
}
