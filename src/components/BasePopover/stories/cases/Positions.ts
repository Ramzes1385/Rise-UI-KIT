import type meta from '../BasePopover.stories'
import { BaseText } from '@components/BaseText'
import BasePopover from '../../ui/BasePopover.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { docsFrame, SHOWCASE_OWN_ARGS } from '../shared'
import { screen, waitFor, expect } from 'storybook/test'

export const Positions: StoryObj<typeof meta> = {
	parameters: {
		layout: 'padded',
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: { story: 'Сторона `position`: поповер и стрелка центрируются по триггеру.' },
			...docsFrame(300),
			source: { code: '<BasePopover v-model:is-open="isOpen" position="left">…</BasePopover>' },
		},
	},
	render: args => ({
		components: { BasePopover, BaseButton, BaseText },
		setup: () => ({
			props: useArgsWithoutSlots(args, [...SHOWCASE_OWN_ARGS, 'position']),
			cells: [
				{ position: 'top', text: 'Сверху', padding: '64px 0 0 64px' },
				{ position: 'bottom', text: 'Снизу', padding: '0 0 64px 64px' },
				{ position: 'left', text: 'Слева', padding: '16px 0 16px 180px' },
				{ position: 'right', text: 'Справа', padding: '16px 0 16px 16px' },
			] as const,
		}),
		template: `
			<div class="story-grid" style="--story-grid-min: 320px;">
				<div v-for="cell in cells" :key="cell.position" :style="{ padding: cell.padding }">
					<BasePopover v-bind="props" :is-open="true" :position="cell.position">
						<template #trigger>
							<BaseButton variant="outline">{{ cell.position }}</BaseButton>
						</template>
						<BaseText>{{ cell.text }}</BaseText>
					</BasePopover>
				</div>
			</div>
		`,
	}),
	play: async () => {
		const button = screen.getByRole('button', { name: 'top' })
		const arrow = (await screen.findByText('Сверху'))
			.closest('.base-dropdown__panel')
			?.querySelector('.base-popover__arrow') as HTMLElement
		await waitFor(() => {
			const buttonBox = button.getBoundingClientRect()
			const arrowBox = arrow.getBoundingClientRect()
			expect(Math.abs(arrowBox.left + arrowBox.width / 2 - (buttonBox.left + buttonBox.width / 2))).toBeLessThan(1)
		})
	},
}
