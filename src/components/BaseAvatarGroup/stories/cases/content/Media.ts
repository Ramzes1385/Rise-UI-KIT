import { expect } from 'storybook/test'
import { MEDIA_PEOPLE } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseAvatarGroup.stories'

export const Media: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Элементы группы бывают разными: фото, GIF (`src`), SVG-персонаж (`mascot`) и радужная обводка (`ring`) — как у BaseAvatar.',
					'Персонаж следит глазами за курсором; при `prefers-reduced-motion` обводка не переливается, а персонаж смотрит прямо.',
				].join('\n'),
			},
		},
	},
	args: { items: MEDIA_PEOPLE, max: 5, sizeScale: 150 },
	play: async ({ canvas, canvasElement }) => {
		await expect(canvas.getByText('Росток')).toBeInTheDocument()
		await expect(canvasElement.querySelector('.base-avatar__mascot')).toHaveAttribute('aria-hidden', 'true')
		await expect(canvasElement.querySelectorAll('.base-avatar--ring-gradient')).toHaveLength(2)
		await expect(canvas.getByText('и ещё 3')).toBeInTheDocument()
	},
}
