import type meta from '../../BaseFlowMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Loading: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Загрузка данных: вместо карты — скелетон.' } } },
	args: { isLoading: true },
}
