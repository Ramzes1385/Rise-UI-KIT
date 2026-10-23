import type meta from '../../BaseRoadmap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor } from 'storybook/test'
import { tabTo, STORY_WAIT_TIMEOUT } from '@/stories/helpers'

export const Keyboard: StoryObj<typeof meta> = {
	tags: ['!autodocs'],
	parameters: {
		docs: {
			description: {
				story: [
					'Клавиатура: Tab идёт по порядку DOM — кнопка этапа (`aria-expanded`), темы этапа, затем панель темы. Enter и пробел на этапе',
					'раскрывают и сворачивают его, Enter на теме открывает панель, пробел на флажке подтемы отмечает её, Escape закрывает боковую',
					'панель и возвращает фокус на тему. Фокус виден кольцом, статус темы озвучивается в `aria-live`.',
				].join('\n'),
			},
		},
	},
	args: { selected: null },
	play: async ({ canvas, userEvent }) => {
		const stage = await canvas.findByRole('button', { name: /Vue 3/ })
		await tabTo(stage, userEvent, 40)
		await expect(getComputedStyle(stage).outlineStyle).toBe('solid')
		await expect(stage).toHaveAttribute('aria-expanded', 'true')
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(stage).toHaveAttribute('aria-expanded', 'false'))
		await userEvent.keyboard(' ')
		await waitFor(() => expect(stage).toHaveAttribute('aria-expanded', 'true'))

		const pinia = await canvas.findByRole('button', { name: /^Pinia/ })
		await tabTo(pinia, userEvent, 10)
		await userEvent.keyboard('{Enter}')
		await expect(pinia).toHaveAttribute('aria-pressed', 'true')
		await waitFor(() => expect(screen.getByRole('heading', { level: 2, name: 'Pinia' })).toBeVisible(), { timeout: STORY_WAIT_TIMEOUT })

		const subtopic = await screen.findByRole('checkbox', { name: 'Геттеры и действия' })
		await tabTo(subtopic, userEvent, 20)
		await userEvent.keyboard(' ')
		await waitFor(() => expect(subtopic).toBeChecked())
		await waitFor(() => expect(screen.getByText('2 из 3 подтем')).toBeVisible(), { timeout: STORY_WAIT_TIMEOUT })

		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('heading', { level: 2, name: 'Pinia' })).toBeNull())
		await waitFor(() => expect(pinia).toHaveFocus())
	},
}
