import BaseChat from '../ui/BaseChat.vue'
import { useStoryMessages } from './shared'
import type { Meta } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const render = (args => ({
	components: { BaseChat },
	setup: () => ({ props: useArgsWithoutSlots(args, ['messages']), ...useStoryMessages(args) }),
	template: `
			<div class="story-medium">
				<BaseChat v-bind="props" :messages="messages" v-on="listeners" />
			</div>
		`,
})) satisfies Meta<typeof BaseChat>['render']
