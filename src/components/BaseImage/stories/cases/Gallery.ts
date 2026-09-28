import type meta from '../BaseImage.stories'
import BaseImage from '../../ui/BaseImage.vue'
import { screen, expect } from 'storybook/test'
import { GALLERY, GALLERY_SRCS } from '../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const Gallery: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['fit', 'borderRadius', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Галерея: у каждого изображения тот же `gallery` — просмотр открывается на выбранном снимке, стрелки, миниатюры',
					'и клавиши ← → листают галерею, счётчик показывает позицию. Пример оставляет просмотр открытым на третьем снимке.',
				].join('\n'),
			},
			source: {
				code: [
					'<BaseImage',
					'  v-for="photo in photos"',
					'  :key="photo.src"',
					'  :src="photo.src"',
					'  :alt="photo.alt"',
					'  :gallery="photos.map(p => p.src)"',
					'  :zoom-config="{ hasZoom: true }"',
					'  :width="140"',
					'  :height="96" />',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseImage },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['src', 'alt', 'width', 'height', 'gallery', 'zoomConfig']),
			photos: GALLERY,
			gallery: GALLERY_SRCS,
		}),
		template: `
			<div class="story-row">
				<BaseImage
					v-for="photo in photos"
					:key="photo.src"
					v-bind="props"
					:src="photo.src"
					:alt="photo.alt"
					:gallery="gallery"
					:zoom-config="{ hasZoom: true }"
					:width="140"
					:height="96" />
			</div>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Горы в тумане' }))
		const dialog = await screen.findByRole('dialog', { name: 'Просмотр изображения: Горы в тумане' })
		await expect(dialog).toHaveTextContent('2 / 5')

		await userEvent.keyboard('{ArrowRight}')
		await expect(dialog).toHaveTextContent('3 / 5')
		await expect(screen.getByRole('button', { name: 'Изображение 3 из 5' })).toHaveAttribute('aria-current', 'true')

		await userEvent.click(screen.getByRole('button', { name: 'Изображение 1 из 5' }))
		await expect(dialog).toHaveTextContent('1 / 5')
		await expect(screen.queryByRole('button', { name: 'Предыдущее изображение' })).not.toBeInTheDocument()

		await userEvent.click(screen.getByRole('button', { name: 'Следующее изображение' }))
		await userEvent.click(screen.getByRole('button', { name: 'Следующее изображение' }))
		await expect(dialog).toHaveTextContent('3 / 5')
	},
}
