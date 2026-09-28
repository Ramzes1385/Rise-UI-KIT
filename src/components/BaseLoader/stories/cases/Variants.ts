import { expect } from 'storybook/test'
import { LOADER_VARIANTS } from '../shared'
import type meta from '../BaseLoader.stories'
import BaseLoader from '../../ui/BaseLoader.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale', 'hasLabel', 'label', 'color'] },
		docs: {
			description: { story: 'Четыре вида индикатора. Остальные props из Controls (размер, подпись, цвет) применяются ко всем.' },
			source: { code: LOADER_VARIANTS.map(variant => `<BaseLoader variant="${variant}" />`).join('\n') },
		},
	},
	render: args => ({
		components: { BaseLoader },
		setup: () => ({ props: useArgsWithoutSlots(args), variants: LOADER_VARIANTS }),
		template: `
			<div class="story-row" style="align-items: flex-start; gap: 24px;">
				<div v-for="variant in variants" :key="variant" class="story-col" style="align-items: center; text-align: center;">
					<BaseLoader v-bind="props" :variant="variant" />
					<span class="story-label">{{ variant }}</span>
				</div>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getAllByRole('status', { name: 'Загрузка' })).toHaveLength(LOADER_VARIANTS.length)
	},
}
