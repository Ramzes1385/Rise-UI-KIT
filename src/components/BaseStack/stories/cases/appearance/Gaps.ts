import { expect } from 'storybook/test'
import type meta from '../../BaseStack.stories'
import BaseStack from '../../../ui/BaseStack.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { STACK_GAPS } from '../../../types/BaseStack.types'
import { isStoryBranded, storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-stack">
		<div v-for="gap in STACK_GAPS" :key="gap">
			<span class="story-label">{{ gap }}</span>
			<BaseStack v-bind="args" direction="row" :gap="gap">
				<div v-for="n in 3" :key="n" style="padding: 8px 16px; border: 1px solid var(--rise-border); border-radius: 8px; background: var(--rise-bg-elevated)">{{ n }}</div>
			</BaseStack>
		</div>
	</div>
`

const EXPECTED = ['0px', '4px', '8px', '16px', '24px', '32px']

export const Gaps: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale'] },
		docs: {
			description: {
				story: 'Промежутки `gap`: `none` — без промежутка, `xs` 4px, `sm` 8px, `md` 16px, `lg` 24px, `xl` 32px (при `sizeScale` 100).',
			},
			source: storySource({ template, imports: ['BaseStack', 'STACK_GAPS'], omit: ['direction', 'gap'] }),
		},
	},
	render: args => ({
		components: { BaseStack },
		setup: useStorySetup(args, { data: { STACK_GAPS } }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const stacks = [...canvasElement.querySelectorAll<HTMLElement>('.base-stack')]
		await expect(stacks).toHaveLength(STACK_GAPS.length)
		await expect(getComputedStyle(stacks[0]).columnGap).toBe('0px')
		if (!isStoryBranded()) await expect(stacks.map(stack => getComputedStyle(stack).columnGap)).toEqual(EXPECTED)
	},
}
