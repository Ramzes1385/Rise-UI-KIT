import { MESSAGES } from '../../shared'
import { expect } from 'storybook/test'
import type meta from '../../BaseResult.stories'
import BaseResult from '../../../ui/BaseResult.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'
import { RESULT_VARIANTS } from '../../../types/BaseResult.types'

const template = `
	<div class="story-grid" style="--story-grid-min: 280px;">
		<BaseResult v-for="variant in RESULT_VARIANTS" :key="variant" v-bind="args" :variant="variant" :title="variant" />
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	args: { description: MESSAGES.success.description },
	parameters: {
		controls: { include: ['status', 'sizeScale'] },
		docs: {
			description: {
				story: 'Три варианта для одного статуса (статус меняется в Controls): без рамки и фона, мягкий фон карточки, рамка.',
			},
			source: storySource({ template, imports: ['BaseResult', 'RESULT_VARIANTS'] }),
		},
	},
	render: args => ({
		components: { BaseResult },
		setup: useStorySetup(args, { data: { RESULT_VARIANTS } }),
		template,
	}),
	play: async ({ canvas, canvasElement }) => {
		await expect(canvas.getAllByRole('heading', { level: 2 })).toHaveLength(RESULT_VARIANTS.length)
		const [plain, outline, soft] = Array.from(canvasElement.querySelectorAll<HTMLElement>('.base-result'))
		await expect(getComputedStyle(outline).borderTopColor).not.toBe(getComputedStyle(plain).borderTopColor)
		await expect(getComputedStyle(soft).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
	},
}
