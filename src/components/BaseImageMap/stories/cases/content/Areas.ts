import { expect } from 'storybook/test'
import { IMAGE_MAP_AREAS } from '../../fixtures'
import type meta from '../../BaseImageMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Areas: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Области — `rect`, `ellipse`, `polygon` в долях картинки. Цвет — от группы, стиль по состояниям `base`, `hover`, `active` — именованный (`styles`, у группы «Отдых») или свой у объекта (каток).',
					'Цвета — токены: в тёмной теме области перекрашиваются сами.',
				].join('\n'),
			},
		},
	},
	args: { data: IMAGE_MAP_AREAS },
	play: async ({ canvas }) => {
		const pond = canvas.getByRole('button', { name: 'Пруд' })
		await expect(pond.tagName.toLowerCase()).toBe('ellipse')
		await expect(pond.style.getPropertyValue('--im-fill-opacity')).toBe('0.2')
		await expect(canvas.getByRole('button', { name: 'Учебный склон' }).tagName.toLowerCase()).toBe('polygon')
		await expect(canvas.getByRole('button', { name: 'Каток' }).style.getPropertyValue('--im-fill')).toBe('var(--rise-warning)')
	},
}
