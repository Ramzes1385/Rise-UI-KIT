import { getDay } from '../shared'
import { expect } from 'storybook/test'
import { tabTo } from '@/stories/helpers'
import type meta from '../BaseEventCalendar.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Песочница: меняйте props в панели Controls. Вид и дата связаны через `v-model:view` и `v-model:date` — переключатель',
					'и стрелки панели сразу отражаются в Controls. `today` задан явно, чтобы пример не зависел от даты просмотра.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas, canvasElement, userEvent, args }) => {
		await expect(args['onPeriod-change']).toHaveBeenCalledWith(expect.objectContaining({ view: 'month' }))
		const next = canvas.getByRole('button', { name: 'Следующий период' })
		await tabTo(next, userEvent)
		await userEvent.keyboard('{Enter}')
		await expect(canvas.getByRole('grid')).toHaveAccessibleName('Ноябрь 2026 г.')
		await userEvent.tab({ shift: true })
		await userEvent.tab({ shift: true })
		await expect(canvas.getByRole('button', { name: 'Сегодня' })).toHaveFocus()
		await userEvent.keyboard('{Enter}')
		await expect(getDay(canvasElement, '2026-10-02')).toHaveAttribute('aria-current', 'date')
	},
}
