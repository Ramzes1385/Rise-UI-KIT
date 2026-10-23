import { docsFrame } from '../../shared'
import type meta from '../../BaseTreeSelect.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor } from 'storybook/test'

export const Searchable: StoryObj<typeof meta> = {
	args: { isSearchable: true },
	parameters: {
		docs: {
			...docsFrame(360),
			description: {
				story: [
					'Поиск по подписям: при открытии фокус в поле поиска, видны совпавшие узлы и их раскрытые предки.',
					'Стрелки вверх и вниз и Enter управляют деревом; пока в поиске есть текст, влево и вправо двигают курсор.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('combobox', { name: 'Город доставки' })
		await userEvent.click(trigger)
		const search = await screen.findByRole('textbox', { name: 'Поиск' })
		await waitFor(() => expect(search).toHaveFocus())
		await userEvent.type(search, 'под')
		await waitFor(() =>
			expect(screen.getAllByRole('treeitem').map(item => item.textContent?.trim())).toEqual([
				'Центральный округ',
				'Московская область',
				'Подольск',
			]),
		)
		await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}')
		await waitFor(() => expect(trigger).toHaveTextContent('Подольск'))
	},
}
