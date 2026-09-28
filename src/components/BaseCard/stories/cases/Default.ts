import { expect } from 'storybook/test'
import type meta from '../BaseCard.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Песочница: меняйте props в панели Controls. Отступы секций по умолчанию — 16px 20px.' } },
	},
	play: async ({ canvas }) => {
		const title = canvas.getByRole('heading', { level: 3, name: 'Отчёт за май' })
		await expect(getComputedStyle(title).fontSize).toBe('16px')
		const header = title.closest('.base-card__header') as HTMLElement
		await expect(getComputedStyle(header).padding).toBe('16px 20px')
	},
}
