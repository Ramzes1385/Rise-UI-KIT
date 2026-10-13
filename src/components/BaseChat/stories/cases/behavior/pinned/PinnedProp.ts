import { expect, waitFor } from 'storybook/test'
import type meta from '../../../BaseChat.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { GROUP_CHAT, GROUP_MESSAGES } from '../../../shared'

const PANEL = /^Закреплённое сообщение/

export const PinnedProp: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Проп `pinnedMessages`: панель строится ровно из переданного списка, а не из `messages[].isPinned`. Нужен, когда закрепы',
					'приходят отдельно от загруженной части истории: в примере закреплённых сообщений нет среди `messages`. Открепление',
					'эмитит `unpin-message`, список обновляет приложение.',
				].join('\n'),
			},
		},
	},
	args: {
		...GROUP_CHAT,
		currentUserRole: 'admin',
		messages: GROUP_MESSAGES.slice(3),
		pinnedMessages: [GROUP_MESSAGES[0], GROUP_MESSAGES[2]],
	},
	play: async ({ canvas, userEvent, args }) => {
		await expect(canvas.getByRole('button', { name: PANEL })).toHaveAccessibleName(/\(2 из 2\)/)
		await expect(canvas.getByRole('button', { name: PANEL })).toHaveAccessibleName(/Смотрю\. Список задач релиза/)
		await userEvent.click(canvas.getByRole('button', { name: 'Предыдущее закреплённое сообщение' }))
		await waitFor(() => expect(canvas.getByRole('button', { name: PANEL })).toHaveAccessibleName(/\(1 из 2\)/))
		await userEvent.click(canvas.getByRole('button', { name: 'Открепить сообщение' }))
		await expect(args['onUnpin-message']).toHaveBeenCalledWith('g1')
	},
}
