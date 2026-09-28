import { FRAME } from './shared'
import BaseFab from '../ui/BaseFab.vue'
import type { Meta } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const render = (args => ({
	components: { BaseFab },
	setup: () => ({ props: useArgsWithoutSlots(args, []), frame: FRAME }),
	template: '<div :style="frame"><BaseFab v-bind="props" /></div>',
})) satisfies Meta<typeof BaseFab>['render']
