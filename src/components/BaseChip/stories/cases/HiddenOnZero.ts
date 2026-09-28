import { ICON_BUTTON } from '../shared'
import { expect } from 'storybook/test'
import type meta from '../BaseChip.stories'
import BaseChip from '../../ui/BaseChip.vue'
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const HiddenOnZero: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: 'Ноль: по умолчанию «0» виден, с `isHiddenOnZero` индикатор скрыт (слева — без флага, справа — с флагом).',
			},
			source: {
				code: ['<BaseChip :content="0">…</BaseChip>', '<BaseChip :content="0" is-hidden-on-zero>…</BaseChip>'].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseChip, BaseButton, BaseIcon },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'content', 'isHiddenOnZero']) }),
		template: `
			<div class="story-row" style="gap: 32px; padding: 12px;">
				<BaseChip v-bind="props" :content="0">${ICON_BUTTON}</BaseChip>
				<BaseChip v-bind="props" :content="0" is-hidden-on-zero>${ICON_BUTTON}</BaseChip>
			</div>
		`,
	}),
	play: async ({ canvas, canvasElement }) => {
		await expect(canvas.getByText('0')).toBeVisible()
		await expect(canvasElement.querySelectorAll('.base-chip__badge')).toHaveLength(1)
	},
}
