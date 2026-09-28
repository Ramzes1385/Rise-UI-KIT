import { expect } from 'storybook/test'
import type meta from '../BaseChip.stories'
import BaseChip from '../../ui/BaseChip.vue'
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { SIZE_PRESETS, useArgsWithoutSlots, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'placement'] },
		docs: {
			description: { story: 'Размеры через `sizeScale`: при 100 индикатор высотой 18px. Кнопка здесь того же размера.' },
			source: {
				code: SIZE_PRESETS.map(preset => `<BaseChip :size-scale="${preset.sizeScale}" :content="3">…</BaseChip>`).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseChip, BaseButton, BaseIcon },
		setup: () => ({ props: useArgsWithoutSlots(args), presets: SIZE_PRESETS, sizeLabel }),
		template: `
			<div class="story-row" style="align-items: flex-end; gap: 32px; padding: 12px;">
				<div v-for="preset in presets" :key="preset.name" class="story-col" style="align-items: center;">
					<BaseChip v-bind="props" :size-scale="preset.sizeScale" :content="3">
						<BaseButton variant="outline" aria-label="Уведомления" :size-scale="preset.sizeScale" :padding="{ x: 5, y: 5 }">
							<BaseIcon name="inbox" />
						</BaseButton>
					</BaseChip>
					<span class="story-label" style="min-width: 0;">{{ sizeLabel(preset) }}</span>
				</div>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const heights = canvas.getAllByText('3').map(badge => badge.getBoundingClientRect().height)
		await expect(heights[2]).toBe(18)
		await expect(heights[0]).toBeLessThan(heights[4])
	},
}
