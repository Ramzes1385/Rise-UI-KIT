import { tabTo } from '@/stories/helpers'
import type meta from '../../BaseCode.stories'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'

export const Copy: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'«Копировать» — с мыши и с клавиатуры (Tab, Enter). Результат объявляется скринридеру в `role="status"`:',
					'«Код скопирован в буфер обмена» или «Не удалось скопировать код», если браузер не дал доступа к буферу обмена.',
					'Событие `copy` — `{ code, success }`; номера строк в копию не попадают.',
				].join('\n'),
			},
		},
	},
	tags: ['!autodocs'],
	args: { code: 'npm run build', language: 'bash' },
	play: async ({ canvas, args, userEvent }) => {
		const button = canvas.getByRole('button', { name: 'Копировать' })
		await tabTo(button, userEvent)
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(args.onCopy).toHaveBeenCalledWith(expect.objectContaining({ code: 'npm run build' })))
		await waitFor(() =>
			expect(canvas.getByRole('status')).toHaveTextContent(/Код скопирован в буфер обмена|Не удалось скопировать код/),
		)
	},
}
