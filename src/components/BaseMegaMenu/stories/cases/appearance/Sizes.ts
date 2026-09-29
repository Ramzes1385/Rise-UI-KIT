import type meta from '../../BaseMegaMenu.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseMegaMenu from '../../../ui/BaseMegaMenu.vue'
import { SIZE_PRESETS, useArgsWithoutSlots, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	args: { layout: 'dropdown' },
	argTypes: { sizeScale: { control: false } },
	parameters: {
		docs: {
			description: {
				story: 'Размеры через `sizeScale` (здесь — навигация dropdown): пункты 24–40px, текст и иконки масштабируются пропорционально.',
			},
			source: {
				code: SIZE_PRESETS.map(p => `<BaseMegaMenu layout="dropdown" :items="items" :size-scale="${p.sizeScale}" />`).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseMegaMenu },
		setup: () => ({ props: useArgsWithoutSlots(args, ['column-title', 'nav-item', 'item']), presets: SIZE_PRESETS, sizeLabel }),
		template: `
			<div class="story-stack">
				<div v-for="preset in presets" :key="preset.name" class="story-col">
					<span class="story-label">{{ sizeLabel(preset) }}</span>
					<BaseMegaMenu v-bind="props" :size-scale="preset.sizeScale" />
				</div>
			</div>
		`,
	}),
}
