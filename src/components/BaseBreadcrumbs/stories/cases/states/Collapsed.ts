import { expect } from 'storybook/test'
import { tabTo } from '@/stories/helpers'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseBreadcrumbs.stories'

export const Collapsed: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'`maxItems` оставляет последние N крошек, остальные сворачиваются в «…». Кнопка «…» раскрывает весь путь и сворачивает его',
					'обратно: у неё имя «Показать ещё N разделов» и `aria-expanded`, фокус после нажатия остаётся на ней. Новые `items`',
					'снова сворачивают путь.',
				].join('\n'),
			},
		},
	},
	args: { maxItems: 2 },
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.queryByRole('link', { name: 'Каталог' })).toBeNull()
		const toggle = canvas.getByRole('button', { name: 'Показать ещё 3 раздела' })
		await expect(toggle).toHaveAttribute('aria-expanded', 'false')

		await tabTo(toggle, userEvent)
		await userEvent.keyboard('{Enter}')
		await expect(canvas.getByRole('link', { name: 'Каталог' })).toBeVisible()
		await expect(toggle).toHaveAttribute('aria-expanded', 'true')
		await expect(toggle).toHaveAccessibleName('Скрыть разделы')
		await expect(toggle).toHaveFocus()

		await userEvent.keyboard(' ')
		await expect(canvas.queryByRole('link', { name: 'Каталог' })).toBeNull()
		await expect(toggle).toHaveAttribute('aria-expanded', 'false')
	},
}
