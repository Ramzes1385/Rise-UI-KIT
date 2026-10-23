import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseCheckboxGroup.stories'

export const SelectAll: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'«Выбрать все» (`hasSelectAll`): при части отмеченных вариантов флажок с чертой (indeterminate), клик отмечает все',
					'доступные варианты, повторный — снимает. Недоступные варианты он не трогает.',
				].join('\n'),
			},
		},
	},
	args: { hasSelectAll: true, isVertical: true },
	play: async ({ canvas, userEvent, args }) => {
		const selectAll = canvas.getByRole('checkbox', { name: 'Выбрать все' })
		await expect(selectAll).toBePartiallyChecked()
		await userEvent.click(selectAll)
		await expect(args.onChange).toHaveBeenLastCalledWith(['email', 'push', 'telegram'])
		await expect(selectAll).toBeChecked()
		await userEvent.click(selectAll)
		await expect(args.onChange).toHaveBeenLastCalledWith([])
		await expect(selectAll).not.toBeChecked()
	},
}
