import { expect } from 'storybook/test'
import type meta from '../../BaseSideBar.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import type { SideBarItem } from '../../../types/BaseSideBar.types'

const LONG_ITEMS: SideBarItem[] = [
	{ key: 'reports', label: 'Отчёты о продажах по регионам и каналам сбыта', icon: 'file', to: '/reports' },
	{ key: 'contracts', label: 'Договоры с поставщиками комплектующих', icon: 'folder', to: '/contracts' },
]

export const LongContent: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Длинные названия обрезаются многоточием, панель не расширяется.' } } },
	args: { items: LONG_ITEMS, activePath: '/reports' },
	play: async ({ canvas }) => {
		const label = canvas.getByText(/Отчёты о продажах/)
		await expect(label.scrollWidth).toBeGreaterThan(label.clientWidth)
		await expect(canvas.getByRole('complementary').getBoundingClientRect().width).toBe(280)
	},
}
