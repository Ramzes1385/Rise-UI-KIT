import { docsFrame } from '../../shared'
import type meta from '../../BaseTour.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { screen, within, waitFor, expect } from 'storybook/test'

export const NoTarget: StoryObj<typeof meta> = {
	args: {
		isOpen: true,
		steps: [
			{ title: 'Добро пожаловать', content: 'Шаг без цели: карточка по центру экрана, фон затемнён целиком.' },
			{ target: '#tour-missing', title: 'Цели нет', content: 'Элемента нет на странице — тур не ломается, карточка тоже по центру.' },
		],
	},
	parameters: {
		docs: {
			...docsFrame(320),
			description: {
				story: [
					'Шаг без `target`, с неверным селектором или с целью, которой нет на странице, — карточка по центру экрана.',
					'Появится цель позже — тур сразу подсветит её; исчезнет — карточка вернётся в центр.',
				].join('\n'),
			},
		},
	},
	play: async ({ userEvent }) => {
		const dialog = await screen.findByRole('dialog', { name: 'Добро пожаловать' })
		const next = await within(dialog).findByRole('button', { name: 'Далее' })
		await waitFor(() => expect(next).toHaveFocus())
		await expect(dialog).toHaveAccessibleDescription('Шаг без цели: карточка по центру экрана, фон затемнён целиком.')

		await userEvent.keyboard('{Enter}')
		await expect(await screen.findByRole('dialog', { name: 'Цели нет' })).toBeInTheDocument()
		await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Шаг 2 из 2: Цели нет'))
	},
}
