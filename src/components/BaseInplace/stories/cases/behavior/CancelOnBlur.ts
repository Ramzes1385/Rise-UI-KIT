import { expect } from 'storybook/test'
import type meta from '../../BaseInplace.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const CancelOnBlur: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Выход из поля отменяет правку (`isSaveOnBlur=false`).' } } },
	args: { isSaveOnBlur: false },
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: /Название проекта/ }))
		await userEvent.type(canvas.getByRole('textbox', { name: 'Название проекта' }), ' 2.0')
		await userEvent.tab()
		await expect(args.onCancel).toHaveBeenCalled()
		await expect(canvas.getByRole('button', { name: 'Название проекта: Редизайн личного кабинета' })).toBeVisible()
	},
}
