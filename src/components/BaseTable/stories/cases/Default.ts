import { bodyRows } from '../shared'
import { expect } from 'storybook/test'
import type meta from '../BaseTable.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Песочница: меняйте props в Controls — например, включите `features.search` или `behavior.selectable`.',
					'Заголовки «Покупатель», «Город», «Дата» и «Сумма» сортируют строки. Story открывают e2e-тесты, поэтому play',
					'только проверяет начальное состояние.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('columnheader', { name: 'Покупатель' })).toHaveAttribute('aria-sort', 'none')
		await expect(canvas.getByRole('columnheader', { name: 'Заказ' })).not.toHaveAttribute('aria-sort')
		await expect(bodyRows(canvas.getByRole('table'))).toHaveLength(5)
	},
}
