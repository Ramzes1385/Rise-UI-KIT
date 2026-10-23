import BaseRadio from '../ui/BaseRadio.vue'
import type { Meta } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { picked: 'modelValue' }

const template = `
	<BaseRadio v-bind="args" v-model="picked" />
`

export const source = storySource({ template, imports: ['BaseRadio'], models })

export const render = (args => ({
	components: { BaseRadio },
	setup: useStorySetup(args, { models }),
	template,
})) satisfies Meta<typeof BaseRadio>['render']
