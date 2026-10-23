import { docsFrame } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseColorPicker.stories'
import { screen, waitFor, expect } from 'storybook/test'

export const HexInput: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			...docsFrame(380),
			description: { story: 'Ввод HEX: значение применяется после Enter или ухода из поля и попадает в модель без искажений.' },
		},
	},
	play: async ({ canvas, userEvent }) => {
		const swatch = canvas.getByRole('button', { name: /Выбранный цвет/ })
		await userEvent.click(swatch)
		const hex = await screen.findByRole('textbox', { name: 'HEX-значение' })
		await userEvent.clear(hex)
		await userEvent.type(hex, '#123456')
		await userEvent.tab()
		await waitFor(() => expect(swatch.style.backgroundColor).toBe('rgb(18, 52, 86)'))
		await expect(hex).toHaveValue('#123456')
	},
}
