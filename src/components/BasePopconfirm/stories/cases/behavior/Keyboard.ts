import { tabTo } from '@/stories/helpers'
import type meta from '../../BasePopconfirm.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { screen, within, waitFor, expect } from 'storybook/test'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Клавиатура: Enter на кнопке открывает вопрос, Tab и Shift+Tab ходят между «Отменой» и подтверждением по кругу,',
					'Escape отменяет и возвращает фокус на кнопку.',
				].join('\n'),
			},
		},
	},
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent, args }) => {
		const trigger = canvas.getByRole('button', { name: 'Снять с публикации' })
		await tabTo(trigger, userEvent)
		await userEvent.keyboard('{Enter}')
		const dialog = await screen.findByRole('alertdialog')
		const confirm = within(dialog).getByRole('button', { name: 'Снять' })
		const cancel = within(dialog).getByRole('button', { name: 'Отмена' })
		await waitFor(() => expect(confirm).toHaveFocus())

		await userEvent.tab()
		await expect(cancel).toHaveFocus()
		await userEvent.tab()
		await expect(confirm).toHaveFocus()
		await userEvent.tab({ shift: true })
		await expect(cancel).toHaveFocus()

		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
		await expect(args.onCancel).toHaveBeenCalledOnce()
		await expect(trigger).toHaveFocus()
	},
}
