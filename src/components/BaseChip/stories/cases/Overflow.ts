import { expect } from 'storybook/test'
import type meta from '../BaseChip.stories'
import BaseChip from '../../ui/BaseChip.vue'
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-row" style="gap: 32px; padding: 12px;">
		<BaseChip v-bind="args" :content="8" has-overflow>
			<BaseButton variant="outline" aria-label="Уведомления" :padding="{ x: 5, y: 5 }">
				<BaseIcon name="inbox" />
			</BaseButton>
		</BaseChip>
		<BaseChip v-bind="args" :content="120" has-overflow>
			<BaseButton variant="outline" aria-label="Уведомления" :padding="{ x: 5, y: 5 }">
				<BaseIcon name="inbox" />
			</BaseButton>
		</BaseChip>
		<BaseChip v-bind="args" :content="12" has-overflow :max-value="9">
			<BaseButton variant="outline" aria-label="Уведомления" :padding="{ x: 5, y: 5 }">
				<BaseIcon name="inbox" />
			</BaseButton>
		</BaseChip>
	</div>
`

export const Overflow: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: 'Переполнение: с `hasOverflow` число больше `maxValue` показывается как «99+» (или «9+» при `maxValue` = 9).',
			},
			source: storySource({
				template,
				imports: ['BaseChip', 'BaseButton', 'BaseIcon'],
				omit: ['default', 'content', 'hasOverflow', 'maxValue'],
			}),
		},
	},
	render: args => ({
		components: { BaseChip, BaseButton, BaseIcon },
		setup: useStorySetup(args, { slots: ['default', 'content', 'hasOverflow', 'maxValue'] }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByText('8')).toBeVisible()
		await expect(canvas.getByText('99+')).toBeVisible()
		await expect(canvas.getByText('9+')).toBeVisible()
	},
}
