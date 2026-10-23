import type { Meta } from '@storybook/vue3-vite'
import BasePagination from '../ui/BasePagination.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { page: 'modelValue' }

const template = `
	<BasePagination v-bind="args" v-model="page" />
`

export const source = storySource({ template, imports: ['BasePagination'], models })

export const render = (args => ({
	components: { BasePagination },
	setup: useStorySetup(args, { models, slots: ['default'] }),
	template,
})) satisfies Meta<typeof BasePagination>['render']
