import { expect } from 'storybook/test'
import type meta from '../../BaseTransfer.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const LongContent: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Длинные названия и описания переносятся внутри строки; много строк — прокрутка внутри панели высотой `height`; ширина не больше контейнера.',
			},
		},
	},
	args: {
		label: 'Колонки отчёта о продажах по регионам и каналам за последний квартал с учётом возвратов',
		titles: ['Все доступные колонки отчёта', 'Колонки, которые попадут в выгрузку'],
		items: Array.from({ length: 30 }, (_, index) => ({
			id: `column-${index + 1}`,
			title: `Колонка ${index + 1}: выручка по региону с учётом скидок, возвратов и бонусов партнёров`,
			description: 'Считается по закрытым заказам; данные обновляются каждую ночь',
		})),
		modelValue: ['column-2', 'column-5'],
	},
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('.base-transfer') as HTMLElement
		await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth)
	},
}
