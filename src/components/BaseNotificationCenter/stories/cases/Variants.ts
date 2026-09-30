import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import type meta from '../BaseNotificationCenter.stories'
import BaseNotificationCenter from '../../ui/BaseNotificationCenter.vue'
import { NOTIFICATION_CENTER_VARIANTS } from '../../types/BaseNotificationCenter.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Варианты: default — панель с рамкой, ghost — без рамки и отступов, для поповера и боковой панели.' },
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseNotificationCenter },
		setup: () => ({ props: useArgsWithoutSlots(args), variants: NOTIFICATION_CENTER_VARIANTS }),
		template: `
			<div class="story-row" style="align-items: flex-start">
				<div v-for="variant in variants" :key="variant" style="width: 380px">
					<BaseNotificationCenter v-bind="props" :variant="variant" :title="'Вариант ' + variant" />
				</div>
			</div>
		`,
	}),
}
