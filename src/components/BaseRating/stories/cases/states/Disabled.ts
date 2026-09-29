import { expect } from 'storybook/test'
import type meta from '../../BaseRating.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { starOf, pointOn, fillOf } from '../../shared'

export const Disabled: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Отключённый рейтинг: приглушён, не получает фокус, не реагирует на наведение, клик и клавиатуру.' },
		},
	},
	args: { modelValue: 2, isDisabled: true },
	play: async ({ canvas, userEvent, args }) => {
		const rating = canvas.getByRole('slider')
		await expect(rating).toHaveAttribute('aria-disabled', 'true')
		await expect(rating).not.toHaveAttribute('tabindex')

		const star = starOf(rating, 4)
		await userEvent.pointer({ keys: '[MouseLeft]', target: star, coords: pointOn(star) })
		await expect(args.onChange).not.toHaveBeenCalled()
		await expect(fillOf(starOf(rating, 4))).toBe('0%')
		await expect(rating).not.toHaveFocus()
	},
}
