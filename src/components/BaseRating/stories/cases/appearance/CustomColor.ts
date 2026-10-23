import { starOf } from '../../shared'
import { expect } from 'storybook/test'
import type meta from '../../BaseRating.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Кастомный цвет через `color`: `text` — заполненные звёзды (`text.hover` — предпросмотр), `bg` — фон коробки.',
			},
		},
	},
	args: {
		modelValue: 4,
		variant: 'soft',
		color: { bg: { base: '#fefce8' }, text: { base: '#ca8a04', hover: '#a16207' } },
	},
	play: async ({ canvas }) => {
		const rating = canvas.getByRole('slider')
		await expect(getComputedStyle(rating).backgroundColor).toBe('rgb(254, 252, 232)')
		const fill = starOf(rating, 0).querySelector('.base-rating__star-fill') as HTMLElement
		await expect(getComputedStyle(fill).color).toBe('rgb(202, 138, 4)')
	},
}
