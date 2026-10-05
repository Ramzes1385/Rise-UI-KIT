import { expect } from 'storybook/test'
import type meta from '../../BaseQrCode.stories'
import { QR_SOURCE, renderQr } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'

export const Concealed: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Ключ двухфакторной защиты или токен входа: `isConcealed` — до нажатия кнопки в DOM только размытая заглушка,',
					'не связанная с данными, и кнопка «Показать QR-код». После нажатия код виден, фокус — на картинке, событие `reveal`;',
					'`revealTimeout` скрывает код снова (событие `conceal`). Имя картинки — `label`, секрет вслух не читается.',
				].join(' '),
			},
			source: QR_SOURCE,
		},
	},
	args: {
		value: 'otpauth://totp/Rise:anna@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Rise',
		label: 'Ключ для приложения-аутентификатора',
		isConcealed: true,
		revealTimeout: 60000,
	},
	render: renderQr,
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.queryByRole('img')).toBeNull()
		await userEvent.tab()
		const button = canvas.getByRole('button', { name: 'Показать QR-код' })
		await expect(button).toHaveFocus()
		await userEvent.keyboard('{Enter}')
		const image = await canvas.findByRole('img', { name: 'Ключ для приложения-аутентификатора' })
		await expect(image).toHaveFocus()
	},
}
