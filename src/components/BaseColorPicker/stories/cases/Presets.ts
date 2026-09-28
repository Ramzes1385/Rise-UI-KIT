import { docsFrame } from '../shared'
import type meta from '../BaseColorPicker.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { screen, waitFor, expect } from 'storybook/test'

const BRAND_PRESETS = [
	'#0f172a',
	'#1d4ed8',
	'#0891b2',
	'#15803d',
	'#ca8a04',
	'#c2410c',
	'#be123c',
	'#7e22ce',
	'#f8fafc',
	'#cbd5e1',
	'#64748b',
	'#334155',
]

export const Presets: StoryObj<typeof meta> = {
	args: { presets: BRAND_PRESETS, modelValue: '#0f172a' },
	parameters: {
		docs: {
			...docsFrame(380),
			description: {
				story: [
					'Свои пресеты (`presets`) — например, фирменная палитра. Выбор пресета записывает его HEX в модель как есть',
					'и закрывает панель; выбранный пресет отмечен кольцом основного цвета.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas, userEvent }) => {
		const swatch = canvas.getByRole('button', { name: /Выбранный цвет/ })
		await userEvent.click(swatch)
		await userEvent.click(await screen.findByRole('button', { name: 'Пресет #1d4ed8' }))
		await waitFor(() => expect(swatch.style.backgroundColor).toBe('rgb(29, 78, 216)'))
		await waitFor(() => expect(screen.queryByRole('slider', { name: 'Насыщенность и яркость' })).not.toBeInTheDocument())

		await userEvent.click(swatch)
		await expect(await screen.findByRole('button', { name: 'Пресет #1d4ed8' })).toHaveAttribute('aria-pressed', 'true')
	},
}
