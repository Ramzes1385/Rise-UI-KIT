import BasePin from '../ui/BasePin.vue'
import type { Meta } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { code: 'modelValue' }

const template = `
	<BasePin v-bind="args" aria-label="Код из СМС" v-model="code" />
`

export const source = storySource({ template, imports: ['BasePin'], models })

export const render = (args => ({
	components: { BasePin },
	setup: useStorySetup(args, { models }),
	template,
})) satisfies Meta<typeof BasePin>['render']
