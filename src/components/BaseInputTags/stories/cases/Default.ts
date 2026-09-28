import { expect } from 'storybook/test'
import type meta from '../BaseInputTags.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Песочница: Enter добавляет тег, крестик удаляет.' } } },
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.type(canvas.getByRole('textbox', { name: 'Навыки' }), 'Pinia{Enter}')
		await expect(args.onAdd).toHaveBeenLastCalledWith('Pinia')
		await expect(canvas.getByRole('list', { name: 'Теги' })).toHaveTextContent('Pinia')
		await userEvent.click(canvas.getByRole('button', { name: 'Удалить TypeScript' }))
		await expect(args.onRemove).toHaveBeenLastCalledWith('TypeScript')
		await expect(canvas.getByRole('status')).toHaveTextContent('Удалено: TypeScript')
	},
}
