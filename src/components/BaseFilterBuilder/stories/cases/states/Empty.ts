import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseFilterBuilder.stories'

export const Empty: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Без условий: подсказка «Условий нет — показаны все строки» и кнопка «Добавить условие».' } },
	},
	args: { modelValue: { match: 'all', conditions: [] } },
	play: async ({ canvas }) => {
		await expect(canvas.getByText('Условий нет — показаны все строки')).toBeInTheDocument()
		await expect(canvas.queryByRole('button', { name: 'Сбросить' })).toBeNull()
	},
}
