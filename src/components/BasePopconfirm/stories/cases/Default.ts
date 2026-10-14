import { docsFrame } from '@/stories/helpers'
import type meta from '../BasePopconfirm.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { screen, expect, waitFor, within } from 'storybook/test'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			...docsFrame(260),
			description: {
				story: [
					'Песочница: клик по кнопке открывает вопрос, фокус — на «Снять». «Снять» эмитит `confirm`, «Отмена», Escape',
					'и клик снаружи — `cancel`; фокус возвращается на кнопку.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas, userEvent, args }) => {
		const trigger = canvas.getByRole('button', { name: 'Снять с публикации' })
		await userEvent.click(trigger)
		const dialog = await screen.findByRole('alertdialog', { name: 'Снять серию с публикации?' })
		await expect(dialog).toHaveAccessibleDescription('Подписчики перестанут её видеть. Вернуть можно в любой момент.')
		await expect(trigger).toHaveAttribute('aria-expanded', 'true')
		await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Снять' })).toHaveFocus())

		await userEvent.click(within(dialog).getByRole('button', { name: 'Снять' }))
		await expect(args.onConfirm).toHaveBeenCalledOnce()
		await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
		await expect(trigger).toHaveFocus()
	},
}
