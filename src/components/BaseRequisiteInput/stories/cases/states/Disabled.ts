import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseRequisiteInput.stories'

export const Disabled: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Отключённое поле: значение видно, но не меняется.' } } },
	args: { kind: 'snils', modelValue: '11223344595', isDisabled: true },
	play: async ({ canvas }) => {
		await expect(canvas.getByLabelText('СНИЛС')).toBeDisabled()
		await expect(canvas.getByLabelText('СНИЛС')).toHaveValue('112-233-445 95')
	},
}
