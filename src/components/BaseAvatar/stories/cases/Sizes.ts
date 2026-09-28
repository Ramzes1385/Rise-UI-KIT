import type meta from '../BaseAvatar.stories'
import BaseAvatar from '../../ui/BaseAvatar.vue'
import { CONTENT_ARGS, anna, ivan } from '../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import { SIZE_PRESETS, useArgsWithoutSlots, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'shape', 'isOnline'] },
		docs: {
			description: {
				story: 'Размеры задаются `sizeScale`. Пресеты xs–xl: 24, 28, 32, 36 и 40px — как высота кнопки того же размера.',
			},
			source: {
				code: SIZE_PRESETS.map(preset => `<BaseAvatar :size-scale="${preset.sizeScale}" name="Анна Смирнова" />`).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseAvatar },
		setup: () => ({ props: useArgsWithoutSlots(args, [...CONTENT_ARGS, 'sizeScale']), presets: SIZE_PRESETS, sizeLabel, anna, ivan }),
		template: `
			<div class="story-row" style="align-items: flex-end;">
				<div v-for="preset in presets" :key="preset.name" class="story-col" style="align-items: center; text-align: center;">
					<BaseAvatar v-bind="props" :size-scale="preset.sizeScale" :name="anna.name" />
					<BaseAvatar v-bind="props" :size-scale="preset.sizeScale" :src="ivan.avatar" :name="ivan.name" />
					<span class="story-label">{{ sizeLabel(preset) }}</span>
				</div>
			</div>
		`,
	}),
}
