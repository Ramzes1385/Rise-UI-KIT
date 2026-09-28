import { expect } from 'storybook/test'
import type meta from '../BaseMenu.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import type { BaseMenuItem } from '../../types/BaseMenu.types'

const LONG_ITEMS: BaseMenuItem[][] = [
	[
		{ label: 'Экспортировать отчёт о продажах за квартал в формате таблицы', icon: 'download' },
		{ label: 'Отправить ссылку на отчёт руководителю отдела', icon: 'send' },
	],
]

export const LongContent: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Длинные названия переносятся по словам: меню не шире контейнера (здесь — 240px).' } } },
	args: { items: LONG_ITEMS },
	play: async ({ canvas }) => {
		const item = canvas.getByRole('button', { name: /Экспортировать отчёт/ })
		await expect(item.getBoundingClientRect().width).toBeLessThanOrEqual(240)
		await expect(item.scrollWidth).toBeLessThanOrEqual(item.clientWidth)
	},
}
