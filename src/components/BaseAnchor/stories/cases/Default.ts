import type meta from '../BaseAnchor.stories'
import { waitFor, expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Оглавление по заголовкам `h2` и `h3` прокручиваемого блока. Прокрутите текст вниз и вверх — подсветка следует за разделом, в конце прокрутки текущий — последний раздел; клик переносит к разделу и фокус на его заголовок.',
			},
		},
	},
	play: async ({ canvas, userEvent }) => {
		const nav = canvas.getByRole('navigation', { name: 'Содержание' })
		await expect(canvas.getByRole('link', { name: 'Введение' })).toHaveAttribute('aria-current', 'location')
		const install = canvas.getByRole('link', { name: 'Установка' })
		await userEvent.click(install)
		await expect(install).toHaveAttribute('aria-current', 'location')
		await waitFor(() => expect(canvas.getByRole('heading', { name: 'Установка' })).toHaveFocus())
		const box = canvas.getByRole('region', { name: 'Руководство' })
		await waitFor(() => expect(box.scrollTop).toBeGreaterThan(0))
		box.scrollTop = box.scrollHeight
		await waitFor(() => expect(canvas.getByRole('link', { name: 'Вопросы и ответы' })).toHaveAttribute('aria-current', 'location'))
		await expect(nav.querySelectorAll('[aria-current]')).toHaveLength(1)
		const theme = canvas.getByRole('heading', { name: 'Настройка темы' })
		box.scrollTop += theme.getBoundingClientRect().top - box.getBoundingClientRect().top - 3
		await waitFor(() => expect(canvas.getByRole('link', { name: 'Настройка темы' })).toHaveAttribute('aria-current', 'location'))
		for (let step = 0; step < 3; step++) {
			box.scrollTop -= 10
			await new Promise(resolve => setTimeout(resolve, 120))
		}
		await waitFor(() => expect(canvas.getByRole('link', { name: 'Без сборщика' })).toHaveAttribute('aria-current', 'location'))
		await expect(nav.querySelectorAll('[aria-current]')).toHaveLength(1)
	},
}
