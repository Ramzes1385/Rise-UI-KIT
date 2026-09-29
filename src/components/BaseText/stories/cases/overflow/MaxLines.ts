import { expect } from 'storybook/test'
import { LONG_TEXT } from '../../shared'
import type meta from '../../BaseText.stories'
import BaseText from '../../../ui/BaseText.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const MaxLines: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: '`truncate` + `maxLines`: не больше указанного числа строк (здесь — 2), дальше многоточие.' } },
	},
	args: { default: LONG_TEXT, truncate: true, maxLines: 2 },
	render: args => ({
		components: { BaseText },
		setup: () => ({ props: useArgsWithoutSlots(args), text: args.default }),
		template: '<div class="story-narrow"><BaseText v-bind="props">{{ text }}</BaseText></div>',
	}),
	play: async ({ canvas }) => {
		const text = canvas.getByText(/Ребрендинг/)
		await expect(text.getBoundingClientRect().height).toBe(40)
		await expect(text.scrollHeight).toBeGreaterThan(text.clientHeight)
	},
}
