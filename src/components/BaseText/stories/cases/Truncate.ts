import { LONG_TEXT } from '../shared'
import { expect } from 'storybook/test'
import type meta from '../BaseText.stories'
import BaseText from '../../ui/BaseText.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const Truncate: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: '`truncate`: текст в одну строку с многоточием, полный текст остаётся в DOM и доступен скринридеру.' },
		},
	},
	args: { default: LONG_TEXT, truncate: true },
	render: args => ({
		components: { BaseText },
		setup: () => ({ props: useArgsWithoutSlots(args), text: args.default }),
		template: '<div class="story-narrow"><BaseText v-bind="props">{{ text }}</BaseText></div>',
	}),
	play: async ({ canvas }) => {
		const text = canvas.getByText(/Ребрендинг/)
		await expect(getComputedStyle(text).textOverflow).toBe('ellipsis')
		await expect(text.scrollWidth).toBeGreaterThan(text.clientWidth)
		await expect(text.getBoundingClientRect().height).toBe(20)
	},
}
