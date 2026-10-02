import { expect } from 'storybook/test'
import { tabTo } from '@/stories/helpers'
import type meta from '../../BaseButton.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const FocusableWhenDisabled: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Отключённая, но фокусируемая (`isFocusableWhenDisabled`): `aria-disabled` вместо `disabled`, кнопка остаётся',
					'в порядке Tab, клик, Enter и Space не вызывают событие. Для кнопок, которые отключаются от собственного нажатия',
					'(предел шага, «Вперёд» на последней странице): фокус не уходит в начало страницы. Кольцо фокуса — полной яркости.',
				].join('\n'),
			},
		},
	},
	args: { isDisabled: true, isFocusableWhenDisabled: true, default: 'Вперёд' },
	play: async ({ canvas, userEvent, args }) => {
		const button = canvas.getByRole('button', { name: 'Вперёд' })
		await expect(button).toHaveAttribute('aria-disabled', 'true')
		await expect(button).not.toHaveAttribute('disabled')
		await tabTo(button, userEvent)
		await expect(button).toHaveFocus()
		await expect(getComputedStyle(button).opacity).toBe('1')
		await expect(getComputedStyle(button).outlineStyle).toBe('solid')
		await userEvent.keyboard('{Enter}')
		await userEvent.keyboard(' ')
		await userEvent.click(button)
		await expect(args.onClick).not.toHaveBeenCalled()
	},
}
