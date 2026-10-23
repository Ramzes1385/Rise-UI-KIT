import { tabTo } from '@/stories/helpers'
import type meta from '../../BaseImageMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor } from 'storybook/test'

export const MobileSheet: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'На экране уже `sheetBreakpoint` (по умолчанию 640 px) окно объекта — нижняя панель BaseDrawer, как на телефоне. Здесь порог завышен, чтобы панель открывалась на любом экране.',
			},
		},
	},
	args: { sheetBreakpoint: 10000 },
	play: async ({ canvas, userEvent }) => {
		const peak = canvas.getByRole('button', { name: 'Вершина' })
		await tabTo(peak, userEvent)
		await userEvent.keyboard('{Enter}')
		const sheet = await screen.findByRole('dialog', { name: 'Вершина' })
		await expect(sheet.closest('.base-drawer')).not.toBeNull()
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(peak).toHaveFocus())
	},
}
