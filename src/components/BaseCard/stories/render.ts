import BaseCard from '../ui/BaseCard.vue'
import type { Meta } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const render = (args => ({
	components: { BaseCard },
	setup: () => ({ props: useArgsWithoutSlots(args), args }),
	template: '<div class="story-medium"><BaseCard v-bind="props">{{ args.default }}</BaseCard></div>',
})) satisfies Meta<typeof BaseCard>['render']
