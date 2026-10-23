import { expect } from 'storybook/test'
import type meta from '../../BaseMarkdown.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Safety: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'HTML из текста не исполняется и показывается как текст; ссылка `javascript:` остаётся текстом, картинка',
					'с опасной схемой — подписью. Так ответ модели или пользователя нельзя превратить в атаку на страницу.',
				].join('\n'),
			},
		},
	},
	args: {
		source: [
			'<img src=x onerror="alert(1)"> <script>alert(1)</script>',
			'',
			'[Нажми меня](javascript:alert(1)) и ![картинка](javascript:alert(1))',
			'',
			'Обычная ссылка: [пример](https://example.com)',
		].join('\n'),
	},
	play: async ({ canvas, canvasElement }) => {
		await expect(canvasElement.querySelector('script, [onerror]')).toBeNull()
		await expect(canvas.getByText(/<script>alert\(1\)<\/script>/)).toBeVisible()
		await expect(canvas.queryByRole('link', { name: 'Нажми меня' })).toBeNull()
		await expect(canvas.getByRole('link', { name: /пример/ })).toHaveAttribute('href', 'https://example.com')
	},
}
