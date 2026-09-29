import type meta from '../../BaseFileUpload.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { fn, expect, waitFor } from 'storybook/test'
import { tabTo, STORY_WAIT_TIMEOUT } from '@/stories/helpers'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Клавиатура: Tab до зоны (кольцо фокуса), Enter и Space открывают системный выбор файла.' } },
	},
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent }) => {
		const dropzone = canvas.getByRole('button', { name: /Выберите файлы/ })
		const openPicker = fn()
		canvas.getByLabelText('Вложения').addEventListener('click', openPicker)

		await tabTo(dropzone, userEvent)
		await expect(getComputedStyle(dropzone).outlineStyle).toBe('solid')
		await userEvent.keyboard('{Enter}')
		await userEvent.keyboard(' ')
		await waitFor(() => expect(openPicker).toHaveBeenCalledTimes(2), { timeout: STORY_WAIT_TIMEOUT })
	},
}
