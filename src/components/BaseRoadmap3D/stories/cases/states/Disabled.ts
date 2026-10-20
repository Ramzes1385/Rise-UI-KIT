import type meta from '../../BaseRoadmap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Disabled: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Отключённый роадмап не реагирует на ввод.' } } },
	args: { isDisabled: true },
}
