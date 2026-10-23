import { expect } from 'storybook/test'
import type meta from '../../BaseChip.stories'
import BaseChip from '../../../ui/BaseChip.vue'
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const template = `
	<div class="story-row" style="align-items: flex-end; gap: 32px; padding: 12px;">
		<div v-for="preset in presets" :key="preset.name" class="story-col" style="align-items: center;">
			<BaseChip v-bind="args" :size-scale="preset.sizeScale" :content="3">
				<BaseButton variant="outline" aria-label="Уведомления" :size-scale="preset.sizeScale" :padding="{ x: 5, y: 5 }">
					<BaseIcon name="inbox" />
				</BaseButton>
			</BaseChip>
			<span class="story-label" style="min-width: 0;">{{ preset.label }}</span>
		</div>
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'placement'] },
		docs: {
			description: { story: 'Размеры через `sizeScale`: при 100 индикатор высотой 18px. Кнопка здесь того же размера.' },
			source: storySource({
				template,
				imports: ['BaseChip', 'BaseButton', 'BaseIcon'],
				script: `const presets = ${literal(presets)}`,
			}),
		},
	},
	render: args => ({
		components: { BaseChip, BaseButton, BaseIcon },
		setup: useStorySetup(args, { data: { presets } }),
		template,
	}),
	play: async ({ canvas }) => {
		const heights = canvas
			.getAllByText('3')
			.map(text => (text.closest('.base-chip__badge') as HTMLElement).getBoundingClientRect().height)
		await expect(heights[2]).toBe(18)
		await expect(heights[0]).toBeLessThan(heights[4])
	},
}
