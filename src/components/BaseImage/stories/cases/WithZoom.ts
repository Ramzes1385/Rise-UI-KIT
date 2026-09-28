import type meta from '../BaseImage.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { screen, waitFor, expect } from 'storybook/test'

export const WithZoom: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Просмотр по клику: изображение становится кнопкой и открывает модальный диалог. Кнопки и колесо мыши меняют',
					'масштаб, при масштабе больше 100% появляется мини-карта (клик и перетаскивание в ней двигают видимую область).',
					'Закрыть — кнопка, Esc или клик по фону вокруг изображения (`closeOnOverlay`).',
				].join('\n'),
			},
		},
	},
	args: { zoomConfig: { hasZoom: true } },
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Горы на рассвете' }))

		const dialog = await screen.findByRole('dialog', { name: 'Просмотр изображения: Горы на рассвете' })
		await waitFor(() => expect(screen.getByRole('button', { name: 'Закрыть' })).toHaveFocus())

		await userEvent.click(screen.getByRole('button', { name: 'Увеличить' }))
		await expect(dialog).toHaveTextContent('125%')
		await expect(args.onZoom).toHaveBeenLastCalledWith(1.25)

		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
	},
}
