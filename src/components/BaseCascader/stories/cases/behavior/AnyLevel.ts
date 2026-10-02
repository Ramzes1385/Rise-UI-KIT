import { docsFrame } from '../../shared'
import type meta from '../../BaseCascader.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor } from 'storybook/test'

export const AnyLevel: StoryObj<typeof meta> = {
	args: { label: 'Зона доставки', isAnyLevel: true },
	parameters: {
		docs: {
			...docsFrame(320),
			description: {
				story: [
					'Выбор любого уровня (`isAnyLevel`): щелчок по городу или округу выбирает его и раскрывает следующий уровень —',
					'можно уточнить до района или оставить город целиком. Конечный узел выбирает и закрывает панель.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByRole('combobox', { name: 'Зона доставки' })
		await userEvent.click(field)
		await userEvent.click(await screen.findByRole('option', { name: 'Санкт-Петербург' }))
		await expect(field).toHaveTextContent('Санкт-Петербург')
		await expect(field).toHaveAttribute('aria-expanded', 'true')
		await waitFor(() => expect(screen.getAllByRole('listbox')).toHaveLength(2))
	},
}
