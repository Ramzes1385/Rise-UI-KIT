import { docsFrame } from '../../shared'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseDropdownMenu.stories'
import BaseDropdownMenu from '../../../ui/BaseDropdownMenu.vue'
import { useArgsWithoutSlots, SIZE_PRESETS, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant'] },
		docs: {
			...docsFrame(240),
			description: { story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125 — пункты, иконки и отступы панели.' },
		},
	},
	render: args => ({
		components: { BaseDropdownMenu, BaseButton },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['isOpen', 'sizeScale', 'items']),
			presets: SIZE_PRESETS,
			sizeLabel,
			items: [
				[
					{ label: 'Копировать', icon: 'copy' },
					{ label: 'Удалить', icon: 'trash' },
				],
			],
		}),
		template: `
			<div class="story-grid" style="--story-grid-min: 160px;">
				<div v-for="preset in presets" :key="preset.name" style="height: 170px;">
					<BaseDropdownMenu v-bind="props" :items="items" :is-open="true" :size-scale="preset.sizeScale" :aria-label="sizeLabel(preset)">
						<BaseButton variant="outline" :size-scale="preset.sizeScale">{{ sizeLabel(preset) }}</BaseButton>
					</BaseDropdownMenu>
				</div>
			</div>
		`,
	}),
}
