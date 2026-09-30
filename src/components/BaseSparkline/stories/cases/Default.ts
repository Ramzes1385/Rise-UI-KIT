import { expect } from 'storybook/test'
import type meta from '../BaseSparkline.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSparkline from '../../ui/BaseSparkline.vue'

export const Default: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Выручка по месяцам: наведите на график — появится значение месяца.' } } },
	render: args => ({
		components: { BaseSparkline },
		setup: () => ({ args }),
		template: '<div style="max-width: 240px; padding-top: 40px"><BaseSparkline v-bind="args" /></div>',
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('img', { name: 'Выручка за год, тыс. ₽: от 176 до 305, последнее значение 305' })).toBeInTheDocument()
	},
}
