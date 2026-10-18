import { expect } from 'storybook/test'
import { docsFrame } from '@/stories/helpers'
import type meta from '../../BaseRoadmap.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const LayoutHorizontal: StoryObj<typeof meta> = {
	tags: ['!autodocs'],
	parameters: {
		docs: {
			...docsFrame(820),
			description: {
				story: [
					'Раскладка `horizontal` («Лента»): этапы слева направо в области с горизонтальной прокруткой, темы раскрытого этапа — столбцом',
					'под этапом. Высота растёт с самым большим раскрытым этапом.',
				].join('\n'),
			},
		},
	},
	args: { layout: 'horizontal', selected: null },
	play: async ({ canvas, canvasElement }) => {
		await expect(await canvas.findByRole('button', { name: /^Vue Router/ })).toBeVisible()
		await expect(canvasElement.querySelector('.base-roadmap__canvas--horizontal')).not.toBeNull()
	},
}
