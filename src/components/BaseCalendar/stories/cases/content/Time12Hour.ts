import { expect } from 'storybook/test'
import type meta from '../../BaseCalendar.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseCalendar from '../../../ui/BaseCalendar.vue'
import { storyDate, storySource, useStorySetup } from '@/stories/helpers'

const state = { date: storyDate(0, 14, 30) }

const template = `
	<BaseCalendar v-bind="args" v-model="date" />
`

export const Time12Hour: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'12-часовой формат (`timeConfig.is24Hour: false`): часы 1–12 и переключатель AM/PM. Половина суток следует из',
					'значения (14:30 — это 2:30 PM), переключатель сдвигает время на 12 часов в пределах того же дня.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseCalendar'], state, omit: ['modelValue'] }),
		},
	},
	args: {
		modelValue: storyDate(0, 14, 30),
		timeConfig: { showTime: true, is24Hour: false },
	},
	render: args => ({
		components: { BaseCalendar },
		setup: useStorySetup(args, { state, slots: ['modelValue'] }),
		template,
	}),
	play: async ({ canvas, userEvent, args }) => {
		await expect(canvas.getByLabelText('Часы')).toHaveValue(2)
		const toggle = canvas.getByRole('button', { name: 'PM' })
		await userEvent.click(toggle)
		await expect(toggle).toHaveTextContent('AM')
		await expect(args['onUpdate:modelValue']).toHaveBeenLastCalledWith(storyDate(0, 2, 30))
	},
}
