import { expect } from 'storybook/test'
import type meta from '../../BaseChip.stories'
import BaseChip from '../../../ui/BaseChip.vue'
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { PLACEMENTS, ICON_BUTTON } from '../../shared'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const Placements: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: { story: 'Расположение `placement`: центр индикатора стоит на выбранном углу элемента.' },
			source: { code: PLACEMENTS.map(placement => `<BaseChip placement="${placement}" :content="7">…</BaseChip>`).join('\n') },
		},
	},
	render: args => ({
		components: { BaseChip, BaseButton, BaseIcon },
		setup: () => ({ props: useArgsWithoutSlots(args), placements: PLACEMENTS }),
		template: `
			<div class="story-row" style="gap: 40px; padding: 12px;">
				<div v-for="placement in placements" :key="placement" class="story-col" style="align-items: center; gap: 16px;">
					<BaseChip v-bind="props" :placement="placement" :content="7">${ICON_BUTTON}</BaseChip>
					<span class="story-label" style="min-width: 0;">{{ placement }}</span>
				</div>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const [topRight, , , bottomLeft] = canvas.getAllByText('7')
		const [button] = canvas.getAllByRole('button')
		const buttonRect = button.getBoundingClientRect()
		const badgeRect = topRight.getBoundingClientRect()
		await expect(badgeRect.top + badgeRect.height / 2).toBeCloseTo(buttonRect.top, 0)
		await expect(badgeRect.left + badgeRect.width / 2).toBeCloseTo(buttonRect.right, 0)
		await expect(bottomLeft).toHaveClass('base-chip__badge--bottom-left')
	},
}
