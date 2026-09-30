import BaseEditor from '../ui/BaseEditor.vue'
import type { Meta } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { html: 'modelValue' }

const template = `
	<BaseEditor v-bind="args" v-model="html" />
`

export const source = storySource({ template, imports: ['BaseEditor'], models, omit: ['toolbar'] })

export const render = (args => ({
	components: { BaseEditor },
	setup: useStorySetup(args, { models, slots: ['toolbar'] }),
	template,
})) satisfies Meta<typeof BaseEditor>['render']
