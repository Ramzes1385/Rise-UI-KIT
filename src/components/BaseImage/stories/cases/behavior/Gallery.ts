import { GALLERY } from '../../shared'
import type meta from '../../BaseImage.stories'
import { screen, expect } from 'storybook/test'
import BaseImage from '../../../ui/BaseImage.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const photos = GALLERY

const template = `
	<div class="story-row">
		<BaseImage
			v-for="photo in photos"
			:key="photo.src"
			v-bind="args"
			:src="photo.src"
			:alt="photo.alt"
			:gallery="photos"
			:zoom-config="{ hasZoom: true }"
			:width="140"
			:height="96" />
	</div>
`

export const Gallery: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['fit', 'borderRadius', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Галерея: у каждого изображения тот же `gallery` — просмотр открывается на выбранном снимке, стрелки, миниатюры',
					'и клавиши ← → листают галерею, счётчик показывает позицию. Элементы `gallery` — `{ src, alt }`: имя окна',
					'просмотра меняется при листании («Просмотр изображения: Долина, изображение 3 из 5»), скринридер слышит снимок.',
					'Пример оставляет просмотр открытым на третьем снимке.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseImage'],
				script: `const photos = ${literal(photos)}`,
				omit: ['src', 'alt', 'width', 'height', 'gallery', 'zoomConfig'],
			}),
		},
	},
	render: args => ({
		components: { BaseImage },
		setup: useStorySetup(args, { data: { photos }, slots: ['src', 'alt', 'width', 'height', 'gallery', 'zoomConfig'] }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const fog = photos[1]!
		const third = photos[2]!
		await userEvent.click(canvas.getByRole('button', { name: fog.alt }))
		const dialog = await screen.findByRole('dialog', { name: `Просмотр изображения: ${fog.alt}, изображение 2 из 5` })
		await expect(dialog).toHaveTextContent('2 / 5')

		await userEvent.keyboard('{ArrowRight}')
		await expect(dialog).toHaveTextContent('3 / 5')
		await expect(dialog).toHaveAccessibleName(`Просмотр изображения: ${third.alt}, изображение 3 из 5`)
		await expect(screen.getByRole('button', { name: 'Изображение 3 из 5' })).toHaveAttribute('aria-current', 'true')

		await userEvent.click(screen.getByRole('button', { name: 'Изображение 1 из 5' }))
		await expect(dialog).toHaveTextContent('1 / 5')
		await expect(screen.queryByRole('button', { name: 'Предыдущее изображение' })).not.toBeInTheDocument()

		await userEvent.click(screen.getByRole('button', { name: 'Следующее изображение' }))
		await userEvent.click(screen.getByRole('button', { name: 'Следующее изображение' }))
		await expect(dialog).toHaveTextContent('3 / 5')
	},
}
