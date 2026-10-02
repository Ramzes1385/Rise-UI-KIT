import { docsFrame } from '../../shared'
import type meta from '../../BaseCascader.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor } from 'storybook/test'

export const Multiple: StoryObj<typeof meta> = {
	args: {
		label: 'Районы доставки',
		isMultiple: true,
		modelValue: [
			['msk-region', 'cao', 'tverskoy'],
			['spb-region', 'admiralteysky'],
		],
	},
	parameters: {
		docs: {
			...docsFrame(360),
			description: {
				story: [
					'Несколько значений (`isMultiple`): `v-model` — список путей, в поле — метки с крестиком.',
					'Флажки — у выбираемых узлов; щелчок переключает путь, панель остаётся открытой.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByRole('combobox', { name: 'Районы доставки' })
		await expect(canvas.getByText('Москва / Центральный округ / Тверской')).toBeVisible()
		await userEvent.click(field)
		await userEvent.click(await screen.findByRole('option', { name: 'Казань' }))
		const district = await screen.findByRole('option', { name: 'Вахитовский' })
		await userEvent.click(district)
		await waitFor(() => expect(district).toHaveAttribute('aria-selected', 'true'))
		await expect(field).toHaveAttribute('aria-expanded', 'true')
		await expect(canvas.getByText('Казань / Вахитовский')).toBeVisible()
	},
}
