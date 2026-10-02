import type meta from '../../BaseChart.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Area: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Области (`variant="area"`): линии с полупрозрачной заливкой до нуля, поэтому шкала Y всегда включает ноль.',
			},
		},
	},
	args: { variant: 'area' },
}
