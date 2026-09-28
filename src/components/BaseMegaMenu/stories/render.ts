import type { Meta } from '@storybook/vue3-vite'
import BaseMegaMenu from '../ui/BaseMegaMenu.vue'
import { useArgsWithoutSlots } from '@/stories/helpers'

const DROPDOWN_FRAME = '<div style="min-height: 320px;">'

export const render = (args => ({
	components: { BaseMegaMenu },
	setup: () => ({ props: useArgsWithoutSlots(args, ['column-title', 'nav-item', 'item']) }),
	template: `${DROPDOWN_FRAME}<BaseMegaMenu v-bind="props" /></div>`,
})) satisfies Meta<typeof BaseMegaMenu>['render']
