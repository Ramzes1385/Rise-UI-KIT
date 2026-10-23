import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseCryptoProSign.stories'

export const Disabled: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Отключённый компонент (`isDisabled`): диагностика идёт, но сертификат, тип подписи и «Подписать» недоступны.',
			},
		},
	},
	args: { isDisabled: true },
	play: async ({ canvas }) => {
		await expect(await canvas.findByRole('combobox', { name: 'Сертификат' })).toHaveAttribute('aria-disabled', 'true')
		await expect(canvas.getByRole('radio', { name: 'Присоединённая' })).toBeDisabled()
		await expect(canvas.getByRole('button', { name: 'Подписать' })).toBeDisabled()
	},
}
