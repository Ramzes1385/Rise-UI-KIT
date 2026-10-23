import { expect } from 'storybook/test'
import { LONG_TEXT } from '../../shared'
import type meta from '../../BaseText.stories'
import BaseText from '../../../ui/BaseText.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-narrow"><BaseText v-bind="args">{{ slots.default }}</BaseText></div>
`

export const Truncate: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: '`truncate`: текст в одну строку с многоточием, полный текст остаётся в DOM и доступен скринридеру.' },
			source: storySource({ template, imports: ['BaseText'] }),
		},
	},
	args: { default: LONG_TEXT, truncate: true },
	render: args => ({
		components: { BaseText },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas }) => {
		const text = canvas.getByText(/Ребрендинг/)
		await expect(getComputedStyle(text).textOverflow).toBe('ellipsis')
		await expect(text.scrollWidth).toBeGreaterThan(text.clientWidth)
		await expect(text.getBoundingClientRect().height).toBe(20)
	},
}
