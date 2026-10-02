import { tabTo } from '@/stories/helpers'
import { expect, waitFor } from 'storybook/test'
import type meta from '../BaseCryptoProSign.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { CHANGED_TEXT, DETACHED_SIGNATURE } from '../shared'

export const VerifyInvalid: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Отсоединённая подпись к изменённому документу: номер акта в `data` не тот, что подписан. Итог «Подпись не прошла проверку»',
					'с текстом плагина; событие `verified` с `isValid: false`, а не `error` — ошибка только у окружения (нет плагина).',
				].join('\n'),
			},
		},
	},
	args: { mode: 'verify', signature: DETACHED_SIGNATURE, data: CHANGED_TEXT, fileName: '' },
	play: async ({ canvas, userEvent, args }) => {
		const button = await canvas.findByRole('button', { name: 'Проверить подпись' })
		await tabTo(button, userEvent)
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(args.onVerified).toHaveBeenCalledWith(expect.objectContaining({ isValid: false, isDetached: true })))
		await expect(canvas.getAllByText('Подпись не прошла проверку')[0]).toBeVisible()
		await expect(canvas.getByText(/0x80091007/)).toBeVisible()
		await expect(args.onError).not.toHaveBeenCalled()
	},
}
