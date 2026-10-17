import { expect } from 'storybook/test'
import type meta from '../../BaseStack.stories'
import BaseStack from '../../../ui/BaseStack.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { STACK_JUSTIFIES } from '../../../types/BaseStack.types'
import { inlineEnd, storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-stack">
		<div v-for="justify in STACK_JUSTIFIES" :key="justify">
			<span class="story-label">{{ justify }}</span>
			<BaseStack v-bind="args" direction="row" :justify="justify" style="border: 1px dashed var(--rise-border-accented); border-radius: 8px">
				<div v-for="n in 3" :key="n" style="padding: 8px 16px; border: 1px solid var(--rise-border); border-radius: 8px; background: var(--rise-bg-elevated)">{{ n }}</div>
			</BaseStack>
		</div>
	</div>
`

export const Justify: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['gap', 'sizeScale'] },
		docs: {
			description: {
				story: 'Распределение по главной оси `justify`: `start`, `center`, `end`, `between` (крайние блоки у краёв), `around` и `evenly` (равные поля).',
			},
			source: storySource({ template, imports: ['BaseStack', 'STACK_JUSTIFIES'], omit: ['direction', 'justify'] }),
		},
	},
	render: args => ({
		components: { BaseStack },
		setup: useStorySetup(args, { data: { STACK_JUSTIFIES } }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const stacks = [...canvasElement.querySelectorAll<HTMLElement>('.base-stack')]
		await expect(stacks.map(stack => getComputedStyle(stack).justifyContent)).toEqual([
			'flex-start',
			'center',
			'flex-end',
			'space-between',
			'space-around',
			'space-evenly',
		])
		const gapToEdge = (stack: HTMLElement) =>
			inlineEnd(stack.getBoundingClientRect()) - inlineEnd(stack.lastElementChild!.getBoundingClientRect())
		await expect(Math.round(gapToEdge(stacks[3]))).toBeLessThanOrEqual(1)
		await expect(Math.round(gapToEdge(stacks[2]))).toBeLessThanOrEqual(1)
		await expect(gapToEdge(stacks[0])).toBeGreaterThan(50)
	},
}
