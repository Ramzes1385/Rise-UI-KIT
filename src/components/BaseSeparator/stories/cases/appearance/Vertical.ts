import { expect } from 'storybook/test'
import type meta from '../../BaseSeparator.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseSeparator from '../../../ui/BaseSeparator.vue'

export const Vertical: StoryObj<typeof meta> = {
	args: { orientation: 'vertical' },
	parameters: {
		controls: { include: ['isDashed', 'thickness', 'color', 'sizeScale'] },
		docs: {
			description: {
				story: 'Вертикальный разделитель занимает высоту ряда: пункты тулбара, метаданные в строке. С подписью — выбор между вариантами.',
			},
			source: {
				code: [
					'<div style="display: flex; align-items: center; gap: 12px;">',
					'  <span>Черновик</span>',
					'  <BaseSeparator orientation="vertical" />',
					'  <span>Изменён 15 мая</span>',
					'</div>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseSeparator },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'label']) }),
		template: `
			<div class="story-stack">
				<div class="story-row" style="flex-wrap: nowrap;">
					<span>Черновик</span>
					<BaseSeparator v-bind="props" />
					<span>Изменён 15 мая</span>
					<BaseSeparator v-bind="props" />
					<span>3 комментария</span>
				</div>
				<div class="story-row" style="flex-wrap: nowrap; height: 96px;">
					<span>Тариф «Старт»</span>
					<BaseSeparator v-bind="props" label="или" />
					<span>Тариф «Команда»</span>
				</div>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		for (const separator of canvas.getAllByRole('separator')) {
			await expect(separator).toHaveAttribute('aria-orientation', 'vertical')
		}
		await expect(canvas.getByRole('separator', { name: 'или' })).toBeVisible()
	},
}
