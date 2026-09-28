import { expect } from 'storybook/test'
import { storyDate } from '@/stories/helpers'
import type meta from '../BaseCalendar.stories'
import { renderWithLocalModel } from '../shared'
import type { StoryObj } from '@storybook/vue3-vite'

export const WithTime: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Блок времени (`timeConfig.showTime`): поля часов, минут и секунд под сеткой. Значение меняется, когда ввод завершён',
					'(уход из поля); часы ограничены 0–23, минуты и секунды — 0–59.',
				].join('\n'),
			},
		},
	},
	args: {
		modelValue: storyDate(0, 14, 30),
		timeConfig: { showTime: true, showSeconds: true },
	},
	render: renderWithLocalModel(),
	play: async ({ canvas, userEvent, args }) => {
		const minutes = canvas.getByLabelText('Минуты')
		await userEvent.clear(minutes)
		await userEvent.type(minutes, '45')
		await userEvent.tab()
		await expect(args['onUpdate:modelValue']).toHaveBeenLastCalledWith(storyDate(0, 14, 45))
	},
}
