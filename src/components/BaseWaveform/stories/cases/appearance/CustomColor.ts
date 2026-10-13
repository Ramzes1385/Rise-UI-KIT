import { expect } from 'storybook/test'
import type meta from '../../BaseWaveform.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Цвет сыгранной части через `color`; для статусов берите токены ролей: `var(--rise-success)`.' } },
	},
	args: { color: { bg: { base: '#6d28d9' } } },
	play: async ({ canvasElement }) => {
		const played = canvasElement.querySelector('.base-waveform__bar--played') as HTMLElement
		await expect(getComputedStyle(played).backgroundColor).toBe('rgb(109, 40, 217)')
	},
}
