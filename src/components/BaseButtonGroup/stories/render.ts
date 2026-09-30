import type { Meta } from '@storybook/vue3-vite'
import { BaseButton } from '@components/BaseButton'
import BaseButtonGroup from '../ui/BaseButtonGroup.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseButtonGroup v-bind="args">
		<BaseButton variant="outline">День</BaseButton>
		<BaseButton variant="outline">Неделя</BaseButton>
		<BaseButton variant="outline">Месяц</BaseButton>
	</BaseButtonGroup>
`

export const source = storySource({ template, imports: ['BaseButtonGroup', 'BaseButton'] })

export const render = (args => ({
	components: { BaseButtonGroup, BaseButton },
	setup: useStorySetup(args, { slots: [] }),
	template,
})) satisfies Meta<typeof BaseButtonGroup>['render']
