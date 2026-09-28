import { LONG_TEXT } from '../shared'
import { expect } from 'storybook/test'
import type meta from '../BaseText.stories'
import BaseText from '../../ui/BaseText.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const LongContent: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Длинный текст переносится по словам и не выходит за ширину контейнера (здесь — 360px).' } },
	},
	args: { default: LONG_TEXT },
	render: args => ({
		components: { BaseText },
		setup: () => ({ props: useArgsWithoutSlots(args), text: args.default }),
		template: '<div class="story-narrow"><BaseText v-bind="props">{{ text }}</BaseText></div>',
	}),
	play: async ({ canvas }) => {
		const text = canvas.getByText(/Ребрендинг/)
		await expect(text.getBoundingClientRect().width).toBeLessThanOrEqual(360)
		await expect(text.scrollWidth).toBeLessThanOrEqual(text.clientWidth)
		await expect(text.getBoundingClientRect().height).toBeGreaterThan(20)
	},
}
