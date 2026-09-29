import type meta from '../../BaseImage.stories'
import { waitFor, expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import { STORY_WAIT_TIMEOUT } from '@/stories/helpers'
import { VALLEY, expectImagesVisible } from '../../shared'

export const Fallback: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Резервное изображение: если `src` не загрузился, показывается `fallbackSrc` — ошибка не выводится.' },
		},
	},
	args: { src: 'Битая ссылка', fallbackSrc: VALLEY.src, alt: 'Обложка статьи' },
	play: async ({ canvas, canvasElement, args }) => {
		const image = canvas.getByRole('img', { name: 'Обложка статьи' }) as HTMLImageElement
		await waitFor(() => expect(image.getAttribute('src')).toBe(VALLEY.src), { timeout: STORY_WAIT_TIMEOUT })
		await expectImagesVisible(canvasElement, 1)
		await expect(args.onError).not.toHaveBeenCalled()
	},
}
