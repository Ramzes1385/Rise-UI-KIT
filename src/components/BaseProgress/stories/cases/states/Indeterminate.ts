import { expect } from 'storybook/test'
import type meta from '../../BaseProgress.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseProgress from '../../../ui/BaseProgress.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-stack">
		<BaseProgress v-bind="args" aria-label="Подготовка архива" />
		<BaseProgress v-bind="args" shape="circle" aria-label="Синхронизация" />
	</div>
`

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
			source: storySource({ template, imports: ['BaseProgress'], omit: ['default', 'shape'] }),
		},
		controls: { include: ['sizeScale', 'color', 'hasLabel'] },
	},
	render: args => ({
		components: { BaseProgress },
		setup: useStorySetup(args, { slots: ['default', 'shape'] }),
		template,
	}),
	play: async ({ canvas }) => {
		for (const progressbar of canvas.getAllByRole('progressbar')) {
			await expect(progressbar).not.toHaveAttribute('aria-valuenow')
			await expect(progressbar).not.toHaveTextContent('%')
		}
	},
}
