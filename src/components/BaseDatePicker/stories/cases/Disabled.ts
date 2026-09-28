import { storyDate } from '@/stories/helpers'
import { expect, screen } from 'storybook/test'
import type meta from '../BaseDatePicker.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Disabled: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Отключённое поле: приглушено, не получает фокус и не открывает панель.' } } },
	args: { modelValue: storyDate(0, 0, 0), isDisabled: true },
	play: async ({ canvas }) => {
		await expect(canvas.getByLabelText('Дата встречи')).toBeDisabled()
		await expect(canvas.getByRole('button', { name: 'Открыть календарь' })).toBeDisabled()
		await expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
	},
}
