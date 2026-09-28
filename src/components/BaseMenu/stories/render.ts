import BaseMenu from '../ui/BaseMenu.vue'
import type { Meta } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const render = (args => ({
	components: { BaseMenu },
	setup: () => ({ props: useArgsWithoutSlots(args) }),
	template: '<div style="width: 240px;"><BaseMenu v-bind="props" /></div>',
})) satisfies Meta<typeof BaseMenu>['render']
