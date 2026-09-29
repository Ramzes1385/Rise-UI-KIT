import { expect } from 'storybook/test'
import { LONG_TEXT } from '../../shared'
import type meta from '../../BaseText.stories'
import BaseText from '../../../ui/BaseText.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const Nowrap: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'`nowrap` запрещает перенос: строка остаётся одной, даже если шире контейнера. Многоточия нет —',
					'лишнее обрезает контейнер (здесь `overflow: hidden`). Нужно многоточие — используйте `truncate`.',
				].join('\n'),
			},
		},
	},
	args: { default: LONG_TEXT, nowrap: true },
	render: args => ({
		components: { BaseText },
		setup: () => ({ props: useArgsWithoutSlots(args), text: args.default }),
		template: '<div class="story-narrow" style="overflow: hidden;"><BaseText v-bind="props">{{ text }}</BaseText></div>',
	}),
	play: async ({ canvas }) => {
		const text = canvas.getByText(/Ребрендинг/)
		await expect(text.getBoundingClientRect().height).toBe(20)
		await expect(text.scrollWidth).toBeGreaterThan(text.clientWidth)
	},
}
