import type meta from '../../BaseInplace.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseInplace from '../../../ui/BaseInplace.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<h2 style="margin: 0; font-size: 24px;"><BaseInplace v-bind="args" /></h2>
`

export const InHeading: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'В заголовке: шрифт наследуется от окружения.' },
			source: storySource({ template, imports: ['BaseInplace'], omit: [] }),
		},
	},
	render: args => ({
		components: { BaseInplace },
		setup: useStorySetup(args, { slots: [] }),
		template,
	}),
}
