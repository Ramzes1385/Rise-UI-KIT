import { docsFrame } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseColorPicker.stories'
import { expect, screen, waitFor, within } from 'storybook/test'

export const Formats: StoryObj<typeof meta> = {
	args: { modelValue: 'rgba(8, 145, 178, 0.8)', format: 'rgb', hasAlpha: true },
	parameters: {
		docs: {
			...docsFrame(420),
			description: {
				story: [
					'Форматы и прозрачность: `format="rgb"` отдаёт в v-model `rgb()`, с прозрачностью (`hasAlpha`) — `rgba()`.',
					'Переключатель над полями показывает цвет в HEX, RGB или HSL; поле «A» и ползунок под тоном — непрозрачность в процентах.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas, userEvent, args }) => {
		const swatch = canvas.getByRole('button', { name: 'Выбранный цвет rgba(8, 145, 178, 0.8)' })
		await userEvent.click(swatch)
		const panel = within(await screen.findByRole('group', { name: 'Формат цвета' }))
		await expect(panel.getByRole('button', { name: 'RGB' })).toHaveAttribute('aria-pressed', 'true')

		const alpha = await screen.findByRole('spinbutton', { name: 'Непрозрачность' })
		await userEvent.clear(alpha)
		await userEvent.type(alpha, '50')
		await userEvent.tab()
		await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith('rgba(8, 145, 178, 0.5)'))

		await userEvent.click(panel.getByRole('button', { name: 'HSL' }))
		await expect(await screen.findByRole('spinbutton', { name: 'Тон' })).toHaveValue(192)
	},
}
