import { expect } from 'storybook/test'
import type meta from '../BaseUser.stories'
import BaseUser from '../../ui/BaseUser.vue'
import { BaseBadge } from '@components/BaseBadge'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseUser v-bind="args"><template #description><BaseBadge variant="soft" label="Администратор" /></template></BaseUser>
`

export const CustomDescription: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Своя подпись: слот `description` — роль бейджем.' },
			source: storySource({ template, imports: ['BaseUser', 'BaseBadge'], omit: ['description'] }),
		},
	},
	render: args => ({
		components: { BaseUser, BaseBadge },
		setup: useStorySetup(args, { slots: ['description'] }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByText('Администратор')).toBeVisible()
	},
}
