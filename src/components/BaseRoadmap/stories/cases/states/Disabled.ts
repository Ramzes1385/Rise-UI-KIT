import type meta from '../../BaseRoadmap.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Disabled: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Отключённый роадмап: без отметок.' } } },
	args: { isDisabled: true },
}
