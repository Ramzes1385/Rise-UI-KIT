import { docsFrame } from '../../shared'
import type meta from '../../BaseCascader.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor } from 'storybook/test'

export const Searchable: StoryObj<typeof meta> = {
	args: { isSearchable: true },
	parameters: {
		docs: {
			...docsFrame(360),
			description: {
				story: [
					'Поиск (`isSearchable`): фокус переходит в поле поиска, запрос ищет по подписям всех загруженных уровней,',
					'результаты — пути до выбираемых узлов. Пока запрос пуст, стрелки ходят по колонкам прямо из поля поиска.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByRole('combobox', { name: 'Район доставки' })
		await userEvent.click(field)
		const search = await screen.findByRole('textbox', { name: 'Поиск' })
		await waitFor(() => expect(search).toHaveFocus())

		await userEvent.keyboard('остров')
		await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(1))
		await expect(screen.getByRole('option')).toHaveTextContent('Санкт-Петербург / Василеостровский')

		await userEvent.keyboard('{Enter}')
		await expect(field).toHaveTextContent('Санкт-Петербург / Василеостровский')
		await expect(field).toHaveAttribute('aria-expanded', 'false')
	},
}
