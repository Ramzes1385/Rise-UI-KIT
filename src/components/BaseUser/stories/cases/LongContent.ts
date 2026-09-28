import { expect } from 'storybook/test'
import type meta from '../BaseUser.stories'
import BaseUser from '../../ui/BaseUser.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const LongContent: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Длинные имя и подпись обрезаются многоточием по ширине контейнера.' } } },
	args: { name: 'Екатерина Александровна Константинопольская', description: 'Руководитель направления клиентского сервиса' },
	render: args => ({
		components: { BaseUser },
		setup: () => ({ props: useArgsWithoutSlots(args, []) }),
		template: '<div style="width: 220px;"><BaseUser v-bind="props" style="width: 100%;" /></div>',
	}),
	play: async ({ canvasElement }) => {
		const name = canvasElement.querySelector('.base-user__name') as HTMLElement
		await expect(name.scrollWidth).toBeGreaterThan(name.clientWidth)
	},
}
