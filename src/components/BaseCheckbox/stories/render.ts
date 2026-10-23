import type { Meta } from '@storybook/vue3-vite'
import BaseCheckbox from '../ui/BaseCheckbox.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { checked: 'modelValue' }

const template = `
	<BaseCheckbox v-bind="args" v-model="checked" />
`

export const source = storySource({ template, imports: ['BaseCheckbox'], models })

export const render = (args => ({
	components: { BaseCheckbox },
	setup: useStorySetup(args, { models }),
	template,
})) satisfies Meta<typeof BaseCheckbox>['render']
