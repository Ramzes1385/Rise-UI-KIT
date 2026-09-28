import { tabTo } from '@/stories/helpers'
import type meta from '../BaseTooltip.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor } from 'storybook/test'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Клавиатура: Tab ставит фокус на кнопку — подсказка появляется, как при наведении; Escape скрывает её,',
					'а фокус остаётся на кнопке.',
				].join('\n'),
			},
		},
	},
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent }) => {
		const button = canvas.getByRole('button', { name: 'Скопировать ссылку' })
		await tabTo(button, userEvent)
		await expect(await screen.findByRole('tooltip')).toHaveTextContent('Скопировать ссылку')

		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument())
		await expect(button).toHaveFocus()
	},
}
