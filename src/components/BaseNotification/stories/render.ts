import { remountOnArgs } from './shared'
import type { Meta } from '@storybook/vue3-vite'
import BaseNotification from '../ui/BaseNotification.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseNotification v-bind="args" />
`

export const source = storySource({ template, imports: ['BaseNotification'] })

export const render = (args =>
	remountOnArgs(args, null, {
		components: { BaseNotification },
		setup: useStorySetup(args, { slots: [] }),
		template,
	})) satisfies Meta<typeof BaseNotification>['render']
