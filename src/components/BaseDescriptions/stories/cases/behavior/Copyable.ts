import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseDescriptions.stories'

export const Copyable: StoryObj<typeof meta> = {
	args: {
		title: 'Банковские реквизиты',
		isCopyable: true,
		items: [
			{ key: 'bank', label: 'Банк', value: 'ПАО «Банк»', isCopyable: false },
			{ key: 'bik', label: 'БИК', value: '044525225' },
			{ key: 'account', label: 'Расчётный счёт', value: '4070 2810 1380 0000 0001', copyText: '40702810138000000001' },
			{ key: 'corr', label: 'Корр. счёт', value: '30101810400000000225' },
			{ key: 'comment', label: 'Комментарий', value: '' },
		],
	},
	parameters: {
		docs: {
			description: {
				story: [
					'`isCopyable` у списка — кнопка у каждого поля со значением; `isCopyable: false` у поля её убирает, у пустого',
					'значения её нет. `copyText` — текст для буфера: счёт показан группами, а копируется без пробелов.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas, userEvent, args }) => {
		await expect(canvas.getAllByRole('button')).toHaveLength(3)
		await expect(canvas.queryByRole('button', { name: 'Копировать: Банк' })).toBeNull()
		await userEvent.click(canvas.getByRole('button', { name: 'Копировать: Расчётный счёт' }))
		await waitFor(() => expect(canvas.getByRole('status')).not.toBeEmptyDOMElement())
		if (canvas.getByRole('status').textContent !== 'Скопировано: Расчётный счёт') return
		await expect(args.onCopy).toHaveBeenCalledWith(expect.objectContaining({ text: '40702810138000000001' }))
	},
}
