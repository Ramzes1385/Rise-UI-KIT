import { tabTo } from '@/stories/helpers'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseRoadmap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'

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
		await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent(/Этап 1 из/))
		await userEvent.keyboard('{Escape}')
		await expect(island).toHaveFocus()
	},
}
