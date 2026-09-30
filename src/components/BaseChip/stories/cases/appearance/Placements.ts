import { expect } from 'storybook/test'
import { PLACEMENTS } from '../../shared'
import type meta from '../../BaseChip.stories'
import BaseChip from '../../../ui/BaseChip.vue'
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const placements = PLACEMENTS

const template = `
	<div class="story-row" style="gap: 40px; padding: 12px;">
		<div v-for="placement in placements" :key="placement" class="story-col" style="align-items: center; gap: 16px;">
			<BaseChip v-bind="args" :placement="placement" :content="7">
				<BaseButton variant="outline" aria-label="Уведомления" :padding="{ x: 5, y: 5 }">
					<BaseIcon name="inbox" />
				</BaseButton>
			</BaseChip>
			<span class="story-label" style="min-width: 0;">{{ placement }}</span>
		</div>
	</div>
`

export const Placements: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: { story: 'Расположение `placement`: центр индикатора стоит на выбранном углу элемента.' },
			source: storySource({
				template,
				imports: ['BaseChip', 'BaseButton', 'BaseIcon'],
				script: `const placements = ${literal(placements)}`,
			}),
		},
	},
	render: args => ({
		components: { BaseChip, BaseButton, BaseIcon },
		setup: useStorySetup(args, { data: { placements } }),
		template,
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
