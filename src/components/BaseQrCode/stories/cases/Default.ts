import { expect } from 'storybook/test'
import type meta from '../BaseQrCode.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Песочница: меняйте текст, уровень коррекции и размер в панели Controls.' } } },
	play: async ({ canvas, canvasElement }) => {
		await expect(canvas.getByRole('img', { name: 'QR-код: https://ramzes1385.github.io/Rise-UI-KIT/' })).toBeVisible()
		await expect(canvasElement.querySelector('svg')).toHaveAttribute('viewBox', '0 0 37 37')
	},
}
