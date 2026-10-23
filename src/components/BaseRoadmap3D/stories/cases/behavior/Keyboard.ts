import { tabTo } from '@/stories/helpers'
import type meta from '../../BaseRoadmap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'

export const Keyboard: StoryObj<typeof meta> = {
	tags: ['!autodocs'],
	parameters: {
		docs: {
			description: {
				story: 'Клавиатура: Tab ставит фокус на остров, стрелки идут по этапам, Enter открывает панель этапа, Escape возвращает обзор острова. Смена этапа озвучивается в `aria-live`.',
			},
		},
	},
	args: { ariaLabel: 'Путь с клавиатуры' },
	play: async ({ canvas, userEvent }) => {
		const island = await canvas.findByRole('group', { name: 'Путь с клавиатуры' })
		await tabTo(island, userEvent, 20)
		await userEvent.keyboard('{ArrowRight}')
		await waitFor(() =>
			expect(
				canvas
					.getAllByRole('status')
					.map(item => item.textContent)
					.join(' '),
			).toMatch(/Этап \d из 6/),
		)
		await userEvent.keyboard('{Enter}')
		const panel = await canvas.findByRole('region', { name: 'Подробности темы' })
		await expect(within(panel).getByRole('heading', { level: 2 })).toBeVisible()
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(canvas.queryByRole('region', { name: 'Подробности темы' })).toBeNull())
		await expect(island).toHaveFocus()
	},
}
