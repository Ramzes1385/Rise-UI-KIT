import { docsFrame } from '../shared'
import { expect, screen } from 'storybook/test'
import type meta from '../BaseColorPicker.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Minimal: StoryObj<typeof meta> = {
	args: { isHexHidden: true, isPresetsHidden: true, modelValue: '#0891b2' },
	parameters: {
		docs: {
			...docsFrame(260),
			description: {
				story: 'Минимальная панель: без поля HEX (`isHexHidden`) и пресетов (`isPresetsHidden`) — только область и тон.',
			},
		},
	},
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: /Выбранный цвет/ }))
		await expect(await screen.findByRole('slider', { name: 'Насыщенность и яркость' })).toBeInTheDocument()
		await expect(screen.queryByRole('textbox', { name: 'HEX-значение' })).not.toBeInTheDocument()
		await expect(screen.queryByRole('button', { name: /Пресет/ })).not.toBeInTheDocument()
	},
}
