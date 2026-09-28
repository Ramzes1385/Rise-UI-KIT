import type { Meta } from '@storybook/vue3-vite'
import { BaseButton } from '@components/BaseButton'
import BaseButtonGroup from '../ui/BaseButtonGroup.vue'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const render = (args => ({
	components: { BaseButtonGroup, BaseButton },
	setup: () => ({ props: useArgsWithoutSlots(args, []) }),
	template: `
			<BaseButtonGroup v-bind="props">
				<BaseButton variant="outline">День</BaseButton>
				<BaseButton variant="outline">Неделя</BaseButton>
				<BaseButton variant="outline">Месяц</BaseButton>
			</BaseButtonGroup>
		`,
})) satisfies Meta<typeof BaseButtonGroup>['render']
