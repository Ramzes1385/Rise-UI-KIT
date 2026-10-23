import { expect } from 'storybook/test'
import type meta from '../BaseSplitter.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Vertical: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Одна над другой (`orientation="vertical"`): разделитель горизонтальный, двигается стрелками ↑/↓.' },
		},
	},
	args: { orientation: 'vertical', modelValue: 50 },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('separator')).toHaveAttribute('aria-orientation', 'horizontal')
	},
}
