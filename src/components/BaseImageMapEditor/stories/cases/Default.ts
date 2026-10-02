import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../BaseImageMapEditor.stories'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Песочница: карта с точками и фигурами связана с Controls через `v-model`. Выберите объект в списке и правьте его свойства в панели.',
			},
		},
	},
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: /^Озеро/ }))
		await expect(canvas.getByRole('button', { name: /^Озеро/ })).toHaveAttribute('aria-current', 'true')
		const title = canvas.getByLabelText('Название')
		await expect(title).toHaveValue('Озеро')
		await userEvent.clear(title)
		await userEvent.type(title, 'Горное озеро')
		await expect(canvas.getByRole('button', { name: /^Горное озеро/ })).toHaveAttribute('aria-current', 'true')
	},
}
