import { fn, expect } from 'storybook/test'
import { storyDate } from '@/stories/helpers'
import type meta from '../BaseCalendar.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { renderWithLocalModel, getDay } from '../shared'

export const RangeSelection: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Диапазон (`selectionMode="range"`): первый клик — начало, второй — конец и событие `range-select`. Дни внутри —',
					'полоса мягкого основного цвета, концы — заливка. Клик раньше начала меняет концы местами.',
				].join('\n'),
			},
		},
	},
	args: {
		selectionMode: 'range',
		modelValue: storyDate(-3, 0, 0),
		modelValueEnd: storyDate(3, 0, 0),
		'onUpdate:modelValueEnd': fn(),
		'onRange-select': fn(),
	},
	render: renderWithLocalModel(),
	play: async ({ canvas, userEvent, args }) => {
		await expect(getDay(canvas, 0)).toHaveAttribute('aria-pressed', 'true')
		await userEvent.click(getDay(canvas, 8))
		await userEvent.click(getDay(canvas, 4))
		await expect(args['onRange-select']).toHaveBeenLastCalledWith(storyDate(4, 0, 0), storyDate(8, 0, 0))
		await expect(getDay(canvas, 6)).toHaveAttribute('aria-pressed', 'true')
		await expect(getDay(canvas, 0)).toHaveAttribute('aria-pressed', 'false')
	},
}
