import type meta from '../BaseRoadmap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Empty: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'В данных нет этапов.' } } },
	args: { data: { version: 1, title: 'Пусто', stages: [] }, progress: { version: 1, topics: {} } },
}
