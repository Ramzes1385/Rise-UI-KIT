import { expect } from 'storybook/test'
import type meta from '../BaseChip.stories'
import BaseChip from '../../ui/BaseChip.vue'
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-row" style="gap: 32px; padding: 12px;">
		<BaseChip v-bind="args" :content="0">
			<BaseButton variant="outline" aria-label="Уведомления" :padding="{ x: 5, y: 5 }">
				<BaseIcon name="inbox" />
			</BaseButton>
		</BaseChip>
		<BaseChip v-bind="args" :content="0" is-hidden-on-zero>
			<BaseButton variant="outline" aria-label="Уведомления" :padding="{ x: 5, y: 5 }">
				<BaseIcon name="inbox" />
			</BaseButton>
		</BaseChip>
	</div>
`

export const HiddenOnZero: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: 'Ноль: по умолчанию «0» виден, с `isHiddenOnZero` индикатор скрыт (слева — без флага, справа — с флагом).',
			},
			source: storySource({
				template,
				imports: ['BaseChip', 'BaseButton', 'BaseIcon'],
				omit: ['default', 'content', 'isHiddenOnZero'],
			}),
		},
	},
	render: args => ({
		components: { BaseChip, BaseButton, BaseIcon },
		setup: useStorySetup(args, { slots: ['default', 'content', 'isHiddenOnZero'] }),
		template,
	}),
	play: async ({ canvas, canvasElement }) => {
		await expect(canvas.getByText('0')).toBeVisible()
		await expect(canvasElement.querySelectorAll('.base-chip__badge')).toHaveLength(1)
	},
}
