import { expect } from 'storybook/test'
import type meta from '../../BaseRange.stories'
import BaseRange from '../../../ui/BaseRange.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const models = { range: 'rangeValue' }

const template = `
	<div class="story-narrow"><BaseRange v-bind="args" v-model:range-value="range" /></div>
`

export const RangeKeyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Клавиатура диапазона: Home и End ведут ползунок к границе, но не дальше соседнего — минимум не обгонит максимум.',
					'PageUp/PageDown — на 10 шагов `step`, тоже до соседа. Tab переходит от минимума к максимуму.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseRange'], models, omit: ['modelValue', 'thumb'] }),
		},
	},
	tags: ['!autodocs'],
	args: { rangeValue: [20, 60], min: 0, max: 100, step: 5, ariaLabel: 'Цена', hasLabel: true },
	render: args => ({
		components: { BaseRange },
		setup: useStorySetup(args, { models, slots: ['modelValue', 'thumb'] }),
		template,
	}),
	play: async ({ canvas, userEvent, args }) => {
		const min = canvas.getByRole('slider', { name: 'Цена: минимум' })
		const max = canvas.getByRole('slider', { name: 'Цена: максимум' })
		await tabTo(min, userEvent)

		await userEvent.keyboard('{End}')
		await expect(min).toHaveAttribute('aria-valuenow', '60')
		await expect(args.onChange).toHaveBeenLastCalledWith([60, 60])

		await userEvent.keyboard('{PageDown}')
		await expect(min).toHaveAttribute('aria-valuenow', '10')

		await userEvent.tab()
		await expect(max).toHaveFocus()
		await userEvent.keyboard('{Home}')
		await expect(max).toHaveAttribute('aria-valuenow', '10')
		await userEvent.keyboard('{End}')
		await expect(max).toHaveAttribute('aria-valuenow', '100')
		await expect(args.onChange).toHaveBeenLastCalledWith([10, 100])
	},
}
