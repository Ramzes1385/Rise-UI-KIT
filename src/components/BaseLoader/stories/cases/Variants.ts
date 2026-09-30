import { expect } from 'storybook/test'
import { LOADER_VARIANTS } from '../shared'
import type meta from '../BaseLoader.stories'
import BaseLoader from '../../ui/BaseLoader.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const variants = LOADER_VARIANTS

const template = `
	<div class="story-row" style="align-items: flex-start; gap: 24px;">
		<div v-for="variant in variants" :key="variant" class="story-col" style="align-items: center; text-align: center;">
			<BaseLoader v-bind="args" :variant="variant" />
			<span class="story-label">{{ variant }}</span>
		</div>
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale', 'hasLabel', 'label', 'color'] },
		docs: {
			description: { story: 'Четыре вида индикатора. Остальные props из Controls (размер, подпись, цвет) применяются ко всем.' },
			source: storySource({ template, imports: ['BaseLoader'], script: `const variants = ${literal(variants)}` }),
		},
	},
	render: args => ({
		components: { BaseLoader },
		setup: useStorySetup(args, { data: { variants } }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getAllByRole('status', { name: 'Загрузка' })).toHaveLength(LOADER_VARIANTS.length)
	},
}
