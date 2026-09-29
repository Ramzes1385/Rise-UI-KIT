import { expect } from 'storybook/test'
import { tabTo } from '@/stories/helpers'
import type meta from '../../BaseInputTags.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Клавиатура: запятая добавляет тег, Backspace в пустой строке — к последнему тегу, ещё Backspace — удаляет его.',
			},
		},
	},
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent, args }) => {
		const field = canvas.getByRole('textbox', { name: 'Навыки' })
		await tabTo(field, userEvent)
		await userEvent.keyboard('Nuxt,')
		await expect(args.onAdd).toHaveBeenLastCalledWith('Nuxt')
		await expect(field).toHaveValue('')
		await userEvent.keyboard('{Backspace}')
		await expect(canvas.getByRole('button', { name: 'Удалить Nuxt' })).toHaveFocus()
		await userEvent.keyboard('{ArrowLeft}')
		await expect(canvas.getByRole('button', { name: 'Удалить TypeScript' })).toHaveFocus()
		await userEvent.keyboard('{Backspace}')
		await expect(args.onRemove).toHaveBeenLastCalledWith('TypeScript')
		await expect(canvas.getByRole('button', { name: 'Удалить Vue' })).toHaveFocus()
	},
}
