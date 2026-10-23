import { expect } from 'storybook/test'
import type meta from '../BaseCode.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Песочница: меняйте код, язык и настройки в панели Controls.' } } },
	play: async ({ canvas, canvasElement }) => {
		await expect(canvas.getByText('TypeScript')).toBeVisible()
		await expect(canvas.getByRole('button', { name: /^Копировать код/ })).toBeVisible()
		await expect(canvasElement.querySelectorAll('.base-code__line')).toHaveLength(9)
		await expect(canvasElement.querySelector('.base-code__token--keyword')).toHaveTextContent('import')
	},
}
