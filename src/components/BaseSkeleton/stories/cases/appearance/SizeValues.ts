import { expect } from 'storybook/test'
import type meta from '../../BaseSkeleton.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSkeleton from '../../../ui/BaseSkeleton.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-stack">
		<div class="story-row" style="flex-wrap: nowrap;">
			<span class="story-label">circle, только width</span>
			<BaseSkeleton v-bind="args" shape="circle" :width="48" data-testid="circle" />
		</div>
		<div class="story-row" style="flex-wrap: nowrap;">
			<span class="story-label">width auto</span>
			<div style="width: 240px;"><BaseSkeleton v-bind="args" shape="text" width="auto" data-testid="auto" /></div>
		</div>
	</div>
`

export const SizeValues: StoryObj<typeof meta> = {
	args: { sizeScale: 150 },
	parameters: {
		controls: { include: ['isAnimated', 'isPulse', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Значения размеров. `circle` с одной шириной — круг: высота берётся из ширины (`aspect-ratio: 1`).',
					'Ключевые слова CSS (`auto`, `fit-content`) не масштабируются `sizeScale` и остаются как есть: `auto` — во всю ширину блока. Число 0 — это `0px`.',
					'Отрицательное число и NaN не применяются, в консоли — предупреждение.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseSkeleton'], omit: ['default', 'shape', 'width', 'height'] }),
		},
	},
	render: args => ({
		components: { BaseSkeleton },
		setup: useStorySetup(args, { slots: ['default', 'shape', 'width', 'height'] }),
		template,
	}),
	play: async ({ canvas }) => {
		const circle = canvas.getByTestId('circle')
		await expect(circle.getBoundingClientRect().height).toBe(circle.getBoundingClientRect().width)
		await expect(circle.style.width).toBe('72px')
		const auto = canvas.getByTestId('auto')
		await expect(auto.style.width).toBe('auto')
		await expect(auto.getBoundingClientRect().width).toBe(240)
	},
}
