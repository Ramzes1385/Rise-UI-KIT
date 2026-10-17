import type meta from '../../BaseFlowMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Disabled: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Отключённая карта: без выбора и правки.' } } },
	args: { isDisabled: true },
}
