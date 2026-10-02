import { tabTo } from '@/stories/helpers'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseStepper.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Клавиатура: Tab переводит фокус между шагами (видно кольцо фокуса), Enter и Space делают шаг текущим. Фокус',
					'остаётся на выбранном шаге; Enter по текущему шагу событий не эмитит.',
				].join('\n'),
			},
		},
	},
	tags: ['!autodocs'],
	args: { modelValue: 1 },
	play: async ({ canvas, userEvent, args }) => {
		const delivery = canvas.getByRole('button', { name: /Доставка/ })
		await tabTo(delivery, userEvent)
		await expect(getComputedStyle(delivery).outlineStyle).toBe('solid')
		await userEvent.keyboard('{Enter}')
		await expect(args.onChange).toHaveBeenLastCalledWith(2)
		await waitFor(() => expect(delivery).toHaveAttribute('aria-current', 'step'))
		await expect(delivery).toHaveFocus()
		await userEvent.keyboard('{Enter}')
		await expect(args.onChange).toHaveBeenCalledTimes(1)

		await userEvent.tab()
		await userEvent.keyboard(' ')
		await expect(args.onChange).toHaveBeenLastCalledWith(3)
	},
}
