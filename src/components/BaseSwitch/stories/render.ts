import BaseSwitch from '../ui/BaseSwitch.vue'
import type { Meta } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { enabled: 'modelValue' }

const template = `
	<BaseSwitch v-bind="args" v-model="enabled" />
`

export const source = storySource({ template, imports: ['BaseSwitch'], models })

export const render = (args => ({
	components: { BaseSwitch },
	setup: useStorySetup(args, { models }),
	template,
})) satisfies Meta<typeof BaseSwitch>['render']
