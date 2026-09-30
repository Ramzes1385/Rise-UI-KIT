import { expect } from 'storybook/test'
import type meta from '../../BaseSeparator.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSeparator from '../../../ui/BaseSeparator.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-stack">
		<div class="story-row" style="flex-wrap: nowrap;">
			<span>Черновик</span>
			<BaseSeparator v-bind="args" />
			<span>Изменён 15 мая</span>
			<BaseSeparator v-bind="args" />
			<span>3 комментария</span>
		</div>
		<div class="story-row" style="flex-wrap: nowrap; height: 96px;">
			<span>Тариф «Старт»</span>
			<BaseSeparator v-bind="args" label="или" />
			<span>Тариф «Команда»</span>
		</div>
	</div>
`

export const Vertical: StoryObj<typeof meta> = {
	args: { orientation: 'vertical' },
	parameters: {
		controls: { include: ['isDashed', 'thickness', 'color', 'sizeScale'] },
		docs: {
			description: {
				story: 'Вертикальный разделитель занимает высоту ряда: пункты тулбара, метаданные в строке. С подписью — выбор между вариантами.',
			},
			source: storySource({ template, imports: ['BaseSeparator'], omit: ['default', 'label'] }),
		},
	},
	render: args => ({
		components: { BaseSeparator },
		setup: useStorySetup(args, { slots: ['default', 'label'] }),
		template,
	}),
	play: async ({ canvas }) => {
		for (const separator of canvas.getAllByRole('separator')) {
			await expect(separator).toHaveAttribute('aria-orientation', 'vertical')
		}
		await expect(canvas.getByRole('separator', { name: 'или' })).toBeVisible()
	},
}
