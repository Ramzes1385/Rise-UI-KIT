import type meta from '../BaseRoadmap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const WithError: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Рендерер недоступен: вместо 3D показывается 2D-роадмап.' } } },
	args: {
		rendererFactory: () => {
			throw new Error('WebGL недоступен')
		},
	},
}
