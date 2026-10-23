import { expect } from 'storybook/test'
import type meta from '../../BaseQrCode.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { QR_LOGO, QR_SOURCE, renderQr } from '../../shared'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Фирменный код: свои цвета модулей, «глазков» и фона — тёмное на светлом, контраст высокий; скругления и логотип.',
			},
			source: QR_SOURCE,
		},
	},
	args: {
		size: 200,
		moduleColor: '#1e3a8a',
		finderColor: '#4f46e5',
		backgroundColor: '#eef2ff',
		moduleShape: 'rounded',
		finderShape: 'rounded',
		logo: QR_LOGO,
	},
	render: renderQr,
	play: async ({ canvasElement }) => {
		await expect(canvasElement.querySelector('.base-qr-code__modules')).toHaveAttribute('fill', '#1e3a8a')
		await expect(canvasElement.querySelector('.base-qr-code__finder')).toHaveAttribute('fill', '#4f46e5')
		await expect(canvasElement.querySelector('rect')).toHaveAttribute('fill', '#eef2ff')
		await expect(canvasElement.querySelector('image')).toHaveAttribute('href', QR_LOGO)
	},
}
