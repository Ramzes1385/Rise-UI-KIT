import { expect } from 'storybook/test'
import type meta from '../BaseSplitter.stories'
import { LETTERS, BOX, PANES } from '../shared'
import BaseSplitter from '../../ui/BaseSplitter.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { SPLITTER_VARIANTS } from '../../types/BaseSplitter.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Варианты: `default` — линия с ручкой, `ghost` — линия появляется при наведении и в фокусе.' } },
		controls: { include: ['sizeScale', 'orientation'] },
	},
	render: args => ({
		components: { BaseSplitter },
		setup: () => ({ props: useArgsWithoutSlots(args, ['variant', 'label']), variants: SPLITTER_VARIANTS, letters: LETTERS, box: BOX }),
		template: `
			<div class="story-stack">
				<div v-for="variant in variants" :key="variant" :style="box">
					<BaseSplitter v-bind="props" :variant="variant" :label="'Список писем, ' + variant">${PANES}</BaseSplitter>
				</div>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getAllByRole('separator')).toHaveLength(2)
	},
}
