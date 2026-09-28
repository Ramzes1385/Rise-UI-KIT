import { expect } from 'storybook/test'
import type meta from '../BaseIcon.stories'
import BaseIcon from '../../ui/BaseIcon.vue'
import { ICON_SCALE } from '@utils/iconUtils'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['name', 'color'] },
		docs: {
			description: { story: 'Типовые размеры `ICON_SCALE`: xs 12px, sm 16px (иконка в кнопке и поле), md 20px, lg 28px, xl 36px.' },
			source: {
				code: Object.entries(ICON_SCALE)
					.map(([size, scale]) => `<BaseIcon name="search" :size-scale="${scale}" /> <!-- calcIconScale('${size}') -->`)
					.join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseIcon },
		setup: () => ({ props: useArgsWithoutSlots(args), sizes: Object.entries(ICON_SCALE) }),
		template: `
			<div class="story-row" style="align-items: flex-end; gap: 24px;">
				<div v-for="[size, scale] in sizes" :key="size" class="story-col" style="align-items: center; gap: 8px;">
					<BaseIcon v-bind="props" :size-scale="scale" />
					<span class="story-label" style="min-width: 0;">{{ size }} · {{ (20 * scale) / 100 }}px</span>
				</div>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const widths = [...canvasElement.querySelectorAll('svg')].map(svg => Math.round(svg.getBoundingClientRect().width))
		await expect(widths).toEqual([12, 16, 20, 28, 36])
	},
}
