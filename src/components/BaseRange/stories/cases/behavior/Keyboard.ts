import { expect } from 'storybook/test'
import type meta from '../../BaseRange.stories'
import BaseRange from '../../../ui/BaseRange.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const state = { volume: 40 }

const template = `
	<div class="story-narrow"><BaseRange v-bind="args" v-model="volume" /></div>
`

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Клавиатура по APG Slider: Tab ставит фокус на ползунок, стрелки вправо/вверх увеличивают значение на `step`,',
					'влево/вниз — уменьшают, PageUp/PageDown — на 10 шагов, Home — `min`, End — `max` (у диапазона и точек —',
					'до соседнего ползунка). Каждое нажатие — завершённый выбор, поэтому приходит и `change`; упор в границу `change` не даёт.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseRange'], state, omit: ['modelValue', 'thumb', 'onUpdate:modelValue'] }),
		},
	},
	tags: ['!autodocs'],
	render: args => ({
		components: { BaseRange },
		setup: useStorySetup(args, { state, slots: ['modelValue', 'thumb', 'onUpdate:modelValue'] }),
		template,
	}),
	play: async ({ canvas, userEvent, args }) => {
		const thumb = canvas.getByRole('slider', { name: 'Громкость' })
		await tabTo(thumb, userEvent)

		await userEvent.keyboard('{ArrowRight}')
		await expect(thumb).toHaveAttribute('aria-valuenow', '41')
		await expect(args.onChange).toHaveBeenLastCalledWith(41)

		await userEvent.keyboard('{ArrowDown}{ArrowDown}')
		await expect(thumb).toHaveAttribute('aria-valuenow', '39')
		await expect(args.onChange).toHaveBeenLastCalledWith(39)

		await userEvent.keyboard('{PageUp}')
		await expect(thumb).toHaveAttribute('aria-valuenow', '49')
		await userEvent.keyboard('{PageDown}{PageDown}')
		await expect(thumb).toHaveAttribute('aria-valuenow', '29')
		await expect(args.onChange).toHaveBeenLastCalledWith(29)

		await userEvent.keyboard('{End}')
		await expect(thumb).toHaveAttribute('aria-valuenow', '100')
		await userEvent.keyboard('{Home}')
		await expect(thumb).toHaveAttribute('aria-valuenow', '0')
		await expect(args.onChange).toHaveBeenLastCalledWith(0)
	},
}
