import { expect } from 'storybook/test'
import type meta from '../../BaseCardInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Свой фон и текст полей через `color` — он передаётся каждому BaseInput группы.' } },
	},
	args: { color: { bg: { base: '#f5f3ff' }, text: { base: '#4c1d95' } } },
	play: async ({ canvas }) => {
		for (const label of ['Номер карты', 'Срок действия', 'Код', 'Имя владельца']) {
			const wrapper = canvas.getByLabelText(label).closest('.base-input__wrapper') as HTMLElement
			await expect(getComputedStyle(wrapper).backgroundColor).toBe('rgb(245, 243, 255)')
		}
	},
}
