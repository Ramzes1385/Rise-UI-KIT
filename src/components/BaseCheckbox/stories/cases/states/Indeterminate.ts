import { expect } from 'storybook/test'
import type meta from '../../BaseCheckbox.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Indeterminate: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Частичный выбор (`isIndeterminate`): флажок с чертой — например, «Выбрать все», когда выбрана часть. Скринридер',
					'слышит «частично отмечен»; клик отмечает флажок, а снять частичный выбор должен родитель. Группу с таким флажком',
					'собирает `BaseCheckboxGroup` (`hasSelectAll`).',
				].join('\n'),
			},
		},
	},
	args: { label: 'Все уведомления', isIndeterminate: true },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('checkbox', { name: 'Все уведомления' })).toBePartiallyChecked()
	},
}
