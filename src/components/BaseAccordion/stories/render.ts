import type { Meta } from '@storybook/vue3-vite'
import BaseAccordion from '../ui/BaseAccordion.vue'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const render = (args => ({
	components: { BaseAccordion },
	setup: () => ({ props: useArgsWithoutSlots(args) }),
	template: '<div class="story-medium"><BaseAccordion v-bind="props" /></div>',
})) satisfies Meta<typeof BaseAccordion>['render']
