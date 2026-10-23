import type { Meta } from '@storybook/vue3-vite'
import { BaseButton } from '@components/BaseButton'
import BasePopconfirm from '../ui/BasePopconfirm.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BasePopconfirm v-bind="args">
		<BaseButton variant="outline">Снять с публикации</BaseButton>
	</BasePopconfirm>
`

export const source = storySource({ template, imports: ['BasePopconfirm', 'BaseButton'] })

export const render = (args => ({
	components: { BasePopconfirm, BaseButton },
	setup: useStorySetup(args, { slots: [] }),
	template,
})) satisfies Meta<typeof BasePopconfirm>['render']
