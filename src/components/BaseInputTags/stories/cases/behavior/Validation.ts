import { expect } from 'storybook/test'
import type meta from '../../BaseInputTags.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Validation: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Проверка и лимит: `validate` принимает только адреса с «@», `maxTags` — не больше трёх получателей.',
					'Отклонённый адрес остаётся в поле, чтобы его можно было исправить.',
				].join('\n'),
			},
		},
	},
	args: {
		label: 'Получатели',
		placeholder: 'name@example.com',
		modelValue: ['anna@example.com'],
		maxTags: 3,
		validate: (tag: string) => /^\S+@\S+\.\S+$/.test(tag),
	},
	play: async ({ canvas, userEvent, args }) => {
		const field = canvas.getByRole('textbox', { name: 'Получатели' })
		await userEvent.type(field, 'boris{Enter}')
		await expect(field).toHaveValue('boris')
		await userEvent.type(field, '@example.com{Enter}')
		await expect(args.onAdd).toHaveBeenLastCalledWith('boris@example.com')
	},
}
