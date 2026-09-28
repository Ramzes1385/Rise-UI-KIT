import { waitFor, expect } from 'storybook/test'
import type meta from '../BaseScrollArea.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Песочница: наведите указатель — появится полоса; её можно тянуть и щёлкать.' } } },
	play: async ({ canvas, canvasElement }) => {
		const region = canvas.getByRole('region', { name: 'Журнал склада' })
		await waitFor(() => expect(region).toHaveAttribute('tabindex', '0'))
		await expect(canvasElement.querySelector('.base-scroll-area__bar--y')).toBeInTheDocument()
		await expect(getComputedStyle(region).scrollbarWidth).toBe('none')
	},
}
