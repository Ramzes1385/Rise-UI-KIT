import { tabTo } from '@/stories/helpers'
import { IMAGE_MAP_LONG } from '../../fixtures'
import { expect, screen } from 'storybook/test'
import type meta from '../../BaseImageMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const LongContent: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Длинные название, подпись, описание с переносами строк и ссылки: подсказка ограничена по ширине и переносит текст, подпись точки обрезается многоточием, подсказка прокручивается.',
			},
		},
	},
	args: { data: IMAGE_MAP_LONG },
	play: async ({ canvas, userEvent }) => {
		const trail = canvas.getByRole('button', { name: /Экологическая тропа/ })
		await tabTo(trail, userEvent)
		await expect(await screen.findByText(/Протяжённость маршрута/)).toBeVisible()
		await expect(screen.getByRole('link', { name: 'Прогноз погоды' })).toHaveAttribute('href', '#weather')
	},
}
