import { expect } from 'storybook/test'
import type meta from '../../BaseStack.stories'
import BaseStack from '../../../ui/BaseStack.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-stack">
		<div v-for="isWrap in [true, false]" :key="isWrap">
			<span class="story-label">isWrap: {{ isWrap }}</span>
			<div class="story-narrow" style="overflow: hidden">
				<BaseStack v-bind="args" direction="row" gap="sm" :is-wrap="isWrap">
					<div v-for="n in 6" :key="n" style="flex: none; width: 96px; padding: 8px 16px; border: 1px solid var(--rise-border); border-radius: 8px; background: var(--rise-bg-elevated); box-sizing: border-box">Тег {{ n }}</div>
				</BaseStack>
			</div>
		</div>
	</div>
`

export const Wrap: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['gap', 'sizeScale'] },
		docs: {
			description: {
				story: 'Перенос `isWrap`: в узком блоке (360px) шесть элементов по 96px с включённым переносом уходят на вторую линию, без него — идут в одну линию и выходят за край.',
			},
			source: storySource({ template, imports: ['BaseStack'], omit: ['direction', 'gap', 'isWrap'] }),
		},
	},
	render: args => ({
		components: { BaseStack },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [wrapped, single] = [...canvasElement.querySelectorAll<HTMLElement>('.base-stack')]
		await expect(wrapped).toHaveClass('base-stack--wrap')
		await expect(single).not.toHaveClass('base-stack--wrap')
		const wrappedTops = [...wrapped.children].map(child => child.getBoundingClientRect().top)
		await expect(wrappedTops[wrappedTops.length - 1]).toBeGreaterThan(wrappedTops[0])
		const singleTops = [...single.children].map(child => child.getBoundingClientRect().top)
		await expect(singleTops[singleTops.length - 1]).toBe(singleTops[0])
	},
}
