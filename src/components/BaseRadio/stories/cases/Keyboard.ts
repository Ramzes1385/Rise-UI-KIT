import { expect } from 'storybook/test'
import { tabTo } from '@/stories/helpers'
import type meta from '../BaseRadio.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Клавиатура: Tab ставит фокус на выбранную опцию (видно кольцо вокруг круга), стрелки переключают выбор.',
			},
		},
	},
	tags: ['!autodocs'],
	args: { name: 'delivery-keyboard' },
	play: async ({ canvas, userEvent, args }) => {
		const courier = canvas.getByRole('radio', { name: 'Курьером' })
		await tabTo(courier, userEvent)
		await expect(getComputedStyle(courier.nextElementSibling as HTMLElement).outlineStyle).toBe('solid')
		await userEvent.keyboard('{ArrowRight}')
		const pickup = canvas.getByRole('radio', { name: 'Самовывоз' })
		await expect(pickup).toBeChecked()
		await expect(pickup).toHaveFocus()
		await expect(args.onChange).toHaveBeenLastCalledWith('pickup')
	},
}
