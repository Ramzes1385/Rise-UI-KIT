import type meta from '../../BaseFlowMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const WithError: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Ошибка загрузки: вместо карты — сообщение.' } } },
	args: { error: 'Не удалось загрузить карту' },
}
