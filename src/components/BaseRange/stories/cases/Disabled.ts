import { expect } from 'storybook/test'
import type meta from '../BaseRange.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Disabled: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Отключённый слайдер: приглушён, ползунок вне порядка Tab и не реагирует на мышь и клавиатуру.' } },
	},
	args: { isDisabled: true, hasLabel: true },
	play: async ({ canvas }) => {
		const thumb = canvas.getByRole('slider', { name: 'Громкость' })
		await expect(thumb).toHaveAttribute('aria-disabled', 'true')
		await expect(thumb).toHaveAttribute('tabindex', '-1')
	},
}
