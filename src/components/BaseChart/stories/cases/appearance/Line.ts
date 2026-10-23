import { expect } from 'storybook/test'
import type meta from '../../BaseChart.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Line: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Линии (`variant="line"`): шкала Y подбирается по данным и не обязана начинаться с нуля.' } },
	},
	args: { variant: 'line' },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('img')).toHaveAccessibleName('Выручка и расходы за 2026 год: Выручка, Расходы; значения от 90 до 240')
	},
}
