import { docsFrame } from '../../shared'
import type meta from '../../BaseSelect.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { screen, expect, within } from 'storybook/test'
import type { BaseSelectOption } from '../../../types/BaseSelect.types'

const CURRENCIES: BaseSelectOption[] = [
	{ value: 'rub', label: 'Российский рубль', icon: '₽', description: 'RUB · валюта счёта' },
	{ value: 'usd', label: 'Доллар США', icon: '$', description: 'USD' },
	{ value: 'eur', label: 'Евро', icon: '€', description: 'EUR' },
	{ value: 'cny', label: 'Китайский юань', icon: '¥', description: 'CNY' },
]

export const WithIcons: StoryObj<typeof meta> = {
	args: { label: 'Валюта', options: CURRENCIES, modelValue: 'rub', placeholder: 'Выберите валюту' },
	parameters: {
		docs: {
			...docsFrame(300),
			description: {
				story: [
					'Иконка (`icon` — символ или эмодзи) и описание (`description`) опции. Иконка выбранной опции видна и в триггере,',
					'выбранная опция в списке отмечена галочкой.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('combobox', { name: 'Валюта' }))
		const listbox = await screen.findByRole('listbox', { name: 'Валюта' })
		await expect(within(listbox).getByRole('option', { name: /Российский рубль/ })).toHaveAttribute('aria-selected', 'true')
		await expect(within(listbox).getByRole('option', { name: /Доллар США/ })).toHaveAttribute('aria-selected', 'false')
	},
}
