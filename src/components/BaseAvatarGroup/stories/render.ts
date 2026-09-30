import type { Meta } from '@storybook/vue3-vite'
import BaseAvatarGroup from '../ui/BaseAvatarGroup.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseAvatarGroup v-bind="args" />
`

export const source = storySource({ template, imports: ['BaseAvatarGroup'] })

export const render = (args => ({
	components: { BaseAvatarGroup },
	setup: useStorySetup(args, { slots: [] }),
	template,
})) satisfies Meta<typeof BaseAvatarGroup>['render']
