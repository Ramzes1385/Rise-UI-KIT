import { expect } from 'storybook/test'
import type meta from '../BaseHeatmap.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Коммиты за год до 15 мая 2025: наведите на день — под календарём появятся число и дата.' } },
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('img', { name: /^Коммиты за год: всего/ })).toBeInTheDocument()
	},
}
