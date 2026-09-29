import type meta from '../../BaseSeparator.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseSeparator from '../../../ui/BaseSeparator.vue'

export const Dashed: StoryObj<typeof meta> = {
	args: { isDashed: true },
	parameters: {
		docs: {
			description: { story: 'Пунктир (`isDashed`) — для второстепенных границ: «ниже — необязательные поля», черновые разделы.' },
		},
		controls: { include: ['thickness', 'color', 'sizeScale'] },
	},
	render: args => ({
		components: { BaseSeparator },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'label']) }),
		template: `
			<div class="story-stack">
				<BaseSeparator v-bind="props" />
				<BaseSeparator v-bind="props" label="Необязательные поля" />
			</div>
		`,
	}),
}
