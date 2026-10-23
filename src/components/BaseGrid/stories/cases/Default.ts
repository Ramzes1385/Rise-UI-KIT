import { expect } from 'storybook/test'
import type meta from '../BaseGrid.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Песочница: двенадцать колонок, шесть ячеек по `span` 4 в две строки. Меняйте `cols`, `gap` и `rowGap` в Controls.',
			},
		},
	},
	play: async ({ canvasElement }) => {
		const grid = canvasElement.querySelector('.base-grid') as HTMLElement
		await expect(getComputedStyle(grid).display).toBe('grid')
		await expect(getComputedStyle(grid).gridTemplateColumns.split(' ')).toHaveLength(12)
		const cells = [...grid.children].map(cell => cell.getBoundingClientRect())
		await expect(cells[1].top).toBe(cells[0].top)
		await expect(cells[2].top).toBe(cells[0].top)
		await expect(cells[3].top).toBeGreaterThan(cells[0].top)
		await expect(Math.round(cells[0].width)).toBe(Math.round(cells[1].width))
	},
}
