import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseRequisiteInput.stories'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Свой фон и текст поля через `color` — как у BaseInput.' } } },
	args: { modelValue: '7707083893', color: { bg: { base: '#eff6ff' }, text: { base: '#1e3a8a' } } },
	play: async ({ canvas }) => {
		const wrapper = canvas.getByLabelText('ИНН').closest('.base-input__wrapper') as HTMLElement
		await expect(getComputedStyle(wrapper).backgroundColor).toBe('rgb(239, 246, 255)')
	},
}
