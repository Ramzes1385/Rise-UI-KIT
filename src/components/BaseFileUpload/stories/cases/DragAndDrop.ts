import type meta from '../BaseFileUpload.stories'
import { dropData, documentFile } from '../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import { fireEvent, waitFor, expect } from 'storybook/test'

export const DragAndDrop: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Перетаскивание: над зоной файл подсвечивает её (фон и рамка основного цвета), после отпускания файл попадает в список.',
			},
		},
	},
	play: async ({ canvas, args }) => {
		const dropzone = canvas.getByRole('button', { name: /Выберите файлы/ })
		const idleBorder = getComputedStyle(dropzone).borderTopColor
		const dataTransfer = dropData([documentFile('Акт сверки.pdf', 64)])

		await fireEvent.dragOver(dropzone, { dataTransfer })
		await waitFor(() => expect(getComputedStyle(dropzone).borderTopColor).not.toBe(idleBorder))
		await fireEvent.dragLeave(dropzone, { dataTransfer })
		await waitFor(() => expect(getComputedStyle(dropzone).borderTopColor).toBe(idleBorder))

		await fireEvent.drop(dropzone, { dataTransfer })
		await expect(await canvas.findByText('Акт сверки.pdf')).toBeVisible()
		await expect(args.onChange).toHaveBeenCalledOnce()
	},
}
