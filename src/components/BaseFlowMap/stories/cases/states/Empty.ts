import type meta from '../../BaseFlowMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Empty: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Карта без узлов: пустое состояние.' } } },
	args: { data: { version: 1, nodes: [], edges: [] } },
}
