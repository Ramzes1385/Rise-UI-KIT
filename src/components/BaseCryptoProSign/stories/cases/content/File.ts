import { textFile } from '../../shared'
import { tabTo } from '@/stories/helpers'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseCryptoProSign.stories'

export const File: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Без `data` документ выбирает пользователь: поле «Документ» (BaseFileUpload). Имя подписи — по имени файла:',
					'`act.txt` → `act.txt.sig`. Пока файла нет, «Подписать» недоступна.',
				].join('\n'),
			},
		},
	},
	args: { data: undefined, fileName: '' },
	play: async ({ canvas, userEvent, args }) => {
		const input = await canvas.findByLabelText('Документ')
		const button = canvas.getByRole('button', { name: 'Подписать' })
		await expect(button).toBeDisabled()

		await userEvent.upload(input, textFile('act.txt', 2048))
		await waitFor(() => expect(button).toBeEnabled())
		await tabTo(button, userEvent)
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(args.onSigned).toHaveBeenCalledWith(expect.objectContaining({ fileName: 'act.txt', isHash: false })))
		await waitFor(() => expect(canvas.getAllByText('Подпись создана: act.txt.sig')[0]).toBeVisible())
	},
}
