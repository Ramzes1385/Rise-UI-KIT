import { BaseText } from '@components/BaseText'
import { SHOWCASE_OWN_ARGS } from '../../shared'
import type meta from '../../BasePopover.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BasePopover from '../../../ui/BasePopover.vue'
import { screen, waitFor, expect } from 'storybook/test'
import { literal, storySource, useStorySetup, docsFrame } from '@/stories/helpers'

const cells = [
	{ position: 'top', text: 'Сверху', padding: '64px 0 0 64px' },
	{ position: 'bottom', text: 'Снизу', padding: '0 0 64px 64px' },
	{ position: 'left', text: 'Слева', padding: '16px 0 16px 180px' },
	{ position: 'right', text: 'Справа', padding: '16px 0 16px 16px' },
] as const

const OWN_ARGS = [...SHOWCASE_OWN_ARGS, 'position']

const template = `
	<div class="story-grid" style="--story-grid-min: 320px;">
		<div v-for="cell in cells" :key="cell.position" :style="{ padding: cell.padding }">
			<BasePopover v-bind="args" :is-open="true" :position="cell.position">
				<template #trigger>
					<BaseButton variant="outline">{{ cell.position }}</BaseButton>
				</template>
				<BaseText>{{ cell.text }}</BaseText>
			</BasePopover>
		</div>
	</div>
`

export const Positions: StoryObj<typeof meta> = {
	parameters: {
		layout: 'padded',
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: { story: 'Сторона `position`: поповер и стрелка центрируются по триггеру.' },
			...docsFrame(300),
			source: storySource({
				template,
				imports: ['BasePopover', 'BaseButton', 'BaseText'],
				script: `const cells = ${literal(cells)} as const`,
				omit: OWN_ARGS,
			}),
		},
	},
	render: args => ({
		components: { BasePopover, BaseButton, BaseText },
		setup: useStorySetup(args, { data: { cells }, slots: OWN_ARGS }),
		template,
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
