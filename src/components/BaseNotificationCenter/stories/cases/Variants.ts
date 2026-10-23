import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../BaseNotificationCenter.stories'
import { literal, storySource, useStorySetup } from '@/stories/helpers'
import BaseNotificationCenter from '../../ui/BaseNotificationCenter.vue'
import { NOTIFICATION_CENTER_VARIANTS } from '../../types/BaseNotificationCenter.types'

const variants = NOTIFICATION_CENTER_VARIANTS

const template = `
	<div class="story-row" style="align-items: flex-start">
		<div v-for="variant in variants" :key="variant" style="width: 380px">
			<BaseNotificationCenter v-bind="args" :variant="variant" :title="'Вариант ' + variant" />
		</div>
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Варианты: default — панель с рамкой, ghost — без рамки и отступов, для поповера и боковой панели.' },
			source: storySource({ template, imports: ['BaseNotificationCenter'], script: `const variants = ${literal(variants)}` }),
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseNotificationCenter },
		setup: useStorySetup(args, { data: { variants } }),
		template,
	}),
}
