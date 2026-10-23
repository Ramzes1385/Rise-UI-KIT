import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseAudioPlayer.stories'

export const Disabled: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Недоступный плеер: кнопки и волна не реагируют и не получают фокус.' } } },
	args: { isDisabled: true },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('button', { name: 'Воспроизвести' })).toBeDisabled()
		await expect(canvas.getByRole('slider', { name: 'Перемотка' })).toHaveAttribute('aria-disabled', 'true')
	},
}
