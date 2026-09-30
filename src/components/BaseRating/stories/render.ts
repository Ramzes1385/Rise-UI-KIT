import BaseRating from '../ui/BaseRating.vue'
import type { Meta } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { rating: 'modelValue' }

const template = `
	<BaseRating v-bind="args" v-model="rating" />
`

export const source = storySource({ template, imports: ['BaseRating'], models })

export const render = (args => ({
	components: { BaseRating },
	setup: useStorySetup(args, { models }),
	template,
})) satisfies Meta<typeof BaseRating>['render']
