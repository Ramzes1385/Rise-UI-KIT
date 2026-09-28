import { expect } from 'storybook/test'
import type meta from '../BaseMenu.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import type { BaseMenuItem } from '../../types/BaseMenu.types'

const DIVIDER_ITEMS: BaseMenuItem[][] = [
	[{ label: 'Вырезать' }, { label: 'Копировать' }, { label: 'Вставить', hasDivider: true }, { label: 'Выделить всё' }],
	[{ label: 'Свойства' }],
]

export const WithDividers: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Разделители: между группами (вложенные массивы `items`) и после пункта с `hasDivider`.' } },
	},
	args: { items: DIVIDER_ITEMS },
	play: async ({ canvas }) => {
		await expect(canvas.getAllByRole('separator')).toHaveLength(2)
	},
}
