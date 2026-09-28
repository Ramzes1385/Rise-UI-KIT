import type meta from '../BaseTree.stories'
import BaseTree from '../../ui/BaseTree.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { SIZE_PRESETS, useArgsWithoutSlots, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'arrowPosition'] },
		docs: {
			description: {
				story: 'Размеры через `sizeScale`: высота строки 24, 32 и 40px, отступ уровня и иконки масштабируются вместе с текстом.',
			},
			source: {
				code: ['xs', 'md', 'xl']
					.map(name => `<BaseTree :items="items" :size-scale="${SIZE_PRESETS.find(p => p.name === name)?.sizeScale}" />`)
					.join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseTree },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['sizeScale', 'expandedIds', 'selectedIds']),
			presets: SIZE_PRESETS.filter(preset => ['xs', 'md', 'xl'].includes(preset.name)),
			sizeLabel,
		}),
		template: `
			<div class="story-grid" style="--story-grid-min: 260px;">
				<div v-for="preset in presets" :key="preset.name" class="story-stack" style="gap: 8px;">
					<span class="story-label">{{ sizeLabel(preset) }}</span>
					<BaseTree v-bind="props" :size-scale="preset.sizeScale" :expanded-ids="['src', 'composables']" />
				</div>
			</div>
		`,
	}),
}
