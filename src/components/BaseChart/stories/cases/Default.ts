import { expect } from 'storybook/test'
import { tabTo } from '@/stories/helpers'
import type meta from '../BaseChart.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Песочница: меняйте props в панели Controls. Область графика достижима клавишей Tab, стрелки переходят по точкам, кнопки легенды скрывают ряды.',
			},
		},
	},
	play: async ({ canvas, userEvent }) => {
		const plot = canvas.getByRole('img', { name: /^Выручка и расходы за 2026 год/ })
		await tabTo(plot, userEvent)
		await userEvent.keyboard('{ArrowRight}')
		await expect(canvas.getByRole('status')).toHaveTextContent('Янв: Выручка: 120, Расходы: 90')
	},
}
