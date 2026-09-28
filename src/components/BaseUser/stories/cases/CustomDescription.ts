import { expect } from 'storybook/test'
import type meta from '../BaseUser.stories'
import BaseUser from '../../ui/BaseUser.vue'
import { BaseBadge } from '@components/BaseBadge'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const CustomDescription: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Своя подпись: слот `description` — роль бейджем.' } } },
	render: args => ({
		components: { BaseUser, BaseBadge },
		setup: () => ({ props: useArgsWithoutSlots(args, ['description']) }),
		template:
			'<BaseUser v-bind="props"><template #description><BaseBadge variant="soft" label="Администратор" /></template></BaseUser>',
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByText('Администратор')).toBeVisible()
	},
}
