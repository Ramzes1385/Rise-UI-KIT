import { expect } from 'storybook/test'
import type meta from '../BaseSeparator.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSeparator from '../../ui/BaseSeparator.vue'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const Spacing: StoryObj<typeof meta> = {
	args: { label: 'или' },
	parameters: {
		controls: { include: ['orientation', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Отступы подписи `spacing` (px): вдоль линии — значение × 2, поперёк — значение.',
					'Без пропа — 12px вдоль линии и 0 поперёк: разделитель с подписью не выше строки текста.',
				].join('\n'),
			},
			source: {
				code: [
					'<BaseSeparator label="или" />',
					'<BaseSeparator label="или" :spacing="4" />',
					'<BaseSeparator label="или" :spacing="16" />',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseSeparator },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'spacing']) }),
		template: `
			<div class="story-stack">
				<div class="story-row" style="flex-wrap: nowrap;">
					<span class="story-label">по умолчанию</span>
					<BaseSeparator v-bind="props" />
				</div>
				<div class="story-row" style="flex-wrap: nowrap;">
					<span class="story-label">spacing 4</span>
					<BaseSeparator v-bind="props" :spacing="4" />
				</div>
				<div class="story-row" style="flex-wrap: nowrap;">
					<span class="story-label">spacing 16</span>
					<BaseSeparator v-bind="props" :spacing="16" />
				</div>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const [themed, compact] = canvas.getAllByText('или')
		await expect(getComputedStyle(themed).paddingLeft).toBe('12px')
		await expect(getComputedStyle(compact).paddingLeft).toBe('8px')
	},
}
