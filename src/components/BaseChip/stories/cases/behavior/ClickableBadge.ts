import { expect } from 'storybook/test'
import type meta from '../../BaseChip.stories'
import BaseChip from '../../../ui/BaseChip.vue'
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const state = { clicks: 0 }

const template = `
	<div class="story-row" style="gap: 32px; padding: 12px;">
		<BaseChip v-bind="args" @click-badge="clicks++">
			<BaseButton variant="outline" aria-label="Уведомления" :padding="{ x: 5, y: 5 }">
				<BaseIcon name="inbox" />
			</BaseButton>
		</BaseChip>
		<span class="story-label" role="status">Нажатий на индикатор: {{ clicks }}</span>
	</div>
`

export const ClickableBadge: StoryObj<typeof meta> = {
	args: { content: 12 },
	parameters: {
		controls: { include: ['content', 'variant', 'placement', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Кликабельный индикатор: с обработчиком `@click-badge` индикатор — отдельная кнопка после элемента в порядке Tab.',
					'Enter и Space вызывают `click-badge`; имя кнопки — «Индикатор: 12» из словаря (`UI_ARIA.CHIP_BADGE`).',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseChip', 'BaseButton', 'BaseIcon'], state }),
		},
	},
	render: args => ({
		components: { BaseChip, BaseButton, BaseIcon },
		setup: useStorySetup(args, { state }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const badge = canvas.getByRole('button', { name: 'Индикатор: 12' })
		await tabTo(badge, userEvent)
		await expect(getComputedStyle(badge).outlineStyle).toBe('solid')
		await userEvent.keyboard('{Enter}')
		await userEvent.keyboard(' ')
		await expect(canvas.getByRole('status')).toHaveTextContent('Нажатий на индикатор: 2')
	},
}
