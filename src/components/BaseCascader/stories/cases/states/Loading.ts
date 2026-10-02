import { docsFrame } from '../../shared'
import type meta from '../../BaseCascader.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor } from 'storybook/test'

export const Loading: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			...docsFrame(260),
			description: {
				story: [
					'Корневой уровень ещё загружается (`isLoading`): поле помечено `aria-busy`, колонка панели — индикатор загрузки.',
					'Загрузку вложенных уровней показывает LazyLevels.',
				].join('\n'),
			},
		},
	},
	args: { items: [], isLoading: true },
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByRole('combobox', { name: 'Район доставки' })
		await expect(field).toHaveAttribute('aria-busy', 'true')
		await userEvent.click(field)
		await waitFor(() => expect(screen.getByRole('status', { name: /Загрузка/ })).toBeVisible())
		await expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
	},
}
