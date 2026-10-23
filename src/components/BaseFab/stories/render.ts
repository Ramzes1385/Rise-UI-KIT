import { FRAME } from './shared'
import BaseFab from '../ui/BaseFab.vue'
import type { Meta } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const frame = FRAME

const template = `
	<div :style="frame"><BaseFab v-bind="args" /></div>
`

export const source = storySource({ template, imports: ['BaseFab'], script: `const frame = ${literal(frame)}` })

export const render = (args => ({
	components: { BaseFab },
	setup: useStorySetup(args, { data: { frame }, slots: [] }),
	template,
})) satisfies Meta<typeof BaseFab>['render']
