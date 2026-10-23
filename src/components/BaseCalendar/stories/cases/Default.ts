import { getDay } from '../shared'
import { storyDate } from '@/stories/helpers'
import type meta from '../BaseCalendar.stories'
import { waitFor, expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Песочница: выберите день или меняйте props в Controls — значение синхронизировано с args (v-model).' },
		},
	},
	args: { modelValue: storyDate(0, 0, 0) },
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(getDay(canvas, 5))
		await waitFor(() => expect(getDay(canvas, 5)).toHaveAttribute('aria-pressed', 'true'))
		await expect(getDay(canvas, 0)).toHaveAttribute('aria-pressed', 'false')
	},
}
