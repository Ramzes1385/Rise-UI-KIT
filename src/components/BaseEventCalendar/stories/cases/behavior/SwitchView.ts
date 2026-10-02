import { expect } from 'storybook/test'
import { tabTo } from '@/stories/helpers'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseEventCalendar.stories'

export const SwitchView: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Смена вида и периода: переключатель видов — группа радиокнопок (стрелки меняют вид), стрелки панели — период.',
					'Каждая смена озвучивается через `role="status"` («Неделя …, вид «Неделя»») и приходит событиями',
					'`update:view`, `update:date` и `period-change`.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas, userEvent }) => {
		const month = canvas.getByRole('radio', { name: 'Месяц' })
		await tabTo(month, userEvent)
		await userEvent.keyboard('{ArrowRight}')
		await expect(canvas.getByRole('radio', { name: 'Неделя' })).toBeChecked()
		await expect(canvas.getByRole('status')).toHaveTextContent('вид «Неделя»')
		await userEvent.click(canvas.getByRole('button', { name: 'Следующий период' }))
		await expect(canvas.getByRole('status')).toHaveTextContent(/^5.+11 окт\. 2026 г\., вид «Неделя»$/)
		await userEvent.click(canvas.getByText('Список'))
		await expect(canvas.getByRole('list', { name: /14 октября/ })).toBeVisible()
	},
}
