import { getDay } from '../../shared'
import { expect } from 'storybook/test'
import { tabTo } from '@/stories/helpers'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseEventCalendar.stories'

export const Keyboard: StoryObj<typeof meta> = {
	tags: ['!autodocs'],
	parameters: {
		docs: {
			description: {
				story: [
					'Клавиатура в сетке месяца (APG Grid): одна точка Tab — выбранный день; ←/→ — день, ↑/↓ — неделя, Home/End —',
					'начало и конец недели, PageUp/PageDown — месяц. Tab из дня ведёт к его событиям, Enter открывает событие.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas, canvasElement, userEvent, args }) => {
		await tabTo(getDay(canvasElement, '2026-10-02'), userEvent)
		await expect(getDay(canvasElement, '2026-10-02')).toHaveAttribute('aria-selected', 'true')
		await userEvent.keyboard('{ArrowRight}')
		await expect(getDay(canvasElement, '2026-10-03')).toHaveFocus()
		await userEvent.keyboard('{ArrowDown}')
		await expect(getDay(canvasElement, '2026-10-10')).toHaveFocus()
		await userEvent.keyboard('{Home}')
		await expect(getDay(canvasElement, '2026-10-05')).toHaveFocus()
		await userEvent.keyboard('{End}')
		await expect(getDay(canvasElement, '2026-10-11')).toHaveFocus()
		await userEvent.keyboard('{PageDown}')
		await expect(canvas.getByRole('grid')).toHaveAccessibleName('Ноябрь 2026 г.')
		await expect(getDay(canvasElement, '2026-11-11')).toHaveFocus()
		await userEvent.keyboard('{PageUp}')
		await userEvent.keyboard('{ArrowLeft}')
		await expect(getDay(canvasElement, '2026-10-10')).toHaveFocus()
		await userEvent.keyboard('{ArrowUp}')
		await userEvent.keyboard('{ArrowUp}')
		await userEvent.keyboard('{ArrowLeft}')
		await expect(getDay(canvasElement, '2026-09-25')).toHaveFocus()
		await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}')
		await expect(getDay(canvasElement, '2026-10-02')).toHaveFocus()
		const meeting = canvas.getByRole('button', { name: 'Встреча с командой, 2 октября, 10:00–11:00' })
		await userEvent.tab()
		await expect(meeting).toHaveFocus()
		await userEvent.keyboard('{Enter}')
		await expect(args['onEvent-click']).toHaveBeenLastCalledWith(
			expect.objectContaining({ allDay: false, event: expect.objectContaining({ id: 'standup' }) }),
		)
	},
}
