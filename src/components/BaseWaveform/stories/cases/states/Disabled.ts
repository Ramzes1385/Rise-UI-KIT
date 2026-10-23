import { expect } from 'storybook/test'
import type meta from '../../BaseWaveform.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Disabled: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Только показ позиции: волна не получает фокус и не меняет позицию.' } } },
	args: { isDisabled: true },
	play: async ({ canvas }) => {
		const waveform = canvas.getByRole('slider', { name: 'Перемотка' })
		await expect(waveform).toHaveAttribute('aria-disabled', 'true')
		await expect(waveform).toHaveAttribute('tabindex', '-1')
	},
}
