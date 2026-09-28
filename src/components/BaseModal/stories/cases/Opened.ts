import type meta from '../BaseModal.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { screen, waitFor, expect, within } from 'storybook/test'

export const Opened: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Открытое окно поверх страницы: шапка с заголовком и кнопкой «Закрыть», тело, подвал с действиями',
					'(главное — последним). Фокус сразу переходит в окно — на кнопку «Закрыть».',
				].join('\n'),
			},
		},
	},
	tags: ['!autodocs'],
	args: { isOpen: true },
	play: async () => {
		const dialog = await screen.findByRole('dialog', { name: 'Удалить проект?' })
		await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Закрыть' })).toHaveFocus())
		await expect(document.body.style.overflow).toBe('hidden')
	},
}
