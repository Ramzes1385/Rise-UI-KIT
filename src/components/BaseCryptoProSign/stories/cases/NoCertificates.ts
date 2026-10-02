import { emulate } from '../shared'
import { expect } from 'storybook/test'
import type meta from '../BaseCryptoProSign.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const NoCertificates: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Плагин работает, но в личном хранилище нет сертификатов: вместо списка — «В личном хранилище нет сертификатов»,',
					'«Подписать» недоступна. Это не ошибка окружения: событие `error` не приходит.',
				].join('\n'),
			},
		},
	},
	beforeEach: emulate({ scenario: 'noCertificates' }),
	play: async ({ canvas, args }) => {
		await expect(await canvas.findByText('В личном хранилище нет сертификатов')).toBeVisible()
		await expect(canvas.queryByRole('combobox', { name: 'Сертификат' })).not.toBeInTheDocument()
		await expect(canvas.getByRole('button', { name: 'Подписать' })).toBeDisabled()
		await expect(args.onError).not.toHaveBeenCalled()
	},
}
