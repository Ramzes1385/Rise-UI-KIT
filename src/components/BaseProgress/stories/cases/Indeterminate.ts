import { expect } from 'storybook/test'
import type meta from '../BaseProgress.stories'
import BaseProgress from '../../ui/BaseProgress.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const Indeterminate: StoryObj<typeof meta> = {
	args: { isIndeterminate: true, hasLabel: true },
	parameters: {
		docs: {
			description: {
				story: [
					'Неопределённый режим: значение неизвестно — по полосе бежит отрезок, по кольцу — дуга. `aria-valuenow` и подпись',
					'с процентом не выводятся. При настройке «уменьшить движение» — статичная бледная заливка.',
				].join('\n'),
			},
		},
		controls: { include: ['sizeScale', 'color', 'hasLabel'] },
	},
	render: args => ({
		components: { BaseProgress },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'shape']) }),
		template: `
			<div class="story-stack">
				<BaseProgress v-bind="props" aria-label="Подготовка архива" />
				<BaseProgress v-bind="props" shape="circle" aria-label="Синхронизация" />
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		for (const progressbar of canvas.getAllByRole('progressbar')) {
			await expect(progressbar).not.toHaveAttribute('aria-valuenow')
			await expect(progressbar).not.toHaveTextContent('%')
		}
	},
}
