import type meta from '../BaseChart.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Empty: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Нет рядов или подписей — «Нет данных» или слот `empty`.' } } },
	args: { series: [], labels: [] },
}
