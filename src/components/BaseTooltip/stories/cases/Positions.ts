import { docsFrame } from '../shared'
import type meta from '../BaseTooltip.stories'
import BaseTooltip from '../../ui/BaseTooltip.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { screen, waitFor, expect } from 'storybook/test'

export const Positions: StoryObj<typeof meta> = {
	args: { isAlwaysVisible: true },
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: { story: 'Сторона `position`: подсказка и стрелка центрируются по элементу.' },
			...docsFrame(160),
			source: { code: '<BaseTooltip text="Справа" position="right">…</BaseTooltip>' },
		},
	},
	render: args => ({
		components: { BaseTooltip, BaseButton },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['position', 'text']),
			items: [
				{ position: 'left', text: 'Слева' },
				{ position: 'top', text: 'Сверху' },
				{ position: 'bottom', text: 'Снизу' },
				{ position: 'right', text: 'Справа' },
			] as const,
		}),
		template: `
			<div class="story-row" style="gap: 96px;">
				<BaseTooltip v-for="item in items" :key="item.position" v-bind="props" :position="item.position" :text="item.text">
					<BaseButton variant="outline">{{ item.position }}</BaseButton>
				</BaseTooltip>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const button = canvas.getByRole('button', { name: 'right' })
		const tooltip = (await screen.findByText('Справа')).closest('[role="tooltip"]') as HTMLElement
		await waitFor(() => expect(tooltip.getBoundingClientRect().left).toBeGreaterThan(button.getBoundingClientRect().right))
	},
}
