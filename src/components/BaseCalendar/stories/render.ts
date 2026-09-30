import type { Meta } from '@storybook/vue3-vite'
import BaseCalendar from '../ui/BaseCalendar.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { date: 'modelValue' }

const template = `
	<BaseCalendar v-bind="args" v-model="date" />
`

export const source = storySource({ template, imports: ['BaseCalendar'], models })

export const render = (args => ({
	components: { BaseCalendar },
	setup: useStorySetup(args, { models, slots: [] }),
	template,
})) satisfies Meta<typeof BaseCalendar>['render']
