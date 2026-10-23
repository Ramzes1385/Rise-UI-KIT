import { expect } from 'storybook/test'
import type meta from '../../BaseGantt.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Loading: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: '`isLoading`: вместо диаграммы — скелетон строк с областью `role="status"` и `aria-busy`; данные в это время можно не передавать.',
			},
		},
	},
	args: { isLoading: true, tasks: [], height: 320 },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('status', { name: 'Загрузка задач' })).toHaveAttribute('aria-busy', 'true')
		await expect(canvas.queryByRole('treegrid')).not.toBeInTheDocument()
	},
}
