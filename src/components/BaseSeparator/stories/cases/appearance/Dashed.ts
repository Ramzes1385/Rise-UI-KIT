import type meta from '../../BaseSeparator.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSeparator from '../../../ui/BaseSeparator.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-stack">
		<BaseSeparator v-bind="args" />
		<BaseSeparator v-bind="args" label="Необязательные поля" />
	</div>
`

export const Dashed: StoryObj<typeof meta> = {
	args: { isDashed: true },
	parameters: {
		docs: {
			description: { story: 'Пунктир (`isDashed`) — для второстепенных границ: «ниже — необязательные поля», черновые разделы.' },
			source: storySource({ template, imports: ['BaseSeparator'], omit: ['default', 'label'] }),
		},
		controls: { include: ['thickness', 'color', 'sizeScale'] },
	},
	render: args => ({
		components: { BaseSeparator },
		setup: useStorySetup(args, { slots: ['default', 'label'] }),
		template,
	}),
}
