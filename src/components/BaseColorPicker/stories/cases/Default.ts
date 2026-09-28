import { expect } from 'storybook/test'
import type meta from '../BaseColorPicker.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Песочница: нажмите на образец, выберите цвет в панели или меняйте props в Controls.' } } },
	play: async ({ canvas }) => {
		const swatch = canvas.getByRole('button', { name: 'Выбранный цвет #f97316' })
		await expect(swatch).toHaveAttribute('aria-expanded', 'false')
		await expect(swatch.style.backgroundColor).toBe('rgb(249, 115, 22)')
	},
}
