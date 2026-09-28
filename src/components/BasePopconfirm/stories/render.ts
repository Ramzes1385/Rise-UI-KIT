import type { Meta } from '@storybook/vue3-vite'
import { BaseButton } from '@components/BaseButton'
import BasePopconfirm from '../ui/BasePopconfirm.vue'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const render = (args => ({
	components: { BasePopconfirm, BaseButton },
	setup: () => ({ props: useArgsWithoutSlots(args, []) }),
	template: `
			<BasePopconfirm v-bind="props">
				<BaseButton variant="outline">Снять с публикации</BaseButton>
			</BasePopconfirm>
		`,
})) satisfies Meta<typeof BasePopconfirm>['render']
