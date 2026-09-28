import { expect } from 'storybook/test'
import type meta from '../BaseText.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Песочница: меняйте props в панели Controls. По умолчанию — абзац 14/20.' } } },
	play: async ({ canvas }) => {
		const text = canvas.getByText('Сохраните изменения, чтобы их увидели участники проекта.')
		await expect(text.tagName).toBe('P')
		await expect(getComputedStyle(text).fontSize).toBe('14px')
		await expect(getComputedStyle(text).lineHeight).toBe('20px')
	},
}
