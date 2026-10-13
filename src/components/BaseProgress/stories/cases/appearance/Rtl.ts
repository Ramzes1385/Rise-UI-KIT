import { expect } from 'storybook/test'
import type meta from '../../BaseProgress.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseProgress from '../../../ui/BaseProgress.vue'
import { PROGRESS_FILLS } from '../../../types/BaseProgress.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const fills = PROGRESS_FILLS

const template = `
	<div dir="rtl" class="story-stack">
		<div v-for="fill in fills" :key="fill" class="story-row" style="flex-wrap: nowrap;">
			<span class="story-label">{{ fill }}</span>
			<BaseProgress v-bind="args" :fill="fill" :aria-label="fill" />
		</div>
	</div>
`

export const Rtl: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['value', 'animation', 'sizeScale', 'color'] },
		docs: {
			description: {
				story: [
					'Справа налево (`dir="rtl"`) заливка растёт от правого края, а переливы `gradient` и `rainbow` зеркалятся вместе с ней:',
					'начало шкалы остаётся началом градиента.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseProgress'],
				script: `const fills = ${literal(fills)}`,
				omit: ['default', 'fill', 'shape', 'hasLabel'],
			}),
		},
	},
	args: { value: 60 },
	render: args => ({
		components: { BaseProgress },
		setup: useStorySetup(args, { data: { fills }, slots: ['default', 'fill', 'shape', 'hasLabel'] }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const fill = canvasElement.querySelector<HTMLElement>('.base-progress--fill-gradient .base-progress__fill')!
		await expect(getComputedStyle(fill).direction).toBe('rtl')
		await expect(getComputedStyle(fill).backgroundImage).toContain('270deg')
	},
}
