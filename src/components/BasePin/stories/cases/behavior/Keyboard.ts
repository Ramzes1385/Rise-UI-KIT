import { expect } from 'storybook/test'
import { tabTo } from '@/stories/helpers'
import type meta from '../../BasePin.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Клавиатура: Tab ставит фокус в первую ячейку (видно кольцо), → и ← переходят между ячейками,',
					'Backspace в пустой ячейке стирает предыдущий символ и возвращает фокус назад.',
				].join('\n'),
			},
		},
	},
	tags: ['!autodocs'],
	args: { modelValue: '48' },
	play: async ({ canvas, userEvent }) => {
		const first = canvas.getByRole('textbox', { name: 'Символ 1 из 4' })
		const second = canvas.getByRole('textbox', { name: 'Символ 2 из 4' })
		const third = canvas.getByRole('textbox', { name: 'Символ 3 из 4' })
		await tabTo(first, userEvent)
		await expect(getComputedStyle(first).boxShadow).not.toBe('none')
		await userEvent.keyboard('{ArrowRight}{ArrowRight}')
		await expect(third).toHaveFocus()
		await userEvent.keyboard('{Backspace}')
		await expect(second).toHaveFocus()
		await expect(second).toHaveValue('')
		await userEvent.keyboard('{ArrowLeft}')
		await expect(first).toHaveFocus()
	},
}
