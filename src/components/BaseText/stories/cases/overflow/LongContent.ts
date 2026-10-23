import { expect } from 'storybook/test'
import { LONG_TEXT } from '../../shared'
import type meta from '../../BaseText.stories'
import BaseText from '../../../ui/BaseText.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-narrow"><BaseText v-bind="args">{{ slots.default }}</BaseText></div>
`

export const LongContent: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Длинный текст переносится по словам и не выходит за ширину контейнера (здесь — 360px).' },
			source: storySource({ template, imports: ['BaseText'] }),
		},
	},
	args: { default: LONG_TEXT },
	render: args => ({
		components: { BaseText },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas }) => {
		const text = canvas.getByText(/Ребрендинг/)
		await expect(text.getBoundingClientRect().width).toBeLessThanOrEqual(360)
		await expect(text.scrollWidth).toBeLessThanOrEqual(text.clientWidth)
		await expect(text.getBoundingClientRect().height).toBeGreaterThan(20)
	},
}
