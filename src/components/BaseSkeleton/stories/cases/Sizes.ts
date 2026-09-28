import type meta from '../BaseSkeleton.stories'
import BaseSkeleton from '../../ui/BaseSkeleton.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { SIZE_PRESETS, useArgsWithoutSlots, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['isAnimated', 'isPulse'] },
		docs: {
			description: { story: 'Размеры задаются `sizeScale`: он масштабирует `width`/`height`, высоту строки `text` и скругления.' },
			source: {
				code: SIZE_PRESETS.map(preset => `<BaseSkeleton shape="text" :width="160" :size-scale="${preset.sizeScale}" />`).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseSkeleton },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['default', 'shape', 'width', 'height', 'sizeScale']),
			presets: SIZE_PRESETS,
			sizeLabel,
		}),
		template: `
			<div class="story-stack">
				<div v-for="preset in presets" :key="preset.name" class="story-row" style="flex-wrap: nowrap;">
					<span class="story-label">{{ sizeLabel(preset) }}</span>
					<BaseSkeleton v-bind="props" shape="circle" :width="32" :height="32" :size-scale="preset.sizeScale" />
					<BaseSkeleton v-bind="props" shape="text" :width="160" :size-scale="preset.sizeScale" />
				</div>
			</div>
		`,
	}),
}
