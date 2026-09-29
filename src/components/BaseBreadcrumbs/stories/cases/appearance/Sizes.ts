import { SLOT_KEYS } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseBreadcrumbs.stories'
import BaseBreadcrumbs from '../../../ui/BaseBreadcrumbs.vue'
import { SIZE_PRESETS, useArgsWithoutSlots, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	args: { variant: 'outline' },
	argTypes: { sizeScale: { control: false } },
	parameters: {
		docs: {
			description: {
				story: 'Размеры через `sizeScale`: текст 12–17px, контейнерные варианты — высотой с контрол того же размера (24–40px).',
			},
			source: {
				code: SIZE_PRESETS.map(p => `<BaseBreadcrumbs :items="items" variant="outline" :size-scale="${p.sizeScale}" />`).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseBreadcrumbs },
		setup: () => ({ props: useArgsWithoutSlots(args, SLOT_KEYS), presets: SIZE_PRESETS, sizeLabel }),
		template: `
			<div class="story-stack">
				<div v-for="preset in presets" :key="preset.name" class="story-col">
					<span class="story-label">{{ sizeLabel(preset) }}</span>
					<BaseBreadcrumbs v-bind="props" :size-scale="preset.sizeScale" :aria-label="'Хлебные крошки: ' + preset.name" />
				</div>
			</div>
		`,
	}),
}
