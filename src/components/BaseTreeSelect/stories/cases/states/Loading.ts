import { docsFrame } from '../../shared'
import type meta from '../../BaseTreeSelect.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor } from 'storybook/test'

export const Loading: StoryObj<typeof meta> = {
	args: { isLoading: true },
	parameters: {
		docs: {
			...docsFrame(200),
			description: {
				story: 'Узлы загружаются: поле помечено `aria-busy`, в списке — «Загрузка...» в `role="status"`, дерево не показывается.',
			},
		},
	},
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('combobox', { name: 'Город доставки' })
		await expect(trigger).toHaveAttribute('aria-busy', 'true')
		await userEvent.click(trigger)
		const status = await screen.findByRole('status')
		await waitFor(() => expect(status).toHaveTextContent('Загрузка...'))
		await expect(screen.queryByRole('tree')).not.toBeInTheDocument()
	},
}
