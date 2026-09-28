import type { Meta } from '@storybook/vue3-vite'
import BaseTimeline from '../ui/BaseTimeline.vue'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const render = (args => ({
	components: { BaseTimeline },
	setup: () => ({ props: useArgsWithoutSlots(args, []) }),
	template: '<div class="story-narrow"><BaseTimeline v-bind="props" /></div>',
})) satisfies Meta<typeof BaseTimeline>['render']
