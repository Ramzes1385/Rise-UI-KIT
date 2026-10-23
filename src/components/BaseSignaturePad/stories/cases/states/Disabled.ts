import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseSignaturePad.stories'
import { SAMPLE_SIGNATURE } from '../../sampleSignature'

export const Disabled: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Отключённое поле: подпись видна, но рисовать, отменять и очищать нельзя.' } } },
	args: { isDisabled: true, modelValue: SAMPLE_SIGNATURE },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('group', { name: 'Подпись клиента' })).toHaveAttribute('aria-disabled', 'true')
		await expect(canvas.getByRole('button', { name: 'Отменить штрих' })).toBeDisabled()
		await expect(canvas.getByRole('button', { name: 'Очистить' })).toBeDisabled()
	},
}
