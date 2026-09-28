import type meta from '../BaseConfirm.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { screen, waitFor, expect, within } from 'storybook/test'

export const Danger: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Необратимое действие (`isDanger`): кнопка подтверждения цвета ошибки, фокус при открытии на «Отмене».',
					'Подпись кнопки называет действие («Удалить»), а не «ОК».',
				].join('\n'),
			},
		},
	},
	tags: ['!autodocs'],
	args: {
		isOpen: true,
		isDanger: true,
		title: 'Удалить проект «Сайт студии»?',
		description: 'Проект, 48 файлов и история правок удалятся без возможности восстановления.',
		confirmLabel: 'Удалить',
	},
	play: async () => {
		const dialog = await screen.findByRole('alertdialog', { name: 'Удалить проект «Сайт студии»?' })
		await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Отмена' })).toHaveFocus())
		const remove = within(dialog).getByRole('button', { name: 'Удалить' })
		const probe = document.createElement('span')
		probe.style.color = 'var(--rise-error)'
		dialog.append(probe)
		await expect(getComputedStyle(remove).backgroundColor).toBe(getComputedStyle(probe).color)
		probe.remove()
	},
}
