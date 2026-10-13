import { expect } from 'storybook/test'
import type meta from '../../BaseStack.stories'
import BaseStack from '../../../ui/BaseStack.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { STACK_ALIGNS } from '../../../types/BaseStack.types'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-stack">
		<div v-for="align in STACK_ALIGNS" :key="align">
			<span class="story-label">{{ align }}</span>
			<BaseStack v-bind="args" direction="row" :align="align" style="height: 96px; border: 1px dashed var(--rise-border-accented); border-radius: 8px">
				<div style="padding: 8px 16px; border: 1px solid var(--rise-border); border-radius: 8px; background: var(--rise-bg-elevated)">Короткий</div>
				<div style="padding: 24px 16px; border: 1px solid var(--rise-border); border-radius: 8px; background: var(--rise-bg-elevated)">Высокий</div>
			</BaseStack>
		</div>
	</div>
`

export const Align: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['gap', 'sizeScale'] },
		docs: {
			description: {
				story: 'Выравнивание по поперечной оси `align`: `start`, `center`, `end`, `stretch` (по умолчанию: блоки растягиваются на высоту ряда) и `baseline` (по базовой линии текста).',
			},
			source: storySource({ template, imports: ['BaseStack', 'STACK_ALIGNS'], omit: ['direction', 'align'] }),
		},
	},
	render: args => ({
		components: { BaseStack },
		setup: useStorySetup(args, { data: { STACK_ALIGNS } }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const stacks = [...canvasElement.querySelectorAll<HTMLElement>('.base-stack')]
		await expect(stacks.map(stack => getComputedStyle(stack).alignItems)).toEqual([
			'flex-start',
			'center',
			'flex-end',
			'stretch',
			'baseline',
		])
		const shortBox = (stack: HTMLElement) => stack.children[0].getBoundingClientRect()
		await expect(shortBox(stacks[0]).top).toBeLessThan(shortBox(stacks[2]).top)
		await expect(shortBox(stacks[3]).height).toBeGreaterThan(shortBox(stacks[0]).height)
	},
}
