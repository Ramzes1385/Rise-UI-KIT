import { expect } from 'storybook/test'
import type meta from '../../BaseQrCode.stories'
import { QR_SOURCE, renderQr } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'

export const SbpPayment: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Ссылку СБП `https://qr.nspk.ru/…` регистрирует банк-эквайер через НСПК и подписывает — собрать её в браузере нельзя.',
					'Приложение получает ссылку от бэкенда и передаёт в `value`; `showValue="host"` показывает под кодом «qr.nspk.ru».',
					'Ссылка в примере — заглушка.',
				].join(' '),
			},
			source: QR_SOURCE,
		},
	},
	args: {
		value: 'https://qr.nspk.ru/AS1000670LSS7DN18SJQDNP4B05KLJL2?type=01&bank=100000000111&sum=125000&cur=RUB&crc=AB75',
		label: 'QR-код для оплаты через СБП',
		showValue: 'host',
	},
	render: renderQr,
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('img', { name: 'QR-код для оплаты через СБП' })).toBeVisible()
		await expect(canvas.getByText('qr.nspk.ru')).toBeVisible()
	},
}
