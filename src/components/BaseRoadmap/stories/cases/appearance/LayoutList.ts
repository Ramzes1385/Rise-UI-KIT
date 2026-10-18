import { expect } from 'storybook/test'
import { docsFrame } from '@/stories/helpers'
import type meta from '../../BaseRoadmap.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const LayoutList: StoryObj<typeof meta> = {
	tags: ['!autodocs'],
	parameters: {
		docs: {
			...docsFrame(900),
			description: {
				story: [
					'Раскладка `list`: этапы аккордеоном, темы — строками внутри раскрытого этапа. Закрытый этап «Продакшн» не раскрывается и',
					'подписан «Откроется после «Качество»». Эту раскладку компонент выбирает в узком контейнере.',
				].join('\n'),
			},
		},
	},
	args: { layout: 'list', selected: null },
	play: async ({ canvas, canvasElement }) => {
		await expect(await canvas.findByRole('button', { name: /^Vue Router/ })).toBeVisible()
		await expect(canvasElement.querySelector('.base-roadmap__list')).not.toBeNull()
		await expect(canvas.getByRole('button', { name: /Продакшн/ })).toHaveAttribute('aria-disabled', 'true')
		await expect(canvas.getByText('Откроется после «Качество»')).toBeVisible()
	},
}
