import { expect } from 'storybook/test'
import { LONG_TEXT } from '../../shared'
import type meta from '../../BaseText.stories'
import BaseText from '../../../ui/BaseText.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-narrow"><BaseText v-bind="args">{{ slots.default }}</BaseText></div>
`

export const MaxLines: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: '`truncate` + `maxLines`: не больше указанного числа строк (здесь — 2), дальше многоточие.' },
			source: storySource({ template, imports: ['BaseText'] }),
		},
	},
	args: { default: LONG_TEXT, truncate: true, maxLines: 2 },
	render: args => ({
		components: { BaseText },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas }) => {
		const text = canvas.getByText(/Ребрендинг/)
		await expect(text.getBoundingClientRect().height).toBe(40)
		await expect(text.scrollHeight).toBeGreaterThan(text.clientHeight)
	},
}
