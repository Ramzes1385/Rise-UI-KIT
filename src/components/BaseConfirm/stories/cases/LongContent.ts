import type meta from '../BaseConfirm.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { screen, expect, within } from 'storybook/test'

export const LongContent: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Длинный вопрос и пояснение переносятся по словам: окно не шире 400px, кнопки остаются в подвале.' },
		},
	},
	tags: ['!autodocs'],
	args: {
		isOpen: true,
		isDanger: true,
		title: 'Отозвать доступ у всех участников проекта «Документальный сериал о реставрации усадьбы»?',
		description:
			'Двенадцать участников потеряют доступ к таймлайну, субтитрам и комментариям. Незавершённые правки в их черновиках ' +
			'не сохранятся, а ссылки-приглашения перестанут работать. Вернуть доступ можно будет только новыми приглашениями.',
		confirmLabel: 'Отозвать доступ',
		cancelLabel: 'Оставить как есть',
	},
	play: async () => {
		const dialog = await screen.findByRole('alertdialog')
		await expect(dialog.getBoundingClientRect().width).toBeLessThanOrEqual(400)
		const confirm = within(dialog).getByRole('button', { name: 'Отозвать доступ' })
		await expect(confirm.getBoundingClientRect().right).toBeLessThanOrEqual(dialog.getBoundingClientRect().right)
		await expect(confirm.getBoundingClientRect().bottom).toBeLessThanOrEqual(window.innerHeight)
	},
}
