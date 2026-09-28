import { ICON_BUTTON } from '../shared'
import { expect } from 'storybook/test'
import type meta from '../BaseChip.stories'
import BaseChip from '../../ui/BaseChip.vue'
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const Overflow: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: 'Переполнение: с `hasOverflow` число больше `maxValue` показывается как «99+» (или «9+» при `maxValue` = 9).',
			},
			source: {
				code: [
					'<BaseChip :content="8" has-overflow>…</BaseChip>',
					'<BaseChip :content="120" has-overflow>…</BaseChip>',
					'<BaseChip :content="12" has-overflow :max-value="9">…</BaseChip>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseChip, BaseButton, BaseIcon },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'content', 'hasOverflow', 'maxValue']) }),
		template: `
			<div class="story-row" style="gap: 32px; padding: 12px;">
				<BaseChip v-bind="props" :content="8" has-overflow>${ICON_BUTTON}</BaseChip>
				<BaseChip v-bind="props" :content="120" has-overflow>${ICON_BUTTON}</BaseChip>
				<BaseChip v-bind="props" :content="12" has-overflow :max-value="9">${ICON_BUTTON}</BaseChip>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByText('8')).toBeVisible()
		await expect(canvas.getByText('99+')).toBeVisible()
		await expect(canvas.getByText('9+')).toBeVisible()
	},
}
