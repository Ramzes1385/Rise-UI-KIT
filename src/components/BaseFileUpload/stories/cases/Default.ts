import { expect } from 'storybook/test'
import { documentFile } from '../shared'
import type meta from '../BaseFileUpload.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Песочница: выберите файл кликом по зоне или перетащите его. Выбранный файл появляется в списке, `change` отдаёт его.',
			},
		},
	},
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.upload(canvas.getByLabelText('Вложения'), documentFile('Отчёт за май.pdf', 248))
		await expect(await canvas.findByText('Отчёт за май.pdf')).toBeVisible()
		await expect(canvas.getByText('248,0 КБ')).toBeVisible()
		await expect(args.onChange).toHaveBeenCalledOnce()
	},
}
