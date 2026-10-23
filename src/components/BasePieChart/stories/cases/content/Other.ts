import { TRAFFIC } from '../../shared'
import { expect } from 'storybook/test'
import type meta from '../../BasePieChart.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Other: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Восемь источников трафика: после пятого части собираются в «Другое».' } } },
	args: { segments: TRAFFIC, label: 'визитов', formatValue: (value: number) => value.toLocaleString('ru-RU') },
	play: async ({ canvas }) => {
		await expect(canvas.getAllByRole('listitem')).toHaveLength(6)
		await expect(canvas.getByText('Другое')).toBeInTheDocument()
	},
}
