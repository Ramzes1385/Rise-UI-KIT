import type { Meta } from '@storybook/vue3-vite'
import BaseEventCalendar from '../ui/BaseEventCalendar.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

export const models = { view: 'view', date: 'date' }

const template = `
	<BaseEventCalendar v-bind="args" v-model:view="view" v-model:date="date" />
`

export const source = storySource({ template, imports: ['BaseEventCalendar'], models })

export const render = (args => ({
	components: { BaseEventCalendar },
	setup: useStorySetup(args, { models, slots: [] }),
	template,
})) satisfies Meta<typeof BaseEventCalendar>['render']
