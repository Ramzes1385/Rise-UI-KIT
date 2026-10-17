import { expect } from 'storybook/test'
import type meta from '../BaseSplitter.stories'
import { inlineKey, tabTo } from '@/stories/helpers'
import type { StoryObj } from '@storybook/vue3-vite'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Клавиатура: →/← — шаг 5%, Home/End — к границам, Enter сворачивает первую панель и возвращает её.' },
		},
	},
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent, args }) => {
		const separator = canvas.getByRole('separator', { name: 'Список писем' })
		await tabTo(separator, userEvent)
		await userEvent.keyboard(inlineKey('{ArrowRight}'))
		await expect(separator).toHaveAttribute('aria-valuenow', '40')
		await userEvent.keyboard('{End}')
		await expect(separator).toHaveAttribute('aria-valuenow', '80')
		await userEvent.keyboard('{Enter}')
		await expect(separator).toHaveAttribute('aria-valuenow', '20')
		await userEvent.keyboard('{Enter}')
		await expect(separator).toHaveAttribute('aria-valuenow', '80')
		await expect(args.onChange).toHaveBeenLastCalledWith(80)
	},
}
