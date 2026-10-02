import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseColorPicker.stories'
import { expect, screen, waitFor } from 'storybook/test'

export const AriaLabel: StoryObj<typeof meta> = {
	args: { ariaLabel: 'Цвет фона', modelValue: '#2563eb', triggerAttrs: { 'data-qa': 'background-color' } },
	parameters: {
		docs: {
			description: {
				story: [
					'`ariaLabel` говорит, что выбирает образец: имя кнопки — «Цвет фона, выбран #2563eb», значение остаётся в имени.',
					'Без него — «Выбранный цвет #2563eb». `triggerAttrs` передаёт атрибуты кнопке-образцу: `id`, `data-*`, `aria-describedby`.',
				].join('\n'),
			},
		},
		controls: { include: ['ariaLabel', 'modelValue', 'sizeScale', 'isDisabled'] },
	},
	play: async ({ canvas, userEvent }) => {
		const swatch = canvas.getByRole('button', { name: 'Цвет фона, выбран #2563eb' })
		await expect(swatch).toHaveAttribute('data-qa', 'background-color')
		swatch.focus()
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(swatch).toHaveAttribute('aria-expanded', 'true'))
		await expect(await screen.findByRole('slider', { name: /Насыщенность/ })).toBeInTheDocument()
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(swatch).toHaveAttribute('aria-expanded', 'false'))
	},
}
