import { tabTo } from '@/stories/helpers'
import { expect, waitFor } from 'storybook/test'
import { ATTACHED_SIGNATURE } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseCryptoProSign.stories'

export const Verify: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'`mode="verify"` — проверка подписи. Подпись — проп `signature` (Base64) или файл в поле «Файл подписи»',
					'(`.sig`, `.p7s`: DER, Base64 или PEM). Для отсоединённой подписи нужен и документ — `data` или поле «Подписанный документ».',
					'Здесь присоединённая подпись, созданная эмуляцией заранее: итог «Подпись верна», подписант, время подписи и срок сертификата.',
				].join('\n'),
			},
		},
	},
	args: { mode: 'verify', signature: ATTACHED_SIGNATURE, data: undefined, fileName: '' },
	play: async ({ canvas, userEvent, args }) => {
		await expect(canvas.getByRole('region', { name: 'Проверка электронной подписи' })).toBeVisible()
		await expect(await canvas.findByText('Подпись для проверки получена')).toBeVisible()
		const button = canvas.getByRole('button', { name: 'Проверить подпись' })
		await tabTo(button, userEvent)
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(args.onVerified).toHaveBeenCalledWith(expect.objectContaining({ isValid: true, isDetached: false })))
		await waitFor(() => expect(canvas.getAllByText('Подпись верна')[0]).toBeVisible())
		await waitFor(() => expect(canvas.getByText('Иванов Иван Иванович')).toBeVisible())
		await expect(args.onError).not.toHaveBeenCalled()
	},
}
