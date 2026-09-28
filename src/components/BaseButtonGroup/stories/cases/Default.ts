import { expect } from 'storybook/test'
import type meta from '../BaseButtonGroup.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Песочница: три outline-кнопки с общей рамкой.' } } },
	play: async ({ canvas }) => {
		const group = canvas.getByRole('group', { name: 'Период' })
		const [first, middle] = group.querySelectorAll<HTMLElement>('.base-button')
		await expect(getComputedStyle(middle).borderTopLeftRadius).toBe('0px')
		await expect(getComputedStyle(first).borderTopLeftRadius).not.toBe('0px')
	},
}
