import type meta from '../BaseRoadmap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Loading: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Данные загружаются.' } } },
	args: { isLoading: true },
}
