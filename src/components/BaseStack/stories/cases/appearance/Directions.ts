import { expect } from 'storybook/test'
import type meta from '../../BaseStack.stories'
import BaseStack from '../../../ui/BaseStack.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { STACK_DIRECTIONS } from '../../../types/BaseStack.types'
import { inlineStart, storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-stack">
		<div v-for="direction in STACK_DIRECTIONS" :key="direction">
			<span class="story-label">{{ direction }}</span>
			<BaseStack v-bind="args" :direction="direction" gap="sm">
				<div v-for="n in 3" :key="n" style="padding: 8px 16px; border: 1px solid var(--rise-border); border-radius: 8px; background: var(--rise-bg-elevated)">{{ n }}</div>
			</BaseStack>
		</div>
	</div>
`

export const Directions: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale'] },
		docs: {
			description: {
				story: 'Четыре направления: `column` и `row` — в исходном порядке, `column-reverse` и `row-reverse` — в обратном (порядок для Tab и скринридера остаётся исходным).',
			},
			source: storySource({ template, imports: ['BaseStack', 'STACK_DIRECTIONS'], omit: ['direction', 'gap'] }),
		},
	},
	render: args => ({
		components: { BaseStack },
		setup: useStorySetup(args, { data: { STACK_DIRECTIONS } }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const stacks = [...canvasElement.querySelectorAll<HTMLElement>('.base-stack')]
		await expect(stacks.map(stack => getComputedStyle(stack).flexDirection)).toEqual([...STACK_DIRECTIONS])
		const row = [...stacks[1].children].map(child => child.getBoundingClientRect())
		await expect(inlineStart(row[1])).toBeGreaterThan(inlineStart(row[0]))
		const reversed = [...stacks[3].children].map(child => child.getBoundingClientRect())
		await expect(inlineStart(reversed[1])).toBeLessThan(inlineStart(reversed[0]))
	},
}
