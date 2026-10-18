import { expect } from 'storybook/test'
import { docsFrame } from '@/stories/helpers'
import type meta from '../../BaseRoadmap.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const LayoutSnake: StoryObj<typeof meta> = {
	tags: ['!autodocs'],
	parameters: {
		docs: {
			...docsFrame(900),
			description: {
				story: [
					'Раскладка `snake`: дорога рядами по три станции, ряды идут в разные стороны, поворот — плавная дуга. Цель — последняя станция,',
					'темы раскрытого этапа стоят столбцом под карточкой этапа, ряды раздвигаются.',
				].join('\n'),
			},
		},
	},
	args: { layout: 'snake', selected: null, narrowLayout: null },
	play: async ({ canvas, canvasElement }) => {
		await expect(await canvas.findByRole('button', { name: /^Vue Router/ })).toBeVisible()
		await expect(canvasElement.querySelector('.base-roadmap__canvas--snake')).not.toBeNull()
		await expect(canvas.getByText('Цель — Frontend-разработчик')).toBeVisible()
	},
}
