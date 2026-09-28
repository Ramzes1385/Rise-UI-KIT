import { tabTo } from '@/stories/helpers'
import { expect, screen } from 'storybook/test'
import type meta from '../BaseColorPicker.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Клавиатура: Enter на образце открывает панель, Tab ведёт в область выбора, стрелки меняют насыщенность',
					'(Shift — шаг 10%), Escape закрывает панель и возвращает фокус на образец.',
				].join('\n'),
			},
		},
	},
	tags: ['!autodocs'],
	args: { modelValue: '#808080' },
	play: async ({ canvas, userEvent }) => {
		const swatch = canvas.getByRole('button', { name: /Выбранный цвет/ })
		await tabTo(swatch, userEvent)
		await userEvent.keyboard('{Enter}')
		await expect(swatch).toHaveAttribute('aria-expanded', 'true')

		const area = await screen.findByRole('slider', { name: 'Насыщенность и яркость' })
		await tabTo(area, userEvent)
		await expect(area).toHaveAttribute('aria-valuenow', '0')
		await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}')
		await expect(area).toHaveAttribute('aria-valuenow', '10')
		await userEvent.keyboard('{ArrowRight}')
		await expect(area).toHaveAttribute('aria-valuenow', '11')

		await userEvent.keyboard('{Escape}')
		await expect(swatch).toHaveAttribute('aria-expanded', 'false')
		await expect(swatch).toHaveFocus()
	},
}
