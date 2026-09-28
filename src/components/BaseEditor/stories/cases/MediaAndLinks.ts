import type meta from '../BaseEditor.stories'
import { renderWithLocalModel } from '../shared'
import { STORY_IMAGES } from '@/stories/helpers'
import type { StoryObj } from '@storybook/vue3-vite'
import { spyOn, within, expect, screen, waitFor } from 'storybook/test'

function storyImageFile(): File {
	const svg = decodeURIComponent(STORY_IMAGES[0].src.split(',')[1])
	return new File([svg], 'mountains.svg', { type: 'image/svg+xml' })
}

export const MediaAndLinks: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Ссылки и медиа. «Ссылка» спрашивает адрес (`window.prompt`) и превращает выделение в ссылку; «Изображение»',
					'и «Видео» вставляют выбранный файл в позицию каретки. Правый клик по изображению открывает меню размера:',
					'фокус переходит в поле «Ширина», Enter или «Применить» задают размер, «Удалить» убирает медиа, Escape закрывает меню.',
				].join('\n'),
			},
		},
	},
	render: renderWithLocalModel,
	args: { modelValue: '<p>Макеты главной страницы</p><p>Фото стенда: </p>' },
	play: async ({ canvas, userEvent }) => {
		const textbox = canvas.getByRole('textbox', { name: 'Текстовый редактор' })

		spyOn(window, 'prompt').mockReturnValue('/docs/design')
		await userEvent.tripleClick(within(textbox).getByText('Макеты главной страницы'))
		await userEvent.click(canvas.getByRole('button', { name: 'Ссылка' }))
		await expect(within(textbox).getByRole('link', { name: 'Макеты главной страницы' })).toHaveAttribute('href', '/docs/design')

		await userEvent.click(within(textbox).getByText('Фото стенда:'))
		await userEvent.upload(canvas.getByLabelText('Изображение'), storyImageFile())
		const image = textbox.querySelector('img') as HTMLImageElement
		await expect(image).toHaveAttribute('alt', '')

		await userEvent.pointer({ keys: '[MouseRight]', target: image })
		const menu = await screen.findByRole('dialog', { name: 'Размер медиа' })
		const width = within(menu).getByLabelText('Ширина')
		await waitFor(() => expect(width).toHaveFocus())
		await userEvent.clear(width)
		await userEvent.type(width, '240')
		const height = within(menu).getByLabelText('Высота')
		await userEvent.clear(height)
		await userEvent.type(height, '150{Enter}')
		await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Размер медиа' })).toBeNull())
		await expect(image.style.width).toBe('240px')
		await expect(image.style.height).toBe('150px')
	},
}
