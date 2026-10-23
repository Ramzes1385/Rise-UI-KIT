import type meta from '../../BaseEditor.stories'
import BaseEditor from '../../../ui/BaseEditor.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { within, expect, screen, waitFor } from 'storybook/test'
import { STORY_IMAGES, storySource, useStorySetup } from '@/stories/helpers'

function storyImageFile(): File {
	const svg = decodeURIComponent(STORY_IMAGES[0].src.split(',')[1])
	return new File([svg], 'mountains.svg', { type: 'image/svg+xml' })
}

const state = { html: '<p>Макеты главной страницы</p><p>Фото стенда: </p>' }

const template = `
	<BaseEditor v-bind="args" v-model="html" />
`

export const MediaAndLinks: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Ссылки и медиа. «Ссылка» открывает диалог с адресом и превращает выделение в ссылку (без выделения адрес ставится в конец текста); «Изображение»',
					'и «Видео» — кнопки, открывающие выбор файла: он вставляется в позицию каретки. Правый клик по изображению (или Shift+F10',
					'и кнопка «Размер и удаление медиа» для выделенного изображения) открывает меню размера:',
					'фокус переходит в поле «Ширина», Enter или «Применить» задают размер, «Удалить» убирает медиа, Escape закрывает меню.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseEditor'], state, omit: ['toolbar'] }),
		},
	},
	render: args => ({
		components: { BaseEditor },
		setup: useStorySetup(args, { state, slots: ['toolbar', 'modelValue'] }),
		template,
	}),
	args: { modelValue: state.html },
	play: async ({ canvas, canvasElement, userEvent }) => {
		const textbox = canvas.getByRole('textbox', { name: 'Текстовый редактор' })

		await userEvent.tripleClick(within(textbox).getByText('Макеты главной страницы'))
		await userEvent.click(canvas.getByRole('button', { name: 'Ссылка' }))
		const linkDialog = await screen.findByRole('dialog', { name: 'Ссылка' })
		await userEvent.type(within(linkDialog).getByLabelText('Адрес ссылки'), '/docs/design{Enter}')
		await expect(within(textbox).getByRole('link', { name: 'Макеты главной страницы' })).toHaveAttribute('href', '/docs/design')

		await userEvent.click(within(textbox).getByText('Фото стенда:'))
		await userEvent.upload(canvasElement.querySelector('input[accept="image/*"]') as HTMLInputElement, storyImageFile())
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
