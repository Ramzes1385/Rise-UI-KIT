import type meta from '../BaseInplace.stories'
import BaseInplace from '../../ui/BaseInplace.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const InHeading: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'В заголовке: шрифт наследуется от окружения.' } } },
	render: args => ({
		components: { BaseInplace },
		setup: () => ({ props: useArgsWithoutSlots(args, []) }),
		template: '<h2 style="margin: 0; font-size: 24px;"><BaseInplace v-bind="props" /></h2>',
	}),
}
