import { expect } from 'storybook/test'
import type meta from '../BaseQrCode.stories'
import { QR_SOURCE, renderQr } from '../shared'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Песочница: меняйте текст, уровень коррекции, размер, формы и логотип в панели Controls.' },
			source: QR_SOURCE,
		},
	},
	render: renderQr,
	play: async ({ canvas, canvasElement }) => {
		await expect(canvas.getByRole('img', { name: 'QR-код: https://ramzes1385.github.io/Rise-UI-KIT/' })).toBeVisible()
		await expect(canvasElement.querySelector('svg')).toHaveAttribute('viewBox', '0 0 37 37')
	},
}
