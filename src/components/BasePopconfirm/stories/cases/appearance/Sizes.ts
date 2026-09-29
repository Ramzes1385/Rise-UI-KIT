import { docsFrame } from '../../shared'
import { BaseButton } from '@components/BaseButton'
import type meta from '../../BasePopconfirm.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BasePopconfirm from '../../../ui/BasePopconfirm.vue'
import { useArgsWithoutSlots, SIZE_PRESETS, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		layout: 'padded',
		controls: { include: ['variant'] },
		docs: {
			...docsFrame(300),
			description: { story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125 — текст, отступы и кнопки панели.' },
		},
	},
	render: args => ({
		components: { BasePopconfirm, BaseButton },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['isOpen', 'sizeScale', 'description', 'position']),
			presets: SIZE_PRESETS,
			sizeLabel,
		}),
		template: `
			<div class="story-grid" style="--story-grid-min: 320px; padding-top: 140px;">
				<div v-for="preset in presets" :key="preset.name" style="height: 180px;">
					<BasePopconfirm v-bind="props" :is-open="true" :size-scale="preset.sizeScale" position="top" :title="sizeLabel(preset)">
						<BaseButton variant="outline" :size-scale="preset.sizeScale">{{ sizeLabel(preset) }}</BaseButton>
					</BasePopconfirm>
				</div>
			</div>
		`,
	}),
}
