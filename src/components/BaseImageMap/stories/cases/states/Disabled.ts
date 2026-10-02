import { expect } from 'storybook/test'
import type meta from '../../BaseImageMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Disabled: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Недоступный объект (`isDisabled`): виден и озвучивается, но не выбирается и пропускается при переходе стрелками — «Закрытая трасса».',
			},
		},
	},
	play: async ({ canvas, userEvent, args }) => {
		const closed = canvas.getByRole('button', { name: 'Закрытая трасса' })
		await expect(closed).toHaveAttribute('aria-disabled', 'true')
		await expect(closed).toHaveAttribute('tabindex', '-1')
		await userEvent.click(closed)
		await expect(args.onSelect).not.toHaveBeenCalled()
	},
}
