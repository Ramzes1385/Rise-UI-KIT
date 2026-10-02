import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseImageMapEditor.stories'

export const Disabled: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Только просмотр: инструменты, правка, файлы и поля панели отключены, экспорт JSON доступен. Объект можно выбрать в списке «Объекты слоя».',
			},
		},
	},
	args: { isDisabled: true },
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.getByRole('radio', { name: 'Прямоугольник' })).toBeDisabled()
		await expect(canvas.getByRole('button', { name: 'Импорт JSON' })).toBeDisabled()
		await expect(canvas.getByRole('button', { name: 'Экспорт JSON' })).toBeEnabled()
		await expect(canvas.getByRole('application', { name: 'Холст карты' })).toHaveAccessibleDescription(
			'Только просмотр: правка отключена.',
		)

		const lake = canvas.getByRole('button', { name: /^Озеро/ })
		await expect(lake).toBeEnabled()
		await userEvent.click(lake)
		await expect(lake).toHaveAttribute('aria-current', 'true')
		const title = canvas.getByLabelText('Название')
		await expect(title).toHaveValue('Озеро')
		await expect(title).toBeDisabled()
	},
}
