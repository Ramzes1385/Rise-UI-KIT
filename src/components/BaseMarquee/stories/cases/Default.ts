import { expect } from 'storybook/test'
import type meta from '../BaseMarquee.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Песочница: направление, скорость, отступ и затухание — в Controls. Наведите указатель — лента остановится.',
			},
		},
	},
	play: async ({ canvas }) => {
		const marquee = canvas.getByRole('marquee', { name: 'Бегущая строка' })
		await expect(marquee).toBeVisible()
		await expect(canvas.getAllByText(/Скидка 20%/)[0]).toBeVisible()
	},
}
